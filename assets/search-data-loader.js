import { tokenize, normalizeText } from './search-ranker.js';

let cachedIndex = null;
let pendingRequest = null;

const dedupeTokens = (tokens) => [...new Set(tokens)];

const buildPrefixBuckets = (tokens) => {
  const prefixes3 = new Map();
  const prefixes4 = new Map();

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.length >= 3) {
      const key3 = token.slice(0, 3);
      const bucket3 = prefixes3.get(key3);
      if (bucket3) bucket3.push(token);
      else prefixes3.set(key3, [token]);
    }

    if (token.length >= 4) {
      const key4 = token.slice(0, 4);
      const bucket4 = prefixes4.get(key4);
      if (bucket4) bucket4.push(token);
      else prefixes4.set(key4, [token]);
    }
  }

  return { prefixes3, prefixes4 };
};

const processIndexItems = (items) => items.map((item) => {
  const title = String(item.title || '');
  const category = String(item.category || '');
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const excerpt = String(item.excerpt || '');

  const titleTokens = dedupeTokens(tokenize(title));
  const categoryTokens = dedupeTokens(tokenize(category));
  const tagTokens = dedupeTokens(tokenize(tags.join(' ')));
  const excerptTokens = dedupeTokens(tokenize(excerpt));

  return {
    ...item,
    titleTokens,
    categoryTokens,
    tagTokens,
    excerptTokens,
    titleTokenSet: new Set(titleTokens),
    categoryTokenSet: new Set(categoryTokens),
    tagTokenSet: new Set(tagTokens),
    excerptTokenSet: new Set(excerptTokens),
    titlePrefixBuckets: buildPrefixBuckets(titleTokens),
    categoryPrefixBuckets: buildPrefixBuckets(categoryTokens),
    tagPrefixBuckets: buildPrefixBuckets(tagTokens),
    excerptPrefixBuckets: buildPrefixBuckets(excerptTokens),
    titleNormalized: normalizeText(title),
  };
});

export const createSearchDataLoader = ({ indexUrl } = {}) => {
  const resolvedIndexUrl = indexUrl || '/search-index.json';
  const load = async () => {
    if (cachedIndex) return cachedIndex;
    if (pendingRequest) return pendingRequest;

    pendingRequest = fetch(resolvedIndexUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load search index: ${response.status}`);
        return response.json();
      })
      .then((items) => {
        const rawItems = Array.isArray(items) ? items : [];
        cachedIndex = processIndexItems(rawItems);
        return cachedIndex;
      })
      .finally(() => {
        pendingRequest = null;
      });

    return pendingRequest;
  };

  return { load };
};
