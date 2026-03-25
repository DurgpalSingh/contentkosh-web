export type MatchPriorityFn = (titleLowerTrimmed: string, queryLowerTrimmed: string) => number;

export function defaultGetMatchPriority(titleLowerTrimmed: string, queryLowerTrimmed: string): number {
  if (titleLowerTrimmed === queryLowerTrimmed) return 0;
  if (titleLowerTrimmed.startsWith(queryLowerTrimmed)) return 1;
  if (titleLowerTrimmed.split(/\s+/).some((word) => word.startsWith(queryLowerTrimmed))) return 2;
  if (titleLowerTrimmed.includes(queryLowerTrimmed)) return 3;
  return 4;
}

type DateLike = string | Date | null | undefined;

function getCreatedAtTime(dateLike: DateLike): number {
  if (!dateLike) return 0;
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const time = d.getTime();
  return Number.isFinite(time) ? time : 0;
}

function getTrigrams(valueLowerTrimmed: string, trigramLength: number): string[] {
  const grams: string[] = [];
  if (valueLowerTrimmed.length < trigramLength) return grams;
  for (let i = 0; i <= valueLowerTrimmed.length - trigramLength; i++) {
    grams.push(valueLowerTrimmed.slice(i, i + trigramLength));
  }
  return grams;
}

export type TitleTrigramSearchIndex<
  T,
  Id extends string | number,
  SubjectId extends string | number
> = {
  trigramLength: number;
  trigramIndex: Map<string, Set<Id>>;
  rawLowerTitleById: Map<Id, string>;
  trimmedLowerTitleById: Map<Id, string>;
  createdAtTimeById: Map<Id, number>;
  itemById: Map<Id, T>;
  contentsBySubjectId: Map<SubjectId, T[]>;
  contentIdsBySubjectId: Map<SubjectId, Set<Id>>;
  allItems: T[];
};

export function buildTitleTrigramSearchIndex<
  T,
  Id extends string | number,
  SubjectId extends string | number
>(items: T[], options: {
  getId: (item: T) => Id | null | undefined;
  getTitle: (item: T) => string | null | undefined;
  getCreatedAt: (item: T) => DateLike;
  getSubjectId: (item: T) => SubjectId | null | undefined;
  trigramLength?: number;
}): TitleTrigramSearchIndex<T, Id, SubjectId> {
  const trigramLength = options.trigramLength ?? 3;

  const trigramIndex = new Map<string, Set<Id>>();
  const rawLowerTitleById = new Map<Id, string>();
  const trimmedLowerTitleById = new Map<Id, string>();
  const createdAtTimeById = new Map<Id, number>();
  const itemById = new Map<Id, T>();
  const contentsBySubjectId = new Map<SubjectId, T[]>();
  const contentIdsBySubjectId = new Map<SubjectId, Set<Id>>();

  for (const item of items) {
    const id = options.getId(item);
    if (id === null || id === undefined) continue;

    const titleRaw = options.getTitle(item) ?? '';
    const rawLowerTitle = titleRaw.toLowerCase();
    const trimmedLowerTitle = rawLowerTitle.trim();
    const createdAtTime = getCreatedAtTime(options.getCreatedAt(item));
    const subjectId = options.getSubjectId(item);

    rawLowerTitleById.set(id, rawLowerTitle);
    trimmedLowerTitleById.set(id, trimmedLowerTitle);
    createdAtTimeById.set(id, createdAtTime);
    itemById.set(id, item);

    if (subjectId !== null && subjectId !== undefined) {
      const existingItems = contentsBySubjectId.get(subjectId) ?? [];
      existingItems.push(item); // preserve original ordering
      contentsBySubjectId.set(subjectId, existingItems);

      const existingIds = contentIdsBySubjectId.get(subjectId) ?? new Set<Id>();
      existingIds.add(id);
      contentIdsBySubjectId.set(subjectId, existingIds);
    }

    // Use trimmed/lowercased title for both trigram generation and matching,
    // so leading/trailing spaces don't affect results.
    if (trimmedLowerTitle.length < trigramLength) continue;

    const grams = getTrigrams(trimmedLowerTitle, trigramLength);
    for (const gram of grams) {
      const bucket = trigramIndex.get(gram) ?? new Set<Id>();
      bucket.add(id);
      trigramIndex.set(gram, bucket);
    }
  }

  return {
    trigramLength,
    trigramIndex,
    rawLowerTitleById,
    trimmedLowerTitleById,
    createdAtTimeById,
    itemById,
    contentsBySubjectId,
    contentIdsBySubjectId,
    allItems: items,
  };
}

function getCandidateIdsForQuery<Id extends string | number, T, SubjectId extends string | number>(
  index: TitleTrigramSearchIndex<T, Id, SubjectId>,
  queryLowerTrimmed: string
): Set<Id> {
  const { trigramLength, trigramIndex } = index;

  if (queryLowerTrimmed.length < trigramLength) {
    // Trigram index isn't useful for short queries; caller can decide fallback strategy.
    return new Set<Id>();
  }

  const grams = getTrigrams(queryLowerTrimmed, trigramLength);
  if (grams.length === 0) return new Set<Id>();

  const buckets = grams.map((g) => trigramIndex.get(g));
  if (buckets.some((b) => !b)) return new Set<Id>();

  const typedBuckets = buckets as Array<Set<Id>>;
  // Intersect using the smallest bucket as base to reduce operations.
  typedBuckets.sort((a, b) => a.size - b.size);

  const candidateIds = new Set<Id>(typedBuckets[0]);
  for (let i = 1; i < typedBuckets.length; i++) {
    const bucket = typedBuckets[i];
    if (candidateIds.size === 0) break;

    for (const id of candidateIds) {
      if (!bucket.has(id)) candidateIds.delete(id);
    }
  }
  return candidateIds;
}

export function filterTitleTrigramSearchIndex<
  T,
  Id extends string | number,
  SubjectId extends string | number
>(params: {
  index: TitleTrigramSearchIndex<T, Id, SubjectId>;
  query: string;
  selectedSubjectId?: SubjectId;
  getMatchPriority?: MatchPriorityFn;
}): T[] {
  const { index, selectedSubjectId, getMatchPriority = defaultGetMatchPriority } = params;
  const queryLowerTrimmed = params.query.trim().toLowerCase();

  const scopedItems =
    selectedSubjectId !== undefined ? index.contentsBySubjectId.get(selectedSubjectId) ?? [] : index.allItems;

  if (!queryLowerTrimmed) return scopedItems;

  const subjectIdCandidateIds =
    selectedSubjectId !== undefined ? index.contentIdsBySubjectId.get(selectedSubjectId) ?? new Set<Id>() : undefined;

  let candidateIds: Set<Id>;
  const shouldIntersectBySubject =
    selectedSubjectId !== undefined && queryLowerTrimmed.length >= index.trigramLength;

  if (queryLowerTrimmed.length < index.trigramLength) {
    // For short queries, just scan the scoped set (still no full-table scan when subject is selected).
    candidateIds = subjectIdCandidateIds ? new Set<Id>(subjectIdCandidateIds) : new Set<Id>(Array.from(index.itemById.keys()));
  } else {
    candidateIds = getCandidateIdsForQuery<Id, T, SubjectId>(index, queryLowerTrimmed);
    if (candidateIds.size === 0) return [];
  }

  // Restrict by subject in O(min(set)) using Set intersection.
  if (shouldIntersectBySubject && subjectIdCandidateIds) {
    const base = candidateIds.size <= subjectIdCandidateIds.size ? candidateIds : subjectIdCandidateIds;
    const other = base === candidateIds ? subjectIdCandidateIds : candidateIds;

    const intersected = new Set<Id>();
    for (const id of base) {
      if (other.has(id)) intersected.add(id);
    }
    candidateIds = intersected;
  }

  const ranked: Array<{ item: T; priority: number; createdAtTime: number; titleLowerTrimmed: string }> = [];

  for (const id of candidateIds) {
    const item = index.itemById.get(id);
    if (!item) continue;

    const titleLowerTrimmed = index.trimmedLowerTitleById.get(id) ?? '';
    if (!titleLowerTrimmed.includes(queryLowerTrimmed)) continue;
    const createdAtTime = index.createdAtTimeById.get(id) ?? 0;

    ranked.push({
      item,
      priority: getMatchPriority(titleLowerTrimmed, queryLowerTrimmed),
      createdAtTime,
      titleLowerTrimmed,
    });
  }

  ranked.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const titleCompare = a.titleLowerTrimmed.localeCompare(b.titleLowerTrimmed);
    if (titleCompare !== 0) return titleCompare;
    return b.createdAtTime - a.createdAtTime;
  });

  return ranked.map((r) => r.item);
}

