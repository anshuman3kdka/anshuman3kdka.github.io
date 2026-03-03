const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pageTransitionListenerAttached = false;
let revealObserver = null;
let scrollProgressHandlersBound = false;

const normalizePathname = (value) => {
  if (!value) return '/';

  const rawPath = String(value).split('#')[0].split('?')[0] || '/';
  const pathWithLeadingSlash = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

  if (pathWithLeadingSlash !== '/' && pathWithLeadingSlash.endsWith('/')) {
    return pathWithLeadingSlash.slice(0, -1);
  }

  return pathWithLeadingSlash;
};

const highlightCurrentNavLink = () => {
  const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
  if (!navLinks.length) return;

  navLinks.forEach((link) => {
    link.classList.remove('is-active');
    link.removeAttribute('aria-current');
  });

  const currentPath = normalizePathname(window.location.pathname);
  let bestMatch = null;

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPath = normalizePathname(new URL(href, window.location.origin).pathname);
    const isHomeLink = linkPath === '/';
    const isExactMatch = currentPath === linkPath;
    const isSectionMatch = !isHomeLink && currentPath.startsWith(`${linkPath}/`);

    if (!isExactMatch && !isSectionMatch) return;

    if (!bestMatch || linkPath.length > bestMatch.path.length) {
      bestMatch = { element: link, path: linkPath };
    }
  });

  if (bestMatch) {
    bestMatch.element.classList.add('is-active');
    bestMatch.element.setAttribute('aria-current', 'page');
  }
};

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

const initScrollProgress = () => {
  const progressBar = document.querySelector('[data-scroll-progress]');
  const progressFill = document.querySelector('[data-scroll-progress-fill]');
  if (!progressBar || !progressFill) return;

  const updateScrollProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const maxScrollableDistance = scrollHeight - clientHeight;

    if (maxScrollableDistance <= 120) {
      progressBar.hidden = true;
      progressFill.style.width = '0%';
      return;
    }

    progressBar.hidden = false;
    const progress = Math.min(Math.max(scrollTop / maxScrollableDistance, 0), 1);
    progressFill.style.width = `${progress * 100}%`;
  };

  updateScrollProgress();

  if (!scrollProgressHandlersBound) {
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    scrollProgressHandlersBound = true;
  }
};


// Search functionality
let searchData = null;
let searchDataPrepared = null;
let searchInitialized = false;

const isValidContentUrl = (value) => {
  if (typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  const lowered = trimmed.toLowerCase();
  if (lowered.startsWith('#') || lowered.startsWith('mailto:') || lowered.startsWith('tel:') || lowered.startsWith('javascript:')) {
    return false;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.origin !== window.location.origin) return false;

    const extensionMatch = parsed.pathname.match(/\.([a-z0-9]+)$/i);
    if (!extensionMatch) return true;

    return extensionMatch[1] === 'html';
  } catch (error) {
    return false;
  }
};

const prepareSearchData = (items) => items
  .filter((item) => item && typeof item === 'object')
  .map((item) => ({
    ...item,
    url: String(item.url || '').trim(),
    titleLower: String(item.title || '').toLowerCase(),
    contentLower: String(item.content || '').toLowerCase(),
    categoryLower: String(item.category || '').toLowerCase(),
    tagsLower: Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '',
  }));

const getValidContentItems = () => (searchDataPrepared || []).filter((item) => isValidContentUrl(item.url));

const loadSearchData = async () => {
  if (searchDataPrepared) return searchDataPrepared;

  const configuredSearchUrl = document.body?.dataset.searchUrl || '/search.json';
  const response = await fetch(configuredSearchUrl);
  if (!response.ok) throw new Error('Failed to load search index');

  searchData = await response.json();
  searchDataPrepared = prepareSearchData(Array.isArray(searchData) ? searchData : []);
  return searchDataPrepared;
};

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

  const scoreHit = (hit, query) => {
    const terms = query.split(/\s+/).filter(Boolean);
    if (!terms.length) return 0;

    const title = hit.titleLower || '';
    const content = hit.contentLower || '';
    const category = hit.categoryLower || '';
    const tags = hit.tagsLower || '';

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
    const categories = new Set((searchDataPrepared || []).map((item) => item.category).filter(Boolean));
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
    if (!searchDataPrepared) return;

    const query = input.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const sortBy = sortSelect.value;

    const filtered = searchDataPrepared
      .map((item) => ({
        ...item,
        _score: scoreHit(item, query),
      }))
      .filter((item) => {
        const queryMatches = !query
          || item._score > 0
          || item.tagsLower.includes(query);

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
      const eyebrow = document.createElement('p');

      link.setAttribute('href', hit.url || '#');

      title.classList.add('search-result-title');
      title.textContent = hit.title || 'Untitled';

      eyebrow.classList.add('search-result-meta');
      eyebrow.textContent = hit.eyebrow || '';

      link.append(title, eyebrow);
      listItem.append(link);
      results.append(listItem);
    });
  };

  const debounce = (callback, delay = 120) => {
    let timerId;
    return (...args) => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        callback(...args);
      }, delay);
    };
  };

  const debouncedRenderResults = debounce(renderResults, 120);

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

    if (!searchDataPrepared) {
      status.textContent = 'Loading index...';
      try {
        await loadSearchData();
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

  input.addEventListener('input', debouncedRenderResults);
  categoryFilter.addEventListener('change', renderResults);
  sortSelect.addEventListener('change', renderResults);
};

const initRandomReadCard = () => {
  const card = document.querySelector('[data-random-read-card]');
  if (!card) return;

  const eyebrow = card.querySelector('[data-random-read-eyebrow]');
  const title = card.querySelector('[data-random-read-title]');
  const message = card.querySelector('[data-random-read-message]');
  const link = card.querySelector('[data-random-read-link]');
  const refresh = card.querySelector('[data-random-read-refresh]');

  if (!eyebrow || !title || !message || !link || !refresh) return;

  const allowedCategories = new Set(['poetry', 'prose', 'essay', 'essays']);

  const getReadableItems = () => getValidContentItems().filter((item) => {
    const category = String(item.category || '').toLowerCase();
    return allowedCategories.has(category);
  });

  const setCardState = ({
    eyebrowText = 'Random Read',
    titleText = 'Unable to load a random read right now.',
    messageText = 'Please try again in a moment.',
    href = '#',
    linkLabel = 'Open random piece',
    disabled = false,
  } = {}) => {
    eyebrow.textContent = eyebrowText;
    title.textContent = titleText;
    message.textContent = messageText;
    link.textContent = linkLabel;
    link.setAttribute('href', href);

    if (disabled) {
      link.setAttribute('aria-disabled', 'true');
      link.classList.add('is-disabled');
    } else {
      link.removeAttribute('aria-disabled');
      link.classList.remove('is-disabled');
    }
  };

  const renderRandomItem = async () => {
    setCardState({
      eyebrowText: 'Random Read',
      titleText: 'Picking a random piece…',
      messageText: 'One sec while I grab poetry/prose/essay content.',
      disabled: true,
    });

    try {
      await loadSearchData();
      const readableItems = getReadableItems();

      if (!readableItems.length) {
        setCardState({
          titleText: 'No poetry, prose, or essay items were found.',
          messageText: 'Try again after updating search content.',
          disabled: true,
        });
        return;
      }

      const item = readableItems[Math.floor(Math.random() * readableItems.length)];
      setCardState({
        eyebrowText: item.eyebrow || item.category || 'Random Read',
        titleText: item.title || 'Untitled piece',
        messageText: 'A random pick from the archive.',
        href: item.url,
        linkLabel: 'Read this piece →',
      });
    } catch (error) {
      console.error(error);
      setCardState({
        titleText: 'Could not load random reads.',
        messageText: 'The content index failed to load. Please try again later.',
        disabled: true,
      });
    }
  };

  refresh.addEventListener('click', renderRandomItem);
  renderRandomItem();
};

const initPage = () => {
  resetNavigationState();
  resetTransientUiState();
  highlightCurrentNavLink();
  handlePageTransitions();
  handleScrollReveal();
  initScrollProgress();
  initSearch();
  initRandomReadCard();
};

document.addEventListener("DOMContentLoaded", initPage);

document.addEventListener("pageshow", () => {
  resetNavigationState();
  resetTransientUiState();
  highlightCurrentNavLink();
  handleScrollReveal();
  initScrollProgress();
});

document.addEventListener("pagehide", () => {
  document.body.classList.remove("is-leaving", "is-loading");
});
