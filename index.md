---
title: Home
description: Anshuman’s personal site featuring thoughtful essays, original poetry, and hands-on projects, with notes on writing, literature, and creative experiments.
---

<section class="section section--hero hero hero--center-desktop" aria-labelledby="hero-title">
  <div class="hero-content">
    <h1 class="hero-title" id="hero-title">{{ site.data.site.site_title | default: 'Anshuman3kdka' | escape }}</h1>
    <p class="section-eyebrow">Writer · Student · Occasionally vibe-codes</p>
    <p class="hero-lead">{{ site.data.site.site_tagline | default: "I write essays, fiction, and poetry. Usually about literature, occasionally about why most of it fails." | escape }}</p>
    {% assign quote_rotator = site.data.home_quote_rotator %}
    {% assign quote_rotator_enabled = quote_rotator.enabled | append: '' | downcase %}
    {% if quote_rotator_enabled == 'true' and quote_rotator.quotes and quote_rotator.quotes.size > 0 %}
    <div class="hero-quote-rotator" data-quote-rotator data-quote-interval="5000" data-quote-fade-ms="600" aria-live="polite">
      <p class="hero-quote-rotator-text" data-quote-rotator-text>
        {{ quote_rotator.quotes | first | strip }}
      </p>
      <script type="application/json" data-quote-rotator-items>{{ quote_rotator.quotes | jsonify }}</script>
    </div>
    {% endif %}
    <div class="hero-actions">
      <a class="button button-primary" href="/essays/">Essays <span aria-hidden="true">→</span></a>
      <a class="button button-secondary" href="/projects/">Projects <span aria-hidden="true">→</span></a>
    </div>
  </div>
</section>


<section class="section" aria-labelledby="random-read-title">
  <article class="card card-random-read" data-random-read-card>
    <p class="card-label">Random Read</p>
    <p class="section-eyebrow card-random-read-eyebrow" data-random-read-eyebrow>Loading something good…</p>
    <h2 class="card-title" id="random-read-title" data-random-read-title>Finding a random piece from poetry, prose, and essays</h2>
    <p class="card-text" data-random-read-message>Pick a surprise read from the archive.</p>
    <div class="card-random-read-actions">
      <a class="card-link" data-random-read-link aria-disabled="true">Open random piece</a>
      <button class="button button-secondary" type="button" data-random-read-refresh>Pick another</button>
    </div>
  </article>
</section>

<section class="section" aria-labelledby="homepage-cards-title">
  {% assign home_cards = site.data.home_cards.cards %}
  {% if home_cards and home_cards.size > 0 %}
  <div class="page-intro page-intro--hero">
    <p class="section-eyebrow">Homepage Cards</p>
    <h2 class="section-title" id="homepage-cards-title">Fresh picks from the homepage editor</h2>
    <p class="section-subtitle">These cards are rendered directly from <code>_data/home_cards.yml</code>, so CMS edits show up here automatically.</p>
  </div>
  <div class="grid grid-2">
    {% for card in home_cards %}
    <article class="card">
      {% if card.type %}<p class="card-label">{{ card.type | escape }}</p>{% endif %}
      {% if card.title %}<h2 class="card-title">{{ card.title | escape }}</h2>{% endif %}
      {% if card.description %}<p class="card-text">{{ card.description | escape }}</p>{% endif %}
      {% if card.link_text and card.link_url %}<a class="card-link" href="{{ card.link_url | escape }}">{{ card.link_text | escape }}</a>{% endif %}
    </article>
    {% endfor %}
  </div>
  {% endif %}
</section>

<section class="section" aria-labelledby="featured-title">
  <div class="page-intro page-intro--hero">
    <p class="section-eyebrow">{{ site.data.site.featured_cards_eyebrow | default: "Featured Cards" | escape }}</p>
    <h2 class="section-title" id="featured-title">{{ site.data.site.featured_cards_title | default: "Highlights from the archive" | escape }}</h2>
    <p class="section-subtitle">{{ site.data.site.featured_cards_subtitle | default: "Mark projects, essays, and poems as featured in Pages CMS to show them here." | escape }}</p>
  </div>

  {% assign current_time = 'now' | date: '%s' %}
  {% assign featured_projects = site.pages
    | where_exp: "page", "page.path contains 'projects/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft | append: '' | downcase != 'true'"
    | where_exp: "page", "page.featured == true"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date | date: '%s' <= current_time"
    | sort: "featured_rank" %}
  {% assign featured_essays = site.pages
    | where_exp: "page", "page.path contains 'essays/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft | append: '' | downcase != 'true'"
    | where_exp: "page", "page.featured == true"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date | date: '%s' <= current_time"
    | sort: "featured_rank" %}
  {% assign featured_poetry = site.pages
    | where_exp: "page", "page.path contains 'poetry/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft | append: '' | downcase != 'true'"
    | where_exp: "page", "page.featured == true"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date | date: '%s' <= current_time"
    | sort: "featured_rank" %}

  {% assign featured_count = featured_projects.size | plus: featured_essays.size | plus: featured_poetry.size %}
  {% if featured_count > 0 %}
  <div class="grid grid-2">
    {% for project in featured_projects limit: 2 %}
    <article class="card">
      <p class="card-label">Project</p>
      <h3 class="card-title">{{ project.title | escape }}</h3>
      {% if project.description %}<p class="card-text">{{ project.description | escape }}</p>{% endif %}
      <a class="card-link" href="{{ project.url | relative_url | escape }}">Read more</a>
    </article>
    {% endfor %}

    {% for essay in featured_essays limit: 2 %}
    <article class="card">
      <p class="card-label">Essay</p>
      <h3 class="card-title">{{ essay.title | escape }}</h3>
      {% if essay.description %}<p class="card-text">{{ essay.description | escape }}</p>{% endif %}
      <a class="card-link" href="{{ essay.url | relative_url | escape }}">Read more</a>
    </article>
    {% endfor %}

    {% for poem in featured_poetry limit: 2 %}
    <article class="card">
      <p class="card-label">Poem</p>
      <h3 class="card-title">{{ poem.title | escape }}</h3>
      {% if poem.description %}<p class="card-text">{{ poem.description | escape }}</p>{% endif %}
      <a class="card-link" href="{{ poem.url | relative_url | escape }}">Read more</a>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">No featured pieces yet. Mark projects, essays, or poems as featured in Pages CMS.</p>
  </div>
  {% endif %}
</section>
