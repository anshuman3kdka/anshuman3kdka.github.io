import { createSearchDataLoader } from './search-data-loader.js';
import { rankSearchResults } from './search-ranker.js';
import { renderSearchState } from './search-renderer.js';

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 20;
const DEBOUNCE_MS = 120;

const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
};

const readQueryFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') ?? '';
};

const updateUrlQuery = (rawValue) => {
  const nextValue = rawValue.trim();
  const url = new URL(window.location.href);

  if (nextValue) {
    url.searchParams.set('q', nextValue);
  } else {
    url.searchParams.delete('q');
  }

  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
};

const isValidQuery = (value) => value.trim().length >= MIN_QUERY_LENGTH;

const initResultKeyboardNavigation = (input, list) => {
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown') return;

    const links = list.querySelectorAll('.search-result-link');
    if (!links.length) return;

    event.preventDefault();
    links[0].focus();
  });

  list.addEventListener('keydown', (event) => {
    const links = Array.from(list.querySelectorAll('.search-result-link'));
    if (!links.length) return;

    const currentIndex = links.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = Math.min(currentIndex + 1, links.length - 1);
      links[nextIndex].focus();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (currentIndex === 0) {
        input.focus();
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

  if (!input || !list || !liveRegion) return;

  const loader = createSearchDataLoader();
  let records = null;

  const ensureLoaded = async () => {
    if (records) return records;
    records = await loader.load();
    return records;
  };

  const runSearch = async () => {
    const query = input.value.trim();

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
  };

  const debouncedSearch = debounce(() => {
    runSearch().catch(() => {
      renderSearchState({
        listElement: list,
        liveRegion,
        message: 'Search is temporarily unavailable.',
      });
    });
  }, DEBOUNCE_MS);

  input.addEventListener('focus', () => {
    ensureLoaded().catch(() => {
      // Ignore eager-load failure until user types.
    });
  }, { once: true });

  input.addEventListener('input', () => {
    updateUrlQuery(input.value);
    debouncedSearch();
  });
  initResultKeyboardNavigation(input, list);

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      input.blur();
    });
  }

  const initialQuery = readQueryFromUrl();
  input.value = initialQuery;

  if (isValidQuery(initialQuery)) {
    runSearch().catch(() => {
      renderSearchState({
        listElement: list,
        liveRegion,
        message: 'Search is temporarily unavailable.',
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
