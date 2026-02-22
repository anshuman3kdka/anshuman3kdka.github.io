const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pageTransitionListenerAttached = false;
let revealObserver = null;

const setLoadedState = () => {
  document.body.classList.remove("is-loading", "is-leaving");
  document.body.classList.add("is-loaded");
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
let recentWorkInitialized = false;

const initRecentWork = async () => {
  if (recentWorkInitialized) return;

  const recentWorkContainer = document.querySelector('[data-recent-work]');
  if (!recentWorkContainer) return;

  recentWorkInitialized = true;

  try {
    const response = await fetch('/search.json');
    if (!response.ok) throw new Error('Failed to load content index');

    const records = await response.json();
    const recentItems = records
      .filter((item) => ['Essays', 'Poetry', 'Prose'].includes(item.category))
      .sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0))
      .slice(0, 3);

    if (!recentItems.length) {
      recentWorkContainer.innerHTML = '<article class="card reveal"><p class="card-text">No recent pieces found yet.</p></article>';
      handleScrollReveal();
      return;
    }

    recentWorkContainer.innerHTML = recentItems.map((item) => `
      <article class="card reveal">
        <p class="card-label">${item.category.slice(0, -1)}</p>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${(item.content || '').slice(0, 140)}...</p>
        <a class="card-link" href="${item.url}">Read ${item.category.slice(0, -1).toLowerCase()}</a>
      </article>
    `).join('');
    handleScrollReveal();
  } catch (error) {
    recentWorkContainer.innerHTML = '<article class="card reveal"><p class="card-text">Unable to load recent work.</p></article>';
    handleScrollReveal();
    console.error(error);
  }
};

const initSearch = () => {
  const toggle = document.querySelector('[data-search-toggle]');
  const overlay = document.querySelector('[data-search-overlay]');
  const close = document.querySelector('[data-search-close]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');

  if (!toggle || !overlay || !close || !input || !results) return;

  if (searchInitialized) return;
  searchInitialized = true;

  const openSearch = async () => {
    overlay.hidden = false;
    document.body.classList.add('search-active');
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

const initPage = () => {
  handlePageTransitions();
  handleScrollReveal();
  initSearch();
  initRecentWork();
};

document.addEventListener("DOMContentLoaded", initPage);

document.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    initPage();
  }
});
