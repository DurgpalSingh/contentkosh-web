export type DateLike = string | Date | null | undefined;

type FacetPrimitive = string | number;

export type MatchPriorityFn = (
  titleLowerTrimmed: string,
  titleWordsLowerTrimmed: readonly string[],
  queryLowerTrimmed: string,
) => number;

/**
 * Match priority semantics (lower is better):
 * 0: exact match
 * 1: prefix match (startsWith)
 * 2: word-prefix match (any word startsWith)
 * 3: substring match (includes)
 * 4: fallback (should not happen if we pre-filter by includes)
 */
export function defaultGetMatchPriority(titleLowerTrimmed: string, queryLowerTrimmed: string): number {
  return defaultGetMatchPriorityWithWords(
    titleLowerTrimmed,
    titleLowerTrimmed.split(/\s+/).filter(Boolean),
    queryLowerTrimmed,
  );
}

/**
 * Match priority using pre-tokenized title words.
 * Lower values represent stronger matches.
 */
export function defaultGetMatchPriorityWithWords(
  titleLowerTrimmed: string,
  titleWordsLowerTrimmed: readonly string[],
  queryLowerTrimmed: string,
): number {
  if (titleLowerTrimmed === queryLowerTrimmed) return 0;
  if (titleLowerTrimmed.startsWith(queryLowerTrimmed)) return 1;
  if (titleWordsLowerTrimmed.some((word) => word.startsWith(queryLowerTrimmed))) return 2;
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

function addNGramsToIndex<Id extends string | number>(
  ngramIndex: Map<NGram, Set<Id>>,
  valueLowerTrimmed: string,
  ngramLength: number,
  id: Id,
): void {
  if (valueLowerTrimmed.length < ngramLength) return;
  const grams = getNGrams(valueLowerTrimmed, ngramLength);
  for (const gram of grams) {
    const bucket = ngramIndex.get(gram) ?? new Set<Id>();
    bucket.add(id);
    ngramIndex.set(gram, bucket);
  }
}

function intersectIdSets<Id extends string | number>(a: ReadonlySet<Id>, b: ReadonlySet<Id>): Set<Id> {
  if (a.size === 0 || b.size === 0) return new Set();
  const base = a.size <= b.size ? a : b;
  const other = base === a ? b : a;
  const out = new Set<Id>();
  for (const id of base) {
    if (other.has(id)) out.add(id);
  }
  return out;
}

export type IndexedFilter<T, Facets extends Record<string, FacetPrimitive>> = {
  /**
   * Filters the indexed item set using title query and exact-match facet values.
   */
  filter: (params: IndexedFilterParams<Facets>) => T[];
};

/**
 * Runtime filter parameters.
 * - `query` is normalized (trim + lowercase) and matched using `includes`.
 * - `selectedFacets` uses AND semantics across provided facet keys.
 */
export type IndexedFilterParams<Facets extends Record<string, FacetPrimitive>> = {
  query: string;
  selectedFacets?: Partial<{ [K in keyof Facets]: Facets[K] | null | undefined }>;
};

/**
 * Configuration for `createIndexedTextFilter`.
 * Keep this shape reusable so pages can pass title + facet getters without adapter code.
 */
export type IndexedFilterConfig<
  T,
  Id extends string | number,
  Facets extends Record<string, FacetPrimitive>,
> = {
  getId: (item: T) => Id | null | undefined;
  getSearchText: (item: T) => string | null | undefined;
  getCreatedAt: (item: T) => DateLike;
  getFacetValues?: (item: T, id: Id) => ReadonlyArray<readonly [Id, keyof Facets, Facets[keyof Facets]]>;
  ngramLength?: number;
  getMatchPriority?: MatchPriorityFn;
};

/**
 * Creates a reusable in-memory indexed filter for title query + exact-match facets.
 * Query matching semantics are case-insensitive and trimmed, and only match `getSearchText`.
 */
export function createIndexedTextFilter<
  T,
  Id extends string | number,
  Facets extends Record<string, FacetPrimitive> = Record<never, never>,
>(items: readonly T[], options: IndexedFilterConfig<T, Id, Facets>): IndexedFilter<T, Facets> {
  const ngramLength = options.ngramLength ?? 3;
  const getMatchPriority = options.getMatchPriority ?? defaultGetMatchPriorityWithWords;
  const getFacetValues = options.getFacetValues;

  const ngramIndex = new Map<NGram, Set<Id>>();
  const facetIndexes = new Map<keyof Facets, Map<Facets[keyof Facets], Set<Id>>>();

  const titleLowerTrimmedById = new Map<Id, string>();
  const titleWordsLowerTrimmedById = new Map<Id, readonly string[]>();
  const createdAtTimeById = new Map<Id, number>();
  const orderIndexById = new Map<Id, number>();
  const itemById = new Map<Id, T>();

  const allOrderedIds: Id[] = [];
  const allIds = new Set<Id>();
  const facetIndexEntries: Array<readonly [Id, keyof Facets, Facets[keyof Facets]]> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const id = options.getId(item);
    if (id === null || id === undefined) continue;

    allOrderedIds.push(id);
    allIds.add(id);
    itemById.set(id, item);
    orderIndexById.set(id, i);

    const titleRaw = options.getSearchText(item) ?? '';
    const titleLowerTrimmed = titleRaw.toLowerCase().trim();
    const titleWordsLowerTrimmed = titleLowerTrimmed.split(/\s+/).filter(Boolean);
    titleLowerTrimmedById.set(id, titleLowerTrimmed);
    titleWordsLowerTrimmedById.set(id, titleWordsLowerTrimmed);
    createdAtTimeById.set(id, getCreatedAtTime(options.getCreatedAt(item)));

    if (getFacetValues) {
      const facetValues = getFacetValues(item, id);
      if (facetValues.length > 0) facetIndexEntries.push(...facetValues);
    }

    addNGramsToIndex(ngramIndex, titleLowerTrimmed, ngramLength, id);
  }

  if (facetIndexEntries.length > 0) {
    for (const [id, facetKey, facetValue] of facetIndexEntries) {
      if (facetValue === null || facetValue === undefined) continue;
      const facetValueToIds =
        facetIndexes.get(facetKey) ?? new Map<Facets[keyof Facets], Set<Id>>();
      const idsForFacetValue = facetValueToIds.get(facetValue) ?? new Set<Id>();
      idsForFacetValue.add(id);
      facetValueToIds.set(facetValue, idsForFacetValue);
      facetIndexes.set(facetKey, facetValueToIds);
    }
  }

  const filter = (params: IndexedFilterParams<Facets>): T[] => {
    const queryLowerTrimmed = params.query.trim().toLowerCase();
    const selectedFacets = params.selectedFacets;

    let scopedIds: ReadonlySet<Id> = allIds;
    if (selectedFacets) {
      for (const facetKey of Object.keys(selectedFacets) as Array<keyof Facets>) {
        const selectedFacetValue = selectedFacets[facetKey];
        if (selectedFacetValue === null || selectedFacetValue === undefined) continue;

        const facetValueToIds = facetIndexes.get(facetKey);
        const idsForFacet = facetValueToIds?.get(selectedFacetValue);
        if (!idsForFacet) {
          scopedIds = new Set<Id>();
          break;
        }

        scopedIds = intersectIdSets(scopedIds, idsForFacet);
        if (scopedIds.size === 0) break;
      }
    }

    if (scopedIds.size === 0) return [];
    if (!queryLowerTrimmed) {
      const scopedItems: T[] = [];
      for (const id of allOrderedIds) {
        if (!scopedIds.has(id)) continue;
        const item = itemById.get(id);
        if (item) scopedItems.push(item);
      }
      return scopedItems;
    }

    let candidateIds: ReadonlySet<Id>;

    if (queryLowerTrimmed.length < ngramLength) {
      candidateIds = scopedIds;
    } else {
      const grams = [...new Set(getNGrams(queryLowerTrimmed, ngramLength))];
      if (grams.length === 0) return [];

      const buckets = grams.map((g) => ngramIndex.get(g));
      if (buckets.some((b) => !b)) return [];

      const typedBuckets = buckets as Array<Set<Id>>;
      typedBuckets.sort((a, b) => a.size - b.size);

      const smallestBucket = typedBuckets[0];
      const remainingBuckets = typedBuckets.slice(1);

      const narrowed = new Set<Id>();
      for (const id of smallestBucket) {
        if (!scopedIds.has(id)) continue;
        let isInAllBuckets = true;
        for (const bucket of remainingBuckets) {
          if (!bucket.has(id)) {
            isInAllBuckets = false;
            break;
          }
        }
        if (isInAllBuckets) narrowed.add(id);
      }

      candidateIds = narrowed;
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
      const titleWordsLowerTrimmed = titleWordsLowerTrimmedById.get(id) ?? [];
      if (!titleLowerTrimmed.includes(queryLowerTrimmed)) continue;

      const priority = getMatchPriority(titleLowerTrimmed, titleWordsLowerTrimmed, queryLowerTrimmed);
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

    const compareRank = (a: typeof ranked[0], b: typeof ranked[0]) =>  a.priority - b.priority || a.titleLowerTrimmed.localeCompare(b.titleLowerTrimmed) || a.orderIndex - b.orderIndex;
    ranked.sort(compareRank);

    return ranked.map((r) => r.item);
  };

  return { filter };
}

