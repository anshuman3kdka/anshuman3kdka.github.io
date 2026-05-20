const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pageTransitionListenerAttached = false;
let scrollProgressHandlersBound = false;
let quoteRotatorTimeoutId = null;
const NAV_TRANSITION_CLASS_PREFIX = 'is-transition-';
const NAV_TRANSITION_STORAGE_KEY = 'nav-transition-preset';

const TRANSITION_PRESETS = {
  SOFT_ZOOM_IN: 'soft-zoom-in',
  PAGE_TURN: 'page-turn',
  DISSOLVE_LIFT: 'dissolve-lift',
};

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

const clearTransitionPresetClasses = () => {
  Object.values(TRANSITION_PRESETS).forEach((preset) => {
    document.body.classList.remove(`${NAV_TRANSITION_CLASS_PREFIX}${preset}`);
  });
};

const classifyRoute = (pathname) => {
  const normalizedPath = normalizePathname(pathname);
  if (normalizedPath === '/') return 'home';

  const routePatterns = [
    ['poetry', /^\/poetry(?:\/|$)/],
    ['prose', /^\/prose(?:\/|$)/],
    ['essays', /^\/essays(?:\/|$)/],
    ['projects', /^\/projects(?:\/|$)/],
    ['contact', /^\/contact(?:\/|$)/],
  ];

  const matchedCategory = routePatterns.find(([, pattern]) => pattern.test(normalizedPath));
  return matchedCategory ? matchedCategory[0] : 'unknown';
};

const isPieceCategory = (category) => {
  return category === 'poetry' || category === 'prose' || category === 'essays';
};

const resolveTransitionPreset = (fromPathname, toPathname) => {
  const fromCategory = classifyRoute(fromPathname);
  const toCategory = classifyRoute(toPathname);

  if (fromCategory === 'home' && isPieceCategory(toCategory)) {
    return TRANSITION_PRESETS.SOFT_ZOOM_IN;
  }

  if (isPieceCategory(fromCategory) && isPieceCategory(toCategory)) {
    return TRANSITION_PRESETS.PAGE_TURN;
  }

  if (isPieceCategory(fromCategory) && toCategory === 'home') {
    return TRANSITION_PRESETS.DISSOLVE_LIFT;
  }

  return null;
};

const applyTransitionPreset = (preset) => {
  clearTransitionPresetClasses();
  if (!preset) return;
  document.body.classList.add(`${NAV_TRANSITION_CLASS_PREFIX}${preset}`);
};

const runNavigableTransition = (href) => {
  const fallbackDurationMs = 280;

  try {
    const targetPathname = new URL(href, window.location.origin).pathname;
    const transitionPreset = resolveTransitionPreset(window.location.pathname, targetPathname);
    const transitionDurationMs = transitionPreset ? 360 : fallbackDurationMs;

    applyTransitionPreset(transitionPreset);

    if (transitionPreset) {
      sessionStorage.setItem(NAV_TRANSITION_STORAGE_KEY, transitionPreset);
    } else {
      sessionStorage.removeItem(NAV_TRANSITION_STORAGE_KEY);
    }

    document.body.classList.add('is-leaving');
    setTimeout(() => {
      window.location.href = href;
    }, transitionDurationMs);
  } catch (error) {
    // Strict fallback: keep the original simple transition behavior.
    clearTransitionPresetClasses();
    try {
      sessionStorage.removeItem(NAV_TRANSITION_STORAGE_KEY);
    } catch (_storageError) {
      // No-op: storage can fail in private contexts.
    }

    document.body.classList.add('is-leaving');
    setTimeout(() => {
      window.location.href = href;
    }, fallbackDurationMs);
  }
};

const hydrateTransitionPresetFromStorage = () => {
  try {
    const savedPreset = sessionStorage.getItem(NAV_TRANSITION_STORAGE_KEY);
    if (!savedPreset) return;

    const isKnownPreset = Object.values(TRANSITION_PRESETS).includes(savedPreset);
    if (isKnownPreset) {
      applyTransitionPreset(savedPreset);
    }

    sessionStorage.removeItem(NAV_TRANSITION_STORAGE_KEY);
  } catch (error) {
    clearTransitionPresetClasses();
  }
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

  const linkUrl = new URL(href, window.location.origin);
  const currentUrl = new URL(window.location.href);

  const isSameDocumentHashNavigation =
    Boolean(linkUrl.hash) &&
    linkUrl.pathname === currentUrl.pathname &&
    linkUrl.search === currentUrl.search;

  if (isSameDocumentHashNavigation) return false;

  const path = linkUrl.pathname;
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
  runNavigableTransition(href);
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
      progressFill.style.transform = 'scaleX(0)';
      return;
    }

    progressBar.hidden = false;
    const progress = Math.min(Math.max(scrollTop / maxScrollableDistance, 0), 1);
    progressFill.style.transform = `scaleX(${progress})`;
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

  try {
    // ⚡ Bolt: Launch fetches in parallel via Promise.any to adopt the fastest successful
    // response without incurring the penalty of prior failed fetch delays.
    response = await Promise.any(
      [...new Set(fallbackUrls)].map(async (url) => {
        const candidate = await fetch(url);
        if (!candidate.ok) throw new Error('Failed to load');
        return candidate;
      })
    );
  } catch (error) {
    // All fallback URLs failed to load.
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

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        method: 'HEAD',
        cache: 'no-store',
      });

      if (response.ok || response.status === 405) {
        return candidate;
      }
    } catch (error) {
      // Try the next candidate URL.
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
    trigger.setAttribute('aria-busy', 'true');

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

      runNavigableTransition(item.url);
      trigger.removeAttribute('aria-busy');
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

    trigger.removeAttribute('aria-busy');
    isFetching = false;
  });
};

const resolveRandomReadStatus = (trigger) => {
  const describedBy = trigger.getAttribute('aria-describedby');
  if (describedBy) {
    const statusById = document.getElementById(describedBy);
    if (statusById) return statusById;
  }

  const localScope = trigger.closest('.header-quick-actions, .home-random');
  return localScope?.querySelector('[data-random-read-status]') || null;
};

const initRandomReadButton = () => {
  const buttons = Array.from(document.querySelectorAll('[data-random-read]'));
  if (!buttons.length) return;

  buttons.forEach((button) => {
    if (button.dataset.randomReadBound === 'true') return;
    const status = resolveRandomReadStatus(button);
    if (!status) return;

    button.dataset.randomReadBound = 'true';
    bindRandomReadTrigger({
      trigger: button,
      statusElement: status,
      disableWhileLoading: true,
      idleStatus: status.textContent || '',
    });
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
    link.innerHTML = linkLabel;

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
    refresh.setAttribute('aria-busy', 'true');
    try {
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
        linkLabel: 'Read this piece <span aria-hidden="true">→</span>',
      });
    } finally {
      refresh.removeAttribute('aria-busy');
    }
  };

  refresh.addEventListener('click', renderRandomItem);
  renderRandomItem();
};

const initQuoteRotator = () => {
  const rotator = document.querySelector('[data-quote-rotator]');
  if (!rotator) return;

  const quoteElements = Array.from(rotator.querySelectorAll('[data-quote-item]'));
  if (quoteElements.length === 0) return;

  if (quoteRotatorTimeoutId) {
    window.clearTimeout(quoteRotatorTimeoutId);
    quoteRotatorTimeoutId = null;
  }

  // Check prefers-reduced-motion and show only the first quote without animation
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (quoteRotatorTimeoutId) {
      window.clearTimeout(quoteRotatorTimeoutId);
      quoteRotatorTimeoutId = null;
    }

    // Set only the first quote as active
    quoteElements.forEach((element, index) => {
      if (index === 0) {
        element.classList.add('is-active');
      }
      element.classList.remove('is-fading-out');
    });

    return;
  }

  let currentIndex = 0;

  const runRotatorCycle = () => {
    const currentElement = quoteElements[currentIndex];

    // Fade in
    currentElement.classList.add('is-active');

    // Hold for 5 seconds
    quoteRotatorTimeoutId = window.setTimeout(() => {
      // Start fade out
      currentElement.classList.remove('is-active');
      currentElement.classList.add('is-fading-out');

      // Wait through the longer fade, then hold a short dark pause before the next quote.
      quoteRotatorTimeoutId = window.setTimeout(() => {
        currentElement.classList.remove('is-fading-out');
        currentIndex = (currentIndex + 1) % quoteElements.length;
        runRotatorCycle();
      }, 2200);

    }, 5000);
  };

  // Start the first cycle
  runRotatorCycle();
};


const initReadingRoom = () => {
  const readingRoom = document.querySelector('[data-reading-room]');
  const header = document.querySelector('[data-reading-room-header]');
  if (!readingRoom) return;
  if (readingRoom.dataset.readingRoomInitialized === 'true') return;
  readingRoom.dataset.readingRoomInitialized = 'true';

  const blocks = Array.from(readingRoom.querySelectorAll('p, ul, ol, blockquote, h2, h3, h4'));
  blocks.forEach((block) => {
    block.classList.add('reading-room-block');
  });

  const updateHeaderState = () => {
    if (!header) return;
    document.body.classList.toggle('is-reading-room-scrolled', window.scrollY > 80);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    blocks.forEach((block) => block.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    root: null,
    rootMargin: '0px 0px -20% 0px',
    threshold: 0.12,
  });

  blocks.forEach((block) => observer.observe(block));
};

const initPage = () => {
  hydrateTransitionPresetFromStorage();
  resetNavigationState();
  resetTransientUiState();
  highlightCurrentNavLink();
  handlePageTransitions();
  initScrollProgress();
  initRandomReadCard();
  initRandomReadButton();
  initQuoteRotator();
  initReadingRoom();
};

document.addEventListener("DOMContentLoaded", initPage);

document.addEventListener("pageshow", () => {
  resetNavigationState();
  resetTransientUiState();
  highlightCurrentNavLink();
  initScrollProgress();
  initReadingRoom();
});

document.addEventListener("pagehide", () => {
  clearTransitionPresetClasses();
  document.body.classList.remove("is-leaving", "is-loading");
});
