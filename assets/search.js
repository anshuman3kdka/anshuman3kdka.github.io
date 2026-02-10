/*
  Global site search (vanilla JS)
  - Loads the static index lazily on first open for good mobile performance.
  - Keeps UI hidden until requested, preserving the existing page layout.
*/
const searchState = {
  index: [],
  indexReady: false,
  indexPromise: null,
  isOpen: false,
};

const selectors = {
  toggle: "[data-search-toggle]",
  overlay: "[data-search-overlay]",
  panel: "[data-search-panel]",
  close: "[data-search-close]",
  input: "[data-search-input]",
  results: "[data-search-results]",
  status: "[data-search-status]",
};

const MAX_RESULTS = 14;


const resolveIndexUrl = () => {
  const script = document.querySelector('script[src*="/assets/search.js"], script[src$="assets/search.js"]');
  if (!script) return "/assets/search-index.json";
  return new URL("search-index.json", script.src).toString();
};

const SEARCH_INDEX_URL = resolveIndexUrl();

const normalize = (value) => value.toLowerCase().trim();

const buildSnippet = (entry, query) => {
  const text = entry.content || "";
  if (!query) return "";

  const index = text.toLowerCase().indexOf(query);
  if (index === -1) return "";

  const start = Math.max(0, index - 56);
  const end = Math.min(text.length, index + 88);
  const snippet = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${snippet}${end < text.length ? "…" : ""}`;
};

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderStatus = (elements, message) => {
  elements.status.textContent = message;
};

const clearResults = (elements) => {
  elements.results.innerHTML = "";
};

const renderResults = (elements, query, results) => {
  clearResults(elements);

  if (!query) {
    renderStatus(elements, "Type to search across essays, prose, projects, and more.");
    return;
  }

  if (!results.length) {
    renderStatus(elements, `No results found for “${query}”.`);
    return;
  }

  renderStatus(elements, `${results.length} result${results.length === 1 ? "" : "s"} for “${query}”.`);

  results.forEach((entry) => {
    const item = document.createElement("li");
    const snippet = buildSnippet(entry, normalize(query));

    item.innerHTML = `
      <a href="${escapeHtml(entry.url)}">
        <strong>${escapeHtml(entry.title || entry.url)}</strong>
        <div class="search-result-meta">${escapeHtml(entry.path || entry.url)}</div>
        ${snippet ? `<div class="search-result-snippet">${escapeHtml(snippet)}</div>` : ""}
      </a>
    `;

    elements.results.appendChild(item);
  });
};

const rankResults = (entries, normalizedQuery) => {
  const scored = entries
    .map((entry) => {
      const title = (entry.title || "").toLowerCase();
      const path = (entry.path || "").toLowerCase();
      const content = (entry.content || "").toLowerCase();
      const url = (entry.url || "").toLowerCase();

      let score = 0;
      if (title.includes(normalizedQuery)) score += 6;
      if (path.includes(normalizedQuery)) score += 4;
      if (url.includes(normalizedQuery)) score += 3;
      if (content.includes(normalizedQuery)) score += 2;
      if (title.startsWith(normalizedQuery)) score += 2;

      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ entry }) => entry);

  return scored;
};

const runSearch = (elements) => {
  const raw = elements.input.value;
  const query = raw.trim();
  const normalized = normalize(query);

  if (!normalized) {
    renderResults(elements, "", []);
    return;
  }

  const matches = rankResults(searchState.index, normalized);
  renderResults(elements, query, matches);
};

const loadIndex = async () => {
  if (searchState.indexReady) return;

  if (!searchState.indexPromise) {
    searchState.indexPromise = fetch(SEARCH_INDEX_URL, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Search index request failed.");
        }
        return response.json();
      })
      .then((data) => {
        searchState.index = Array.isArray(data) ? data : [];
        searchState.indexReady = true;
      });
  }

  await searchState.indexPromise;
};

const openSearch = async (elements) => {
  if (searchState.isOpen) return;

  searchState.isOpen = true;
  elements.overlay.hidden = false;

  requestAnimationFrame(() => {
    elements.overlay.classList.add("is-open");
  });

  document.body.classList.add("search-active");
  elements.toggle.setAttribute("aria-expanded", "true");

  renderStatus(elements, "Loading search index…");

  try {
    await loadIndex();
    renderResults(elements, "", []);
    elements.input.focus({ preventScroll: true });
  } catch (error) {
    renderStatus(elements, "Search is temporarily unavailable.");
  }
};

const closeSearch = (elements) => {
  if (!searchState.isOpen) return;

  searchState.isOpen = false;
  elements.overlay.classList.remove("is-open");
  document.body.classList.remove("search-active");
  elements.toggle.setAttribute("aria-expanded", "false");

  window.setTimeout(() => {
    if (!searchState.isOpen) {
      elements.overlay.hidden = true;
    }
  }, 180);
};

const initialize = () => {
  const elements = {
    toggle: document.querySelector(selectors.toggle),
    overlay: document.querySelector(selectors.overlay),
    panel: document.querySelector(selectors.panel),
    close: document.querySelector(selectors.close),
    input: document.querySelector(selectors.input),
    results: document.querySelector(selectors.results),
    status: document.querySelector(selectors.status),
  };

  if (Object.values(elements).some((node) => !node)) return;

  elements.toggle.addEventListener("click", () => {
    openSearch(elements);
  });

  elements.close.addEventListener("click", () => {
    closeSearch(elements);
    elements.toggle.focus({ preventScroll: true });
  });

  elements.overlay.addEventListener("click", (event) => {
    const clickedOutside = !elements.panel.contains(event.target);
    if (clickedOutside) {
      closeSearch(elements);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchState.isOpen) {
      closeSearch(elements);
      elements.toggle.focus({ preventScroll: true });
    }
  });

  elements.input.addEventListener("input", () => {
    if (!searchState.indexReady) return;
    runSearch(elements);
  });

  elements.results.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    closeSearch(elements);
  });
};

document.addEventListener("DOMContentLoaded", initialize);
