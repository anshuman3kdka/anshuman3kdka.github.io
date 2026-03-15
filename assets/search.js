import { createSearchDataLoader } from './search-data-loader.js';
import { rankSearchResults } from './search-ranker.js';
import { renderSearchState } from './search-renderer.js';

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 20;
const DEBOUNCE_MS = 120;

const SEARCH_ERROR_MESSAGE = 'Search is temporarily unavailable.';

const isValidQuery = (query) => String(query || '').trim().length >= MIN_QUERY_LENGTH;

const readQueryFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return (params.get('q') || '').trim();
};

const writeQueryToUrl = (query) => {
  const params = new URLSearchParams(window.location.search);
  const trimmedQuery = String(query || '').trim();

  if (trimmedQuery) params.set('q', trimmedQuery);
  else params.delete('q');

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', nextUrl);
};

const buildSearchFailureState = (error) => {
  const code = error?.code || 'search_unknown_failure';
  const liveRegionMessageByCode = {
    index_fetch_failed: 'Search is temporarily unavailable. Please try again in a little while.',
    index_parse_failed: 'Search is temporarily unavailable right now. Please try again shortly.',
    search_unknown_failure: 'Search is temporarily unavailable.',
  };

  return {
    message: SEARCH_ERROR_MESSAGE,
    liveRegionMessage: liveRegionMessageByCode[code] || liveRegionMessageByCode.search_unknown_failure,
    debugCode: code,
  };
};

const debounce = (fn, delay) => {
  let timer = null;

  const debounced = (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };

  debounced.cancel = () => {
    window.clearTimeout(timer);
    timer = null;
  };

  return debounced;
};

const initResultKeyboardNavigation = (input, list, { wrapAround = false } = {}) => {
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const links = list.querySelectorAll('.search-result-link');
    if (!links.length) return;

    event.preventDefault();
    if (event.key === 'ArrowDown') {
      links[0].focus();
      return;
    }

    links[links.length - 1].focus();
  });

  list.addEventListener('keydown', (event) => {
    const links = Array.from(list.querySelectorAll('.search-result-link'));
    if (!links.length) return;

    const currentIndex = links.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = wrapAround
        ? (currentIndex + 1) % links.length
        : Math.min(currentIndex + 1, links.length - 1);
      links[nextIndex].focus();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (currentIndex === 0) {
        if (wrapAround) {
          links[links.length - 1].focus();
        } else {
          input.focus();
        }
      } else {
        links[currentIndex - 1].focus();
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      input.focus();
    }
  });
};

const initSearchPage = () => {
  const input = document.querySelector('[data-search-input]');
  const list = document.querySelector('[data-search-results]');
  const liveRegion = document.querySelector('[data-search-live]');
  const form = document.querySelector('[data-search-form]');
  const wrapResultNavigation = form?.dataset.searchWrapAround === 'true';

  if (!input || !list || !liveRegion) return;

  const indexUrl = input.dataset.searchIndexUrl;
  const loader = createSearchDataLoader({ indexUrl });
  let records = null;

  const ensureLoaded = async () => {
    if (records) return records;
    records = await loader.load();
    return records;
  };

  const runSearch = async () => {
    input.setAttribute('aria-busy', 'true');
    try {
      const query = input.value.trim();
      writeQueryToUrl(query);

      if (!isValidQuery(query)) {
        renderSearchState({
          listElement: list,
          liveRegion,
          message: 'Type at least 2 letters to search.',
        });
        return;
      }

      const searchData = await ensureLoaded();
      const ranked = rankSearchResults(searchData, query).slice(0, MAX_RESULTS);

      if (!ranked.length) {
        renderSearchState({
          listElement: list,
          liveRegion,
          message: 'No matches found. Try a shorter or different keyword.',
        });
        return;
      }

      renderSearchState({
        listElement: list,
        liveRegion,
        results: ranked,
      });
    } finally {
      input.removeAttribute('aria-busy');
    }
  };

  const performSearch = () => {
    runSearch().catch((error) => {
      console.error('Search failed', error);
      renderSearchState({
        listElement: list,
        liveRegion,
        ...buildSearchFailureState(error),
      });
    });
  };

  const debouncedSearch = debounce(performSearch, DEBOUNCE_MS);

  input.addEventListener('focus', () => {
    ensureLoaded().catch((error) => {
      console.error('Search failed', error);
      // Ignore eager-load failure until user types.
    });
  }, { once: true });

  input.addEventListener('input', debouncedSearch);
  initResultKeyboardNavigation(input, list, { wrapAround: wrapResultNavigation });

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      debouncedSearch.cancel();
      await runSearch().catch((error) => {
        console.error('Search failed', error);
        renderSearchState({
          listElement: list,
          liveRegion,
          ...buildSearchFailureState(error),
        });
      });
      input.blur();
    });
  }

  const initialQuery = readQueryFromUrl();
  input.value = initialQuery;

  if (isValidQuery(initialQuery)) {
    runSearch().catch((error) => {
      console.error('Search failed', error);
      renderSearchState({
        listElement: list,
        liveRegion,
        ...buildSearchFailureState(error),
      });
    });
    return;
  }

  renderSearchState({
    listElement: list,
    liveRegion,
    message: 'Type at least 2 letters to search.',
  });
};

document.addEventListener('DOMContentLoaded', initSearchPage);
