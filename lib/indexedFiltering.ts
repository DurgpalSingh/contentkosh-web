export type DateLike = string | Date | null | undefined;

export type MatchPriorityFn = (titleLowerTrimmed: string, queryLowerTrimmed: string) => number;

/**
 * Match priority semantics (lower is better):
 * 0: exact match
 * 1: prefix match (startsWith)
 * 2: word-prefix match (any word startsWith)
 * 3: substring match (includes)
 * 4: fallback (should not happen if we pre-filter by includes)
 */
export function defaultGetMatchPriority(titleLowerTrimmed: string, queryLowerTrimmed: string): number {
  if (titleLowerTrimmed === queryLowerTrimmed) return 0;
  if (titleLowerTrimmed.startsWith(queryLowerTrimmed)) return 1;
  if (titleLowerTrimmed.split(/\s+/).some((word) => word.startsWith(queryLowerTrimmed))) return 2;
  if (titleLowerTrimmed.includes(queryLowerTrimmed)) return 3;
  return 4;
}

type NGram = string;

function getCreatedAtTime(dateLike: DateLike): number {
  if (!dateLike) return 0;
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const time = d.getTime();
  return Number.isFinite(time) ? time : 0;
}

function getNGrams(valueLowerTrimmed: string, ngramLength: number): NGram[] {
  const grams: NGram[] = [];
  if (valueLowerTrimmed.length < ngramLength) return grams;
  for (let i = 0; i <= valueLowerTrimmed.length - ngramLength; i++) {
    grams.push(valueLowerTrimmed.slice(i, i + ngramLength));
  }
  return grams;
}

function intersectIdSets<Id extends string | number>(a: Set<Id>, b: Set<Id>): Set<Id> {
  if (a.size === 0 || b.size === 0) return new Set<Id>();
  const base = a.size <= b.size ? a : b;
  const other = base === a ? b : a;
  const out = new Set<Id>();
  for (const id of base) {
    if (other.has(id)) out.add(id);
  }
  return out;
}

type IndexedTextFilter<T, Id extends string | number, FacetId extends string | number> = {
  search: (params: { query: string; selectedFacetId?: FacetId }) => T[];
};

export function createIndexedTextFilter<
  T,
  Id extends string | number,
  FacetId extends string | number,
>(items: T[], options: {
  getId: (item: T) => Id | null | undefined;
  getTitle: (item: T) => string | null | undefined;
  getCreatedAt: (item: T) => DateLike;
  getFacetId: (item: T) => FacetId | null | undefined;
  ngramLength?: number;
  /**
   * Reserved for future improvements; candidate retrieval currently prioritizes n-grams.
   * Still built because it can be useful for prefix-optimized retrieval strategies.
   */
  prefixIndexMaxLength?: number;
  getMatchPriority?: MatchPriorityFn;
}): IndexedTextFilter<T, Id, FacetId> {
  const ngramLength = options.ngramLength ?? 3;
  const prefixIndexMaxLength = options.prefixIndexMaxLength ?? Math.max(6, ngramLength - 1);
  const getMatchPriority = options.getMatchPriority ?? defaultGetMatchPriority;

  // Facet indices
  const facetIdsToIds = new Map<FacetId, Set<Id>>();
  const facetIdsToItems = new Map<FacetId, T[]>();

  // Text indices + lookup tables
  const ngramIndex = new Map<NGram, Set<Id>>();
  const prefixIndex = new Map<string, Set<Id>>();

  const titleLowerTrimmedById = new Map<Id, string>();
  const createdAtTimeById = new Map<Id, number>();
  const orderIndexById = new Map<Id, number>();
  const itemById = new Map<Id, T>();

  const allItems: T[] = [];
  const allIds = new Set<Id>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const id = options.getId(item);
    if (id === null || id === undefined) continue;

    allItems.push(item);
    allIds.add(id);
    itemById.set(id, item);
    orderIndexById.set(id, i);

    const titleRaw = options.getTitle(item) ?? '';
    const titleLowerTrimmed = titleRaw.toLowerCase().trim();
    titleLowerTrimmedById.set(id, titleLowerTrimmed);
    createdAtTimeById.set(id, getCreatedAtTime(options.getCreatedAt(item)));

    const facetId = options.getFacetId(item);
    if (facetId !== null && facetId !== undefined) {
      const existingItems = facetIdsToItems.get(facetId) ?? [];
      existingItems.push(item); // preserve original ordering
      facetIdsToItems.set(facetId, existingItems);

      const existingIds = facetIdsToIds.get(facetId) ?? new Set<Id>();
      existingIds.add(id);
      facetIdsToIds.set(facetId, existingIds);
    }

    // Build substring index (fixed n-gram length) for candidate retrieval.
    if (titleLowerTrimmed.length >= ngramLength) {
      const grams = getNGrams(titleLowerTrimmed, ngramLength);
      for (const gram of grams) {
        const bucket = ngramIndex.get(gram) ?? new Set<Id>();
        bucket.add(id);
        ngramIndex.set(gram, bucket);
      }
    }

    // Build prefix index for optional retrieval strategies.
    // It is *not* used to guarantee substring correctness; final results are always confirmed via includes().
    const maxPrefixLen = Math.min(prefixIndexMaxLength, titleLowerTrimmed.length);
    for (let prefixLen = 1; prefixLen <= maxPrefixLen; prefixLen++) {
      const prefix = titleLowerTrimmed.slice(0, prefixLen);
      const bucket = prefixIndex.get(prefix) ?? new Set<Id>();
      bucket.add(id);
      prefixIndex.set(prefix, bucket);
    }
  }

  const search = (params: { query: string; selectedFacetId?: FacetId }): T[] => {
    const queryLowerTrimmed = params.query.trim().toLowerCase();
    const selectedFacetId = params.selectedFacetId;

    if (!queryLowerTrimmed) {
      if (selectedFacetId === undefined) return allItems;
      return facetIdsToItems.get(selectedFacetId) ?? [];
    }

    const scopedIds =
      selectedFacetId === undefined ? allIds : facetIdsToIds.get(selectedFacetId) ?? new Set<Id>();

    if (scopedIds.size === 0) return [];

    let candidateIds: Set<Id>;

    // Candidate retrieval:
    // - For short queries, n-gram indexing is not useful; scan within the scoped set.
    // - For longer queries, use n-grams to reduce the search space.
    if (queryLowerTrimmed.length < ngramLength) {
      candidateIds = new Set<Id>(scopedIds);
    } else {
      const grams = getNGrams(queryLowerTrimmed, ngramLength);
      if (grams.length === 0) return [];

      const buckets = grams.map((g) => ngramIndex.get(g));
      if (buckets.some((b) => !b)) return [];

      const typedBuckets = buckets as Array<Set<Id>>;
      typedBuckets.sort((a, b) => a.size - b.size);

      const narrowed = new Set<Id>(typedBuckets[0]);
      for (let i = 1; i < typedBuckets.length; i++) {
        const bucket = typedBuckets[i];
        if (narrowed.size === 0) break;
        for (const id of narrowed) {
          if (!bucket.has(id)) narrowed.delete(id);
        }
      }

      candidateIds = intersectIdSets(narrowed, scopedIds);
    }

    if (candidateIds.size === 0) return [];

    const ranked: Array<{
      item: T;
      priority: number;
      createdAtTime: number;
      titleLowerTrimmed: string;
      orderIndex: number;
    }> = [];

    for (const id of candidateIds) {
      const item = itemById.get(id);
      if (!item) continue;

      const titleLowerTrimmed = titleLowerTrimmedById.get(id) ?? '';
      if (!titleLowerTrimmed.includes(queryLowerTrimmed)) continue;

      const priority = getMatchPriority(titleLowerTrimmed, queryLowerTrimmed);
      const createdAtTime = createdAtTimeById.get(id) ?? 0;
      const orderIndex = orderIndexById.get(id) ?? 0;

      ranked.push({
        item,
        priority,
        createdAtTime,
        titleLowerTrimmed,
        orderIndex,
      });
    }

    ranked.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const titleCompare = a.titleLowerTrimmed.localeCompare(b.titleLowerTrimmed);
      if (titleCompare !== 0) return titleCompare;
      const createdCompare = b.createdAtTime - a.createdAtTime;
      if (createdCompare !== 0) return createdCompare;
      return a.orderIndex - b.orderIndex;
    });

    return ranked.map((r) => r.item);
  };

  return { search };
}

