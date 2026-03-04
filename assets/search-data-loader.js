let cachedIndex = null;
let pendingRequest = null;

export const createSearchDataLoader = ({ indexUrl = '/search-index.json' } = {}) => {
  const load = async () => {
    if (cachedIndex) return cachedIndex;
    if (pendingRequest) return pendingRequest;

    pendingRequest = fetch(indexUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load search index: ${response.status}`);
        return response.json();
      })
      .then((items) => {
        cachedIndex = Array.isArray(items) ? items : [];
        return cachedIndex;
      })
      .finally(() => {
        pendingRequest = null;
      });

    return pendingRequest;
  };

  return { load };
};
