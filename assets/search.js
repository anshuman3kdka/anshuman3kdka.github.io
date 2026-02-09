const searchState = {
  index: [],
  loaded: false,
};

const normalize = (value) => value.toLowerCase().trim();

const fetchIndex = async () => {
  const response = await fetch("/assets/search-index.json", { cache: "force-cache" });
  if (!response.ok) {
    throw new Error("Unable to load search index.");
  }
  return response.json();
};

const createSnippet = (entry, query) => {
  const haystack = entry.content || "";
  if (!query) return "";
  const index = haystack.toLowerCase().indexOf(query);
  if (index === -1) return "";
  const start = Math.max(0, index - 50);
  const end = Math.min(haystack.length, index + 70);
  const snippet = haystack.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${snippet}${end < haystack.length ? "…" : ""}`;
};

const renderResults = (results, query, displayQuery, elements) => {
  const { resultsList, status } = elements;
  resultsList.innerHTML = "";

  if (!query) {
    status.textContent = "Type a word or phrase to explore the site.";
    return;
  }

  if (!results.length) {
    status.textContent = `No results for “${displayQuery}”.`;
    return;
  }

  status.textContent = `${results.length} result${results.length === 1 ? "" : "s"} for “${displayQuery}”.`;

  results.forEach((entry) => {
    const item = document.createElement("li");

    const link = document.createElement("a");
    link.href = entry.url;
    link.textContent = entry.title;

    const meta = document.createElement("span");
    meta.className = "search-meta";
    meta.textContent = `${entry.url} • ${entry.path}`;

    const snippetText = createSnippet(entry, query);
    item.appendChild(link);
    item.appendChild(meta);
    if (snippetText) {
      const snippet = document.createElement("p");
      snippet.className = "search-snippet";
      snippet.textContent = snippetText;
      item.appendChild(snippet);
    }
    resultsList.appendChild(item);
  });
};

const applySearch = (query, elements) => {
  const trimmed = query.trim();
  const normalized = normalize(trimmed);
  if (!normalized) {
    renderResults([], "", "", elements);
    return;
  }

  const results = searchState.index.filter((entry) => {
    const target = `${entry.title} ${entry.url} ${entry.path} ${entry.content}`.toLowerCase();
    return target.includes(normalized);
  });

  renderResults(results, normalized, trimmed, elements);
};

const initSearch = async () => {
  const wrapper = document.querySelector("[data-search]");
  if (!wrapper) return;

  const input = wrapper.querySelector("[data-search-input]");
  const button = wrapper.querySelector("[data-search-button]");
  const resultsList = wrapper.querySelector("[data-search-results]");
  const status = wrapper.querySelector("#site-search-status");

  const elements = { resultsList, status };
  status.textContent = "Loading search index…";

  try {
    searchState.index = await fetchIndex();
    searchState.loaded = true;
    status.textContent = "Search across the site by typing above.";
  } catch (error) {
    status.textContent = "Search is temporarily unavailable.";
    return;
  }

  const runSearch = () => {
    if (!searchState.loaded) return;
    applySearch(input.value, elements);
  };

  input.addEventListener("input", runSearch);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
  });
  button.addEventListener("click", runSearch);
};

document.addEventListener("DOMContentLoaded", initSearch);
