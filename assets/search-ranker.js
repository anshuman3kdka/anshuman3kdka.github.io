const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'with']);

export const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const tokenize = (value) => normalizeText(value)
  .split(' ')
  .filter((token) => token.length > 1 && !stopWords.has(token));

const includesPrefix = (tokens, queryToken) => tokens.some((token) => token.startsWith(queryToken));

const includesNearPrefix = (tokens, queryToken) => {
  if (queryToken.length < 4) return false;
  const shorter = queryToken.slice(0, -1);
  return tokens.some((token) => token.startsWith(shorter));
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

  const ranked = records
    .map((record) => {
      let score = 0;
      let matchedTerms = 0;

      const titleTokens = Array.isArray(record.titleTokens) ? record.titleTokens : [];
      const categoryTokens = Array.isArray(record.categoryTokens) ? record.categoryTokens : [];
      const tagTokens = Array.isArray(record.tagTokens) ? record.tagTokens : [];
      const excerptTokens = Array.isArray(record.excerptTokens) ? record.excerptTokens : [];

      if (record.titleNormalized === normalizedQuery) score += 120;
      if (record.titleNormalized?.startsWith(normalizedQuery)) score += 90;

      terms.forEach((term) => {
        let termMatched = false;

        if (titleTokens.includes(term)) {
          score += 24;
          termMatched = true;
        } else if (includesPrefix(titleTokens, term)) {
          score += 18;
          termMatched = true;
        } else if (includesNearPrefix(titleTokens, term)) {
          score += 12;
          termMatched = true;
        }

        if (tagTokens.includes(term) || categoryTokens.includes(term)) {
          score += 14;
          termMatched = true;
        } else if (includesPrefix(tagTokens, term) || includesPrefix(categoryTokens, term)) {
          score += 10;
          termMatched = true;
        }

        if (excerptTokens.includes(term)) {
          score += 8;
          termMatched = true;
        } else if (includesPrefix(excerptTokens, term)) {
          score += 4;
          termMatched = true;
        }

        if (termMatched) matchedTerms += 1;
      });

      if (matchedTerms === terms.length) score += 30;

      return {
        ...record,
        score,
        matchedTerms,
        dateValue: dateScore(record.date),
      };
    })
    .filter((record) => record.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.matchedTerms !== a.matchedTerms) return b.matchedTerms - a.matchedTerms;
      return b.dateValue - a.dateValue;
    });

  return ranked;
};
