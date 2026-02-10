/*
  Predictable in-page search (vanilla JS)
  Limitations by design:
  - Searches only visible text currently present in this page's DOM.
  - Does not crawl files, fetch remote indexes, or claim whole-site coverage.
  - Results are either scroll targets on this page or existing anchor destinations.
*/
const searchState = {
  index: [],
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

const MAX_RESULTS = 16;
const SEARCHABLE_SELECTOR = "h1, h2, h3, h4, h5, h6, p, a";

const normalize = (value) => value.toLowerCase().replace(/\s+/g, " ").trim();

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const isVisible = (node) => {
  if (!(node instanceof HTMLElement)) return false;
  if (node.hidden) return false;

  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return node.getClientRects().length > 0;
};

const ensureElementId = (node, index) => {
  if (node.id) return node.id;
  const generatedId = `search-target-${index}`;
  node.id = generatedId;
  return generatedId;
};

const buildDomIndex = () => {
  const nodes = document.querySelectorAll(SEARCHABLE_SELECTOR);
  const entries = [];

  nodes.forEach((node, index) => {
    if (!isVisible(node)) return;

    const text = normalize(node.textContent || "");
    if (!text) return;

    const tag = node.tagName.toLowerCase();

    if (tag === "a") {
      const href = node.getAttribute("href") || "";
      if (!href || href === "#") return;

      entries.push({
        type: "link",
        title: text,
        text,
        targetHref: href,
        meta: "Link",
      });

      return;
    }

    const id = ensureElementId(node, index);
    entries.push({
      type: "section",
      title: text,
      text,
      targetId: id,
      meta: tag.toUpperCase(),
    });
  });

  return entries;
};

const scoreEntry = (entry, query) => {
  let score = 0;
  if (entry.title.includes(query)) score += 4;
  if (entry.title.startsWith(query)) score += 2;
  return score;
};

const runSearch = (rawQuery) => {
  const query = normalize(rawQuery);
  if (!query) return [];

  return searchState.index
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter(({ entry, score }) => score > 0 && entry.text.includes(query))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ entry }) => entry);
};

const renderStatus = (elements, message) => {
  elements.status.textContent = message;
};

const renderResults = (elements, query, results) => {
  elements.results.innerHTML = "";

  if (!query) {
    renderStatus(elements, "Searches only the visible text on this page.");
    return;
  }

  if (!results.length) {
    renderStatus(elements, `No matching visible content on this page for “${query}”.`);
    return;
  }

  renderStatus(
    elements,
    `${results.length} result${results.length === 1 ? "" : "s"} on this page for “${query}”.`,
  );

  results.forEach((entry) => {
    const item = document.createElement("li");

    if (entry.type === "link") {
      item.innerHTML = `
        <a href="${escapeHtml(entry.targetHref)}">
          <strong>${escapeHtml(entry.title)}</strong>
          <div class="search-result-meta">${escapeHtml(entry.meta)} · Opens existing link</div>
        </a>
      `;
      elements.results.appendChild(item);
      return;
    }

    item.innerHTML = `
      <button type="button" class="search-result-button" data-target-id="${escapeHtml(entry.targetId)}">
        <strong>${escapeHtml(entry.title)}</strong>
        <div class="search-result-meta">${escapeHtml(entry.meta)} · Scroll on this page</div>
      </button>
    `;

    elements.results.appendChild(item);
  });
};

const openSearch = (elements) => {
  if (searchState.isOpen) return;

  searchState.isOpen = true;
  elements.overlay.hidden = false;

  requestAnimationFrame(() => {
    elements.overlay.classList.add("is-open");
  });

  document.body.classList.add("search-active");
  elements.toggle.setAttribute("aria-expanded", "true");
  renderStatus(elements, "Searches only the visible text on this page.");
  elements.input.focus({ preventScroll: true });
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

const scrollToTarget = (targetId, elements) => {
  const target = document.getElementById(targetId);
  if (!target) return;

  closeSearch(elements);
  target.scrollIntoView({ behavior: "smooth", block: "center" });

  if (target instanceof HTMLElement) {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
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

  searchState.index = buildDomIndex();

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
    const query = elements.input.value.trim();
    const results = runSearch(query);
    renderResults(elements, query, results);
  });

  elements.results.addEventListener("click", (event) => {
    const scrollButton = event.target.closest("[data-target-id]");
    if (scrollButton) {
      scrollToTarget(scrollButton.getAttribute("data-target-id"), elements);
      return;
    }

    const link = event.target.closest("a[href]");
    if (link) {
      closeSearch(elements);
    }
  });
};

document.addEventListener("DOMContentLoaded", initialize);
