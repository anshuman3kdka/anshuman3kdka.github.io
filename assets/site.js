const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pageTransitionListenerAttached = false;
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
  document.body.classList.remove("is-loading", "is-leaving");
  document.body.classList.add("is-loaded");
};

const resetTransientUiState = () => {
  const siteShell = document.querySelector('.site-shell');
  siteShell?.removeAttribute('aria-hidden');
};

/**
 * Hardened URL validation to ensure a link is safe and points to the same origin.
 * Blocks dangerous protocols like javascript:, data:, and vbscript:.
 */
const isSafeInternalUrl = (url) => {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return false;

  try {
    const parsed = new URL(trimmed, window.location.origin);
    // Only allow standard web protocols for internal site navigation
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return parsed.origin === window.location.origin;
  } catch (e) {
    return false;
  }
};

const isNavigableDocumentLink = (link, href) => {
  if (!isSafeInternalUrl(href)) return false;

  if (link.target === "_blank" || link.hasAttribute("download") || link.getAttribute("rel")?.includes('external')) {
    return false;
  }

  const path = new URL(href, window.location.origin).pathname;
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
  if (!href) return;

  // Security: Block dangerous protocols explicitly even for non-navigable links
  const lowered = href.trim().toLowerCase();
  if (lowered.startsWith('javascript:') || lowered.startsWith('data:') || lowered.startsWith('vbscript:')) {
    event.preventDefault();
    return;
  }

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
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    // ⚡ Bolt: Use requestAnimationFrame to throttle high-frequency scroll and resize
    // events, preventing layout thrashing and main-thread blocking.
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    scrollProgressHandlersBound = true;
  }
};


// Random read dataset functionality
let randomReadDataPrepared = null;

const isValidContentUrl = (value) => {
  if (!isSafeInternalUrl(value)) return false;

  try {
    const parsed = new URL(value, window.location.origin);
    const extensionMatch = parsed.pathname.match(/\.([a-z0-9]+)$/i);
    if (!extensionMatch) return true;

    return extensionMatch[1] === 'html';
  } catch (error) {
    return false;
  }
};

const prepareRandomReadData = (items) => items
  .filter((item) => item && typeof item === 'object')
  .map((item) => ({
    title: String(item.title || '').trim(),
    category: String(item.category || '').trim(),
    eyebrow: String(item.eyebrow || '').trim(),
    date: String(item.date || '').trim(),
    url: String(item.url || '').trim(),
  }));

const getValidContentItems = () => (randomReadDataPrepared || []).filter((item) => isValidContentUrl(item.url));

const loadRandomReadData = async () => {
  if (randomReadDataPrepared) return randomReadDataPrepared;

  const fallbackUrls = ['random-read.json', '/random-read.json'];
  let response = null;

  for (const url of [...new Set(fallbackUrls)]) {
    try {
      const candidate = await fetch(url);
      if (!candidate.ok) continue;
      response = candidate;
      break;
    } catch (error) {
      // Try the next fallback URL.
    }
  }

  if (!response) throw new Error('Failed to load random read index');

  const data = await response.json();
  const records = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.reads)
        ? data.reads
        : [];

  randomReadDataPrepared = prepareRandomReadData(records);
  return randomReadDataPrepared;
};

const buildRandomReadUrlCandidates = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return [];

  const candidates = [raw];

  if (raw.endsWith('/')) {
    candidates.push(`${raw}index.html`);
    candidates.push(`${raw.slice(0, -1)}.html`);
  } else if (raw.endsWith('.html')) {
    const withoutHtml = raw.replace(/\.html$/i, '');
    candidates.push(`${withoutHtml}/`);
    candidates.push(`${withoutHtml}/index.html`);
  } else {
    candidates.push(`${raw}/`);
    candidates.push(`${raw}.html`);
    candidates.push(`${raw}/index.html`);
  }

  return [...new Set(candidates)];
};

const resolveRandomReadUrl = async (value) => {
  const candidates = buildRandomReadUrlCandidates(value);

  // ⚡ Bolt: Initiate all HEAD requests in parallel to reduce network latency.
  // We map candidates to promises and then await them sequentially in priority order.
  // This allows early return if a high-priority URL resolves quickly, while still
  // having lower-priority requests already in flight if needed.
  const fetchPromises = candidates.map((url) => fetch(url, {
    method: 'HEAD',
    cache: 'no-store',
  }).catch(() => null));

  for (let i = 0; i < fetchPromises.length; i++) {
    const response = await fetchPromises[i];
    if (response && (response.ok || response.status === 405)) {
      return candidates[i];
    }
  }

  return candidates[0] || '#';
};

const fetchRandomReadItem = async () => {
  const allowedCategories = new Set(['poetry', 'prose', 'essay', 'essays']);
  const allowedPathKeywords = ['/poetry/', '/prose/', '/essay/', '/essays/'];
  const disallowedIndexPaths = new Set(['/poetry/', '/prose/', '/essay/', '/essays/']);

  const isAllowedReadCategory = (item) => {
    const category = String(item.category || item.categoryLower || '').trim().toLowerCase();
    if (allowedCategories.has(category)) return true;

    const path = String(item.url || '').toLowerCase();
    return allowedPathKeywords.some((keyword) => path.includes(keyword));
  };

  const isSinglePiece = (item) => {
    const path = String(item.url || '').trim().toLowerCase();
    return path && !disallowedIndexPaths.has(path);
  };

  try {
    await loadRandomReadData();
    const readableItems = getValidContentItems().filter((item) => isAllowedReadCategory(item) && isSinglePiece(item));

    if (!readableItems.length) return null;

    const pickedItem = readableItems[Math.floor(Math.random() * readableItems.length)];
    const resolvedUrl = await resolveRandomReadUrl(pickedItem.url);
    return {
      ...pickedItem,
      url: resolvedUrl,
    };
  } catch (error) {
    console.error('Random read error:', error);
    return null;
  }
};

const bindRandomReadTrigger = ({ trigger, statusElement, disableWhileLoading = false, idleStatus = '' }) => {
  if (!trigger) return;

  let isFetching = false;

  trigger.addEventListener('click', async (event) => {
    event.preventDefault();
    if (trigger.getAttribute('aria-disabled') === 'true') return;
    if (isFetching) return;

    isFetching = true;

    if (disableWhileLoading) {
      trigger.disabled = true;
    }

    if (statusElement) {
      statusElement.textContent = 'Picking a piece…';
    }

    const item = await fetchRandomReadItem();

    if (item?.url) {
      if (statusElement) {
        statusElement.textContent = `Opening ${item.title || 'piece'}…`;
      }

      document.body.classList.add('is-leaving');
      setTimeout(() => {
        window.location.href = item.url;
      }, 180);
      return;
    }

    if (statusElement) {
      statusElement.textContent = 'No pieces found.';
      setTimeout(() => {
        statusElement.textContent = idleStatus;
      }, 3000);
    }

    if (disableWhileLoading) {
      trigger.disabled = false;
    }

    isFetching = false;
  });
};

const initRandomReadButton = () => {
  const button = document.querySelector('[data-random-read]');
  const status = document.querySelector('[data-random-read-status]');
  if (!button || !status) return;

  bindRandomReadTrigger({
    trigger: button,
    statusElement: status,
    disableWhileLoading: true,
    idleStatus: '',
  });
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

    if (disabled) {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.classList.add('is-disabled');
    } else {
      link.setAttribute('href', href);
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

    const item = await fetchRandomReadItem();

    if (!item) {
      setCardState({
        titleText: 'No poetry, prose, or essay items were found.',
        messageText: 'Try again after updating site content.',
        disabled: true,
      });
      return;
    }

    setCardState({
      eyebrowText: item.eyebrow || item.category || 'Random Read',
      titleText: item.title || 'Untitled piece',
      messageText: 'A random pick from the archive.',
      href: item.url,
      linkLabel: 'Read this piece →',
    });
  };

  refresh.addEventListener('click', renderRandomItem);
  renderRandomItem();
};

const initPage = () => {
  resetNavigationState();
  resetTransientUiState();
  highlightCurrentNavLink();
  handlePageTransitions();
  initScrollProgress();
  initRandomReadCard();
  initRandomReadButton();
};

document.addEventListener("DOMContentLoaded", initPage);

document.addEventListener("pageshow", () => {
  resetNavigationState();
  resetTransientUiState();
  highlightCurrentNavLink();
  initScrollProgress();
});

document.addEventListener("pagehide", () => {
  document.body.classList.remove("is-leaving", "is-loading");
});
