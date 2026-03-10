const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'with']);
const emptySet = new Set();
const emptyPrefixes = { prefixes3: new Map(), prefixes4: new Map() };

export const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const tokenize = (value) => normalizeText(value)
  .split(' ')
  .filter((token) => token.length > 1 && !stopWords.has(token));

const getPrefixCandidates = (prefixBuckets, queryToken) => {
  if (!prefixBuckets || queryToken.length < 3) return [];
  if (queryToken.length >= 4) return prefixBuckets.prefixes4.get(queryToken.slice(0, 4)) || [];
  return prefixBuckets.prefixes3.get(queryToken.slice(0, 3)) || [];
};

const includesPrefix = (tokenSet, prefixBuckets, queryToken) => {
  if (tokenSet?.has(queryToken)) return true;
  if (queryToken.length < 3) return false;

  const candidates = getPrefixCandidates(prefixBuckets, queryToken);
  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i].startsWith(queryToken)) return true;
  }
  return false;
};

const includesNearPrefix = (prefixBuckets, queryToken) => {
  if (queryToken.length < 4) return false;
  const shorter = queryToken.slice(0, -1);
  const candidates = getPrefixCandidates(prefixBuckets, shorter);

  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i].startsWith(shorter)) return true;
  }

  return false;
};

const dateScore = (dateString) => {
  if (!dateString) return 0;
  const timestamp = Date.parse(dateString);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const rankSearchResults = (records, query) => {
  const normalizedQuery = normalizeText(query);
  const terms = tokenize(normalizedQuery);

  if (terms.length === 0) return [];

  // ⚡ Bolt: Use a single for loop instead of map().filter() chains to prevent allocating
  // objects for unranked records and avoid an entire array iteration, reducing GC overhead.
  const ranked = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    let score = 0;
    let matchedTerms = 0;

    const titleTokenSet = record.titleTokenSet instanceof Set ? record.titleTokenSet : emptySet;
    const categoryTokenSet = record.categoryTokenSet instanceof Set ? record.categoryTokenSet : emptySet;
    const tagTokenSet = record.tagTokenSet instanceof Set ? record.tagTokenSet : emptySet;
    const excerptTokenSet = record.excerptTokenSet instanceof Set ? record.excerptTokenSet : emptySet;
    const titlePrefixBuckets = record.titlePrefixBuckets || emptyPrefixes;
    const categoryPrefixBuckets = record.categoryPrefixBuckets || emptyPrefixes;
    const tagPrefixBuckets = record.tagPrefixBuckets || emptyPrefixes;
    const excerptPrefixBuckets = record.excerptPrefixBuckets || emptyPrefixes;

    if (record.titleNormalized === normalizedQuery) score += 120;
    if (record.titleNormalized?.startsWith(normalizedQuery)) score += 90;

    // ⚡ Bolt: Replace forEach with standard for loop to avoid closure allocations
    for (let j = 0; j < terms.length; j++) {
      const term = terms[j];
      let termMatched = false;

      if (titleTokenSet.has(term)) {
        score += 24;
        termMatched = true;
      } else if (includesPrefix(titleTokenSet, titlePrefixBuckets, term)) {
        score += 18;
        termMatched = true;
      } else if (includesNearPrefix(titlePrefixBuckets, term)) {
        score += 12;
        termMatched = true;
      }

      if (tagTokenSet.has(term) || categoryTokenSet.has(term)) {
        score += 14;
        termMatched = true;
      } else if (includesPrefix(tagTokenSet, tagPrefixBuckets, term) || includesPrefix(categoryTokenSet, categoryPrefixBuckets, term)) {
        score += 10;
        termMatched = true;
      }

      if (excerptTokenSet.has(term)) {
        score += 8;
        termMatched = true;
      } else if (includesPrefix(excerptTokenSet, excerptPrefixBuckets, term)) {
        score += 4;
        termMatched = true;
      }

      if (termMatched) matchedTerms += 1;
    }

    if (matchedTerms === terms.length) score += 30;

    if (score > 0 && matchedTerms === terms.length) {
      ranked.push({
        ...record,
        score,
        matchedTerms,
        dateValue: dateScore(record.date),
      });
    }
  }

  return ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.matchedTerms !== a.matchedTerms) return b.matchedTerms - a.matchedTerms;
    return b.dateValue - a.dateValue;
  });
};
