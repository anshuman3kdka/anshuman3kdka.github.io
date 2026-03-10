---
title: Search
description: Search all essays, prose, poetry, projects, and achievements.
---

<section class="section search-page" aria-labelledby="search-page-title">
  <header class="search-page-header">
    <h1 class="page-title" id="search-page-title">Search</h1>
    <p class="page-lede">Find writing and projects quickly.</p>
  </header>

  <div class="search-surface">
    <form role="search" class="search-input-wrap" data-search-form>
      <label class="search-label" for="site-search-input">Search the site</label>
      <input
        id="site-search-input"
        class="search-input"
        type="search"
        name="q"
        autocomplete="off"
        placeholder="Try: Poetry"
        data-search-input
        data-search-index-url="{{ '/search-index.json' | relative_url }}"
        aria-describedby="search-live-region"
        maxlength="100"
      >
    </form>

    <p class="search-hint">Tip: use 2+ letters. Multiple words work too, and your search stays in the URL for sharing.</p>
    <p class="search-live" id="search-live-region" data-search-live aria-live="polite"></p>
    <ul class="search-results" data-search-results></ul>
  </div>
</section>

<script type="module" src="{{ '/assets/search.js' | relative_url }}"></script>
