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
  const siteShell = document.querySelector('.site-shell');
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let previouslyFocused = null;
  let removeTrapListener = null;

  if (!toggle || !overlay || !panel || !close || !input || !results) return;

  if (searchInitialized) return;
  searchInitialized = true;

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

  input.addEventListener('input', () => {
    if (!searchData) return;
    const query = input.value.toLowerCase().trim();
    if (!query) {
      results.innerHTML = '';
      status.textContent = '';
      return;
    }

    const hits = searchData.filter(item => {
      return (item.title && item.title.toLowerCase().includes(query)) ||
             (item.content && item.content.toLowerCase().includes(query));
    });

    if (hits.length === 0) {
      status.textContent = 'No results found.';
      results.innerHTML = '';
    } else {
      status.textContent = `${hits.length} result${hits.length !== 1 ? 's' : ''} found.`;
      results.innerHTML = '';

      hits.forEach((hit) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        const title = document.createElement('div');
        const category = document.createElement('div');

        link.setAttribute('href', hit.url || '#');

        title.style.fontWeight = '600';
        title.style.marginBottom = '0.2rem';
        title.textContent = hit.title || 'Untitled';

        category.classList.add('search-result-meta');
        category.textContent = hit.category || 'Page';

        link.append(title, category);
        listItem.append(link);
        results.append(listItem);
      });
    }
  });
};

const initPage = () => {
  resetNavigationState();
  resetTransientUiState();
  handlePageTransitions();
  handleScrollReveal();
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
