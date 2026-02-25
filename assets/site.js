const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pageTransitionListenerAttached = false;
let revealObserver = null;

const resetNavigationState = () => {
  document.body.classList.remove("is-loading", "is-leaving", "search-active");
  document.body.classList.add("is-loaded");
};

const resetTransientUiState = () => {
  document.body.classList.remove("search-active");

  const overlay = document.querySelector('[data-search-overlay]');
  if (overlay) {
    overlay.classList.remove('is-open');
    overlay.hidden = true;
  }

  const siteShell = document.querySelector('.site-shell');
  siteShell?.removeAttribute('aria-hidden');
};

const isNavigableDocumentLink = (link, href) => {
  if (!href) return false;

  const normalizedHref = href.trim().toLowerCase();
  if (!normalizedHref || normalizedHref.startsWith('#') || normalizedHref.startsWith('mailto:') || normalizedHref.startsWith('tel:')) {
    return false;
  }

  if (link.target === "_blank" || link.hasAttribute("download") || link.getAttribute("rel")?.includes('external')) {
    return false;
  }

  const isExternal = normalizedHref.startsWith('http://') || normalizedHref.startsWith('https://');
  if (isExternal) {
    const targetUrl = new URL(href, window.location.origin);
    if (targetUrl.origin !== window.location.origin) return false;
  }

  const path = normalizedHref.split('?')[0].split('#')[0];
  const extensionMatch = path.match(/\.([a-z0-9]+)$/i);
  if (!extensionMatch) return true;

  return extensionMatch[1] === 'html';
};

const handlePageTransitionClick = (event) => {
  if (document.body.classList.contains("is-leaving")) return;
  if (event.defaultPrevented) return;
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!isNavigableDocumentLink(link, href)) return;

  event.preventDefault();
  document.body.classList.add("is-leaving");
  setTimeout(() => {
    window.location.href = href;
  }, 180);
};

const handlePageTransitions = () => {
  if (prefersReducedMotion) {
    resetNavigationState();
  } else {
    requestAnimationFrame(resetNavigationState);
  }

  if (!pageTransitionListenerAttached) {
    document.addEventListener("click", handlePageTransitionClick);
    pageTransitionListenerAttached = true;
  }
};

const handleScrollReveal = () => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const markVisible = () => {
    items.forEach((item) => {
      item.classList.add("is-visible");
      item.style.transitionDelay = "0ms";
    });
  };

  if (prefersReducedMotion) {
    markVisible();
    return;
  }

  if (typeof IntersectionObserver !== 'function') {
    markVisible();
    return;
  }

  if (revealObserver) {
    revealObserver.disconnect();
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 80, 320)}ms`;
    revealObserver.observe(item);
  });
};

const randomizeFavoriteQuotes = () => {
  const quoteGrid = document.querySelector('[data-quote-grid]');
  if (!quoteGrid) return;

  const quoteCards = Array.from(quoteGrid.querySelectorAll('[data-quote-card]'));
  if (quoteCards.length <= 1) return;

  const desiredCount = Number.parseInt(quoteGrid.dataset.quoteCount || `${quoteCards.length}`, 10);
  const visibleCount = Number.isFinite(desiredCount)
    ? Math.max(1, Math.min(desiredCount, quoteCards.length))
    : quoteCards.length;

  const shuffledCards = [...quoteCards]
    .map((card) => ({ card, sortValue: Math.random() }))
    .sort((a, b) => a.sortValue - b.sortValue)
    .map(({ card }) => card);

  quoteGrid.innerHTML = '';
  shuffledCards.slice(0, visibleCount).forEach((card) => {
    quoteGrid.append(card);
  });
};

// Search functionality
let searchData = null;
let searchInitialized = false;

const initSearch = () => {
  const toggle = document.querySelector('[data-search-toggle]');
  const overlay = document.querySelector('[data-search-overlay]');
  const panel = document.querySelector('[data-search-panel]');
  const close = document.querySelector('[data-search-close]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const categoryFilter = document.querySelector('[data-search-category]');
  const sortSelect = document.querySelector('[data-search-sort]');
  const siteShell = document.querySelector('.site-shell');
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let previouslyFocused = null;
  let removeTrapListener = null;

  if (!toggle || !overlay || !panel || !close || !input || !results || !status || !categoryFilter || !sortSelect) return;

  if (searchInitialized) return;
  searchInitialized = true;

  const normalizeDate = (value) => {
    if (!value) return 0;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const splitSentences = (textValue) => {
    if (!textValue) return [];
    return textValue
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  };

  const escapeHtml = (value = '') => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const firstMatchingSnippet = (hit, query) => {
    if (!query) return (hit.content || '').slice(0, 170);
    const normalizedQuery = query.toLowerCase();
    const source = [hit.content, hit.title].find((value) => typeof value === 'string' && value.trim()) || '';
    const sentences = splitSentences(source);
    const matchedSentence = sentences.find((sentence) => sentence.toLowerCase().includes(normalizedQuery));

    if (matchedSentence) return matchedSentence;

    const words = normalizedQuery.split(/\s+/).filter(Boolean);
    const fallback = sentences.find((sentence) => words.some((word) => sentence.toLowerCase().includes(word)));
    return fallback || source.slice(0, 170);
  };

  const scoreHit = (hit, query) => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return 0;

    const title = (hit.title || '').toLowerCase();
    const content = (hit.content || '').toLowerCase();
    const category = (hit.category || '').toLowerCase();
    const tags = Array.isArray(hit.tags) ? hit.tags.join(' ').toLowerCase() : '';

    let score = 0;
    terms.forEach((term) => {
      if (title.includes(term)) score += 6;
      if (category.includes(term)) score += 4;
      if (tags.includes(term)) score += 3;
      if (content.includes(term)) score += 2;
    });

    if (title.includes(query)) score += 10;
    if (content.includes(query)) score += 5;

    return score;
  };

  const syncExpandedState = (isOpen) => {
    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  const setPageContentHidden = (isHidden) => {
    if (!siteShell) return;
    if (isHidden) {
      siteShell.setAttribute('aria-hidden', 'true');
    } else {
      siteShell.removeAttribute('aria-hidden');
    }
  };

  const addFocusTrap = () => {
    const handleTabTrap = (event) => {
      if (event.key !== 'Tab' || !overlay.classList.contains('is-open')) return;

      const focusableElements = panel.querySelectorAll(focusableSelector);
      if (!focusableElements.length) {
        event.preventDefault();
        input.focus();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener('keydown', handleTabTrap);
    return () => document.removeEventListener('keydown', handleTabTrap);
  };

  const populateCategories = () => {
    const categories = new Set((searchData || []).map((item) => item.category).filter(Boolean));
    categoryFilter.innerHTML = '<option value="all">All categories</option>';

    [...categories]
      .sort((a, b) => a.localeCompare(b))
      .forEach((category) => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.append(option);
      });
  };

  const renderResults = () => {
    if (!searchData) return;

    const query = input.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const sortBy = sortSelect.value;

    const filtered = searchData
      .map((item) => ({
        ...item,
        _score: scoreHit(item, query),
      }))
      .filter((item) => {
        const queryMatches = !query
          || item._score > 0
          || (item.tags || []).some((tag) => String(tag).toLowerCase().includes(query));

        const categoryMatches = selectedCategory === 'all' || item.category === selectedCategory;
        return queryMatches && categoryMatches;
      });

    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return normalizeDate(b.date || b.lastModified) - normalizeDate(a.date || a.lastModified);
      }

      if (b._score !== a._score) return b._score - a._score;
      return normalizeDate(b.date || b.lastModified) - normalizeDate(a.date || a.lastModified);
    });

    const hits = filtered.slice(0, 40);
    results.innerHTML = '';

    if (!hits.length) {
      status.textContent = 'No results found.';
      return;
    }

    status.textContent = `${hits.length} result${hits.length !== 1 ? 's' : ''} found.`;

    hits.forEach((hit) => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      const title = document.createElement('div');
      const meta = document.createElement('div');
      const snippet = document.createElement('p');

      link.setAttribute('href', hit.url || '#');

      title.classList.add('search-result-title');
      title.textContent = hit.title || 'Untitled';

      const dateValue = hit.date || hit.lastModified;
      const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) : 'No date';
      const tagList = (hit.tags || []).slice(0, 3);
      const tagText = tagList.length ? ` · ${tagList.join(', ')}` : '';
      meta.classList.add('search-result-meta');
      meta.textContent = `${hit.category || 'Page'} · ${formattedDate}${tagText}`;

      snippet.classList.add('search-result-snippet');
      snippet.innerHTML = escapeHtml(firstMatchingSnippet(hit, query));

      link.append(title, meta, snippet);
      listItem.append(link);
      results.append(listItem);
    });
  };

  syncExpandedState(false);

  const openSearch = async () => {
    if (overlay.classList.contains('is-open')) return;

    previouslyFocused = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('search-active');
    setPageContentHidden(true);
    syncExpandedState(true);

    if (removeTrapListener) {
      removeTrapListener();
    }
    removeTrapListener = addFocusTrap();

    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      input.focus();
    });

    if (!searchData) {
      status.textContent = 'Loading index...';
      try {
        const configuredSearchUrl = document.body?.dataset.searchUrl || '/search.json';
        const response = await fetch(configuredSearchUrl);
        if (!response.ok) throw new Error('Failed to load search index');
        searchData = await response.json();
        populateCategories();
        status.textContent = '';
      } catch (error) {
        status.textContent = 'Failed to load search index.';
        console.error(error);
      }
    }
  };

  const closeSearch = () => {
    if (!overlay.classList.contains('is-open')) return;

    overlay.classList.remove('is-open');
    document.body.classList.remove('search-active');
    setPageContentHidden(false);
    syncExpandedState(false);

    if (removeTrapListener) {
      removeTrapListener();
      removeTrapListener = null;
    }

    const focusTarget = previouslyFocused instanceof HTMLElement ? previouslyFocused : toggle;
    focusTarget.focus();
    previouslyFocused = null;

    setTimeout(() => {
      overlay.hidden = true;
      input.value = '';
      categoryFilter.value = 'all';
      sortSelect.value = 'relevance';
      results.innerHTML = '';
      status.textContent = '';
    }, 200);
  };

  toggle.addEventListener('click', openSearch);
  close.addEventListener('click', closeSearch);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeSearch();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeSearch();
    }
  });

  input.addEventListener('input', renderResults);
  categoryFilter.addEventListener('change', renderResults);
  sortSelect.addEventListener('change', renderResults);
};

const initPage = () => {
  resetNavigationState();
  resetTransientUiState();
  handlePageTransitions();
  handleScrollReveal();
  randomizeFavoriteQuotes();
  initSearch();
};

document.addEventListener("DOMContentLoaded", initPage);

document.addEventListener("pageshow", () => {
  resetNavigationState();
  resetTransientUiState();
  handleScrollReveal();
});

document.addEventListener("pagehide", () => {
  document.body.classList.remove("is-leaving", "is-loading");
});
