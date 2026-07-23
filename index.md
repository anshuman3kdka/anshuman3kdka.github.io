---
title: Home
description: Anshuman’s personal site featuring thoughtful essays, original poetry, and hands-on projects, with notes on writing, literature, and creative experiments.
---

{% assign current_time = 'now' | date: '%s' %}
{% assign home_essays = site.pages | where_exp: "page", "page.path contains 'essays/'" | where_exp: "page", "page.name != 'index.md'" | where_exp: "page", "page.draft != true" %}
{% assign home_poems = site.pages | where_exp: "page", "page.path contains 'poetry/'" | where_exp: "page", "page.name != 'index.md'" | where_exp: "page", "page.draft != true" %}
{% assign home_prose = site.pages | where_exp: "page", "page.path contains 'prose/'" | where_exp: "page", "page.name != 'index.md'" | where_exp: "page", "page.draft != true" %}
{% assign home_projects = site.pages | where_exp: "page", "page.path contains 'projects/'" | where_exp: "page", "page.name != 'index.md'" | where_exp: "page", "page.draft != true" %}
{% assign home_essay_count = 0 %}
{% assign home_creative_count = 0 %}
{% assign home_project_count = 0 %}
{% for item in home_essays %}
  {% assign item_publish_time = item.publish_date | date: '%s' %}
  {% unless item.publish_date and item.publish_date != '' and item_publish_time > current_time %}
    {% assign home_essay_count = home_essay_count | plus: 1 %}
  {% endunless %}
{% endfor %}
{% for item in home_poems %}
  {% assign item_publish_time = item.publish_date | date: '%s' %}
  {% unless item.publish_date and item.publish_date != '' and item_publish_time > current_time %}
    {% assign home_creative_count = home_creative_count | plus: 1 %}
  {% endunless %}
{% endfor %}
{% for item in home_prose %}
  {% assign item_publish_time = item.publish_date | date: '%s' %}
  {% unless item.publish_date and item.publish_date != '' and item_publish_time > current_time %}
    {% assign home_creative_count = home_creative_count | plus: 1 %}
  {% endunless %}
{% endfor %}
{% for item in home_projects %}
  {% assign item_publish_time = item.publish_date | date: '%s' %}
  {% unless item.publish_date and item.publish_date != '' and item_publish_time > current_time %}
    {% assign home_project_count = home_project_count | plus: 1 %}
  {% endunless %}
{% endfor %}

{% assign quote_rotator = site.data.home_quote_rotator %}
{% assign hero_quotes = site.data.hero_quotes %}
{% if quote_rotator.enabled and hero_quotes.size > 0 %}
<div class="home-quote-container" data-quote-rotator aria-label="Rotating writing fragments">
  {% for quote in hero_quotes %}
  <p class="home-quote-text" data-quote-item>{{ quote | escape }}</p>
  {% endfor %}
</div>
{% endif %}

<section class="section section--hero home-entry" aria-labelledby="hero-title">
  <div class="home-entry__copy">
    <p class="home-eyebrow tactile-deboss">WRITER · STUDENT · OCCASIONALLY VIBE-CODES</p>
    <h1 class="home-entry__title" id="hero-title">Words that <em>question</em>. Stories that <em>stay</em>.</h1>
    <p class="home-entry__lead">A small reading room for essays, poems, stories, projects, and other attempts at understanding the world before it understands me first.</p>
  </div>

  <aside class="home-random" aria-labelledby="random-read-title">
    <p class="card-label">Serendipitous Discovery</p>
    <h2 id="random-read-title">Don’t choose. Let the archive choose.</h2>
    <button class="tactile-orb tactile-deboss home-random__orb" type="button" data-random-read aria-describedby="random-read-status">
      <span>Roll<br>the Dice</span>
    </button>
    <p class="home-random__status" id="random-read-status" data-random-read-status aria-live="polite">Tap for a random read.</p>
  </aside>
</section>

<section class="section home-categories" aria-labelledby="categories-title">
  <div class="home-section-kicker">Browse the shelves</div>
  <h2 class="section-title home-section-title" id="categories-title">Choose a door, not a menu.</h2>

  <div class="home-category-grid" aria-label="Writing categories">
    <a class="home-category-card home-category-card--essays tactile-card" href="/essays/">
      <span class="home-category-card__label">Essays</span>
      <strong>Ideas, arguments, and literary autopsies.</strong>
      <span class="home-category-card__count">{{ home_essay_count }} {% if home_essay_count == 1 %}piece{% else %}pieces{% endif %}</span>
    </a>

    <a class="home-category-card home-category-card--creative tactile-card" href="/creative/">
      <span class="home-category-card__label">Creative</span>
      <strong>Poetry, prose, horror, and strange little worlds.</strong>
      <span class="home-category-card__count">{{ home_creative_count }} {% if home_creative_count == 1 %}piece{% else %}pieces{% endif %}</span>
    </a>

    <a class="home-category-card home-category-card--projects tactile-card" href="/projects/">
      <span class="home-category-card__label">Projects</span>
      <strong>Things built while learning what the buttons do.</strong>
      <span class="home-category-card__count">{{ home_project_count }} {% if home_project_count == 1 %}project{% else %}projects{% endif %}</span>
    </a>
  </div>
</section>

<section class="section home-recent" aria-labelledby="featured-writing-title">
  <div class="home-featured-head">
    <div>
      <div class="home-section-kicker">Recent from the desk</div>
      <h2 class="section-title home-section-title" id="featured-writing-title">Three ways in.</h2>
    </div>
    <a class="button button-secondary" href="/search/">Search archive <span aria-hidden="true">→</span></a>
  </div>

  <div class="home-desk-grid">
    <article class="home-feature tactile-card">
      <p class="card-label">Horror</p>
      <h3 class="card-title">A Letter to You (Red Pen Edit)</h3>
      <p class="card-text">Not every letter is meant to comfort you.</p>
      <a class="card-link" href="/prose/A_letter_to_you/">Read prose</a>
    </article>

    <article class="home-feature tactile-card">
      <p class="card-label">Poetry</p>
      <h3 class="card-title">Merchants of Lush II</h3>
      <p class="card-text">A poem about lost idealism, bargains, and the glass we keep rebuilding.</p>
      <a class="card-link" href="/poetry/merchants-of-lush-ii/">Read poem</a>
    </article>

    <article class="home-feature tactile-card">
      <p class="card-label">Project</p>
      <h3 class="card-title">Anshuman3kdka.In</h3>
      <p class="card-text">The project that had no business existing, built one confusing button at a time.</p>
      <a class="card-link" href="/projects/">View project</a>
    </article>
  </div>
</section>

<section class="section home-signature" aria-label="Signature line">
  <p><span></span><em>“I write to understand. You read to feel less alone.”</em><span></span></p>
</section>
