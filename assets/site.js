const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pageTransitionListenerAttached = false;
let revealObserver = null;

const setLoadedState = () => {
  document.body.classList.remove("is-loading", "is-leaving");
  document.body.classList.add("is-loaded");
};

const handlePageTransitionClick = (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  const isExternal = link.target === "_blank" || href.startsWith("http");
  const isAnchor = href.startsWith("#");
  if (isExternal || isAnchor || link.hasAttribute("download")) return;

  event.preventDefault();
  document.body.classList.add("is-leaving");
  setTimeout(() => {
    window.location.href = href;
  }, 180);
};

const handlePageTransitions = () => {
  if (prefersReducedMotion) {
    setLoadedState();
  } else {
    requestAnimationFrame(setLoadedState);
  }

  if (!pageTransitionListenerAttached) {
    document.addEventListener("click", handlePageTransitionClick);
    pageTransitionListenerAttached = true;
  }
};

const handleScrollReveal = () => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (prefersReducedMotion) {
    items.forEach((item) => item.classList.add("is-visible"));
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
  const close = document.querySelector('[data-search-close]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');

  if (!toggle || !overlay || !close || !input || !results) return;

  // Prevent double binding if initPage runs multiple times
  if (searchInitialized) return;
  searchInitialized = true;

  const openSearch = async () => {
    overlay.hidden = false;
    document.body.classList.add('search-active');
    // Force a reflow/paint for transition
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      input.focus();
    });

    if (!searchData) {
      status.textContent = 'Loading index...';
      try {
        const response = await fetch('/search.json');
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
    overlay.classList.remove('is-open');
    document.body.classList.remove('search-active');
    setTimeout(() => {
      overlay.hidden = true;
      input.value = '';
      results.innerHTML = '';
      status.textContent = '';
    }, 200);
  };

  toggle.addEventListener('click', openSearch);
  close.addEventListener('click', closeSearch);

  // Close on Escape or click outside panel
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
      results.innerHTML = hits.map(hit => `
        <li>
          <a href="${hit.url}">
            <div style="font-weight: 600; margin-bottom: 0.2rem;">${hit.title}</div>
            <div class="search-result-meta">${hit.category || 'Page'}</div>
          </a>
        </li>
      `).join('');
    }
  });
};

// Centralized initializer used on first load and bfcache restores.
const initPage = () => {
  handlePageTransitions();
  handleScrollReveal();
  initSearch();
};

document.addEventListener("DOMContentLoaded", initPage);

document.addEventListener("pageshow", (event) => {
  // When returning from bfcache, JS state can be stale. Re-run setup safely.
  if (event.persisted) {
    initPage();
  }
});
