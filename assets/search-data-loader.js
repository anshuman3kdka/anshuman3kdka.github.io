import { tokenize, normalizeText } from './search-ranker.js';

let cachedIndex = null;
let pendingRequest = null;

const dedupeTokens = (tokens) => [...new Set(tokens)];

const processIndexItems = (items) => items.map((item) => {
  const title = String(item.title || '');
  const category = String(item.category || '');
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const excerpt = String(item.excerpt || '');

  return {
    ...item,
    titleTokens: dedupeTokens(tokenize(title)),
    categoryTokens: dedupeTokens(tokenize(category)),
    tagTokens: dedupeTokens(tokenize(tags.join(' '))),
    excerptTokens: dedupeTokens(tokenize(excerpt)),
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
