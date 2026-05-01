---
title: Home
description: Anshuman’s personal site featuring thoughtful essays, original poetry, and hands-on projects, with notes on writing, literature, and creative experiments.
---

<section class="section section--hero hero-editorial" aria-labelledby="hero-title">
  <div class="hero-editorial__content">
    <p class="section-eyebrow">Writer · Student · Occasionally builds things</p>
    <h1 class="hero-title" id="hero-title">{{ site.data.site.site_title | default: 'Anshuman3kdka' | escape }}</h1>
    <p class="hero-lead">{{ site.data.site.site_tagline | default: "I write essays, fiction, and poetry. Usually about literature, occasionally about why most of it fails." | escape }}</p>
    <p class="hero-body">Thoughts shaped late at night, revised in the morning, and published when they feel true enough to keep.</p>
    <div class="hero-actions">
      <a class="button button-primary" href="/essays/">Read Essays <span aria-hidden="true">→</span></a>
      <a class="button button-secondary" href="/essays/">Explore Archive <span aria-hidden="true">→</span></a>
    </div>
  </div>
  <aside class="hero-visual" aria-label="Writing desk scene">
    <img src="/assets/uploads/Screenshot_20260309-210944.webp" alt="Notebook and warm desk light" loading="eager" decoding="async">
    <div class="hero-quote-card" role="note">
      <p>“Good ideas age. Good writing lasts.”</p>
    </div>
  </aside>
</section>

<section class="section" aria-labelledby="random-read-title">
  <article class="random-read-feature" data-random-read-card>
    <div class="random-read-feature__content">
      <p class="card-label">Random Read</p>
      <p class="section-eyebrow card-random-read-eyebrow" data-random-read-eyebrow>Featured Discovery</p>
      <h2 class="card-title" id="random-read-title" data-random-read-title>Finding a random piece from poetry, prose, and essays</h2>
      <p class="card-text" data-random-read-message>Pick a surprise read from the archive.</p>
      <div class="card-random-read-actions">
        <a class="button button-primary" data-random-read-link aria-disabled="true">Read this piece</a>
        <button class="button button-secondary" type="button" data-random-read-refresh>Pick another</button>
      </div>
    </div>
    <div class="random-read-feature__art" aria-hidden="true"></div>
  </article>
</section>

<section class="section" aria-labelledby="homepage-cards-title">
  {% assign home_cards = site.data.home_cards.cards %}
  {% if home_cards and home_cards.size > 0 %}
  <div class="page-intro page-intro--hero">
    <p class="section-eyebrow">Writing</p>
    <h2 class="section-title" id="homepage-cards-title">Editorial picks from the desk</h2>
  </div>
  <div class="grid grid-2 editorial-grid">
    {% for card in home_cards %}
    <article class="card editorial-card">
      {% if card.type %}<p class="card-label">{{ card.type | escape }}</p>{% endif %}
      {% if card.title %}<h3 class="card-title">{{ card.title | escape }}</h3>{% endif %}
      {% if card.description %}<p class="card-text">{{ card.description | escape }}</p>{% endif %}
      {% if card.image %}<img class="editorial-card__thumb" src="{{ card.image | escape }}" alt="" loading="lazy" decoding="async">{% endif %}
      {% if card.link_text and card.link_url %}<a class="card-link" href="{{ card.link_url | escape }}">{{ card.link_text | escape }}</a>{% endif %}
    </article>
    {% endfor %}
  </div>
  {% endif %}
</section>

<section class="section" aria-labelledby="featured-title">
  <div class="page-intro page-intro--hero">
    <p class="section-eyebrow">Featured</p>
    <h2 class="section-title" id="featured-title">Ways to Read Me</h2>
  </div>

  <div class="ways-to-read" role="list">
    <a class="way-block" role="listitem" href="/essays/">
      <span class="way-icon" aria-hidden="true">✦</span>
      <h3>Essays → Thinking</h3>
      <p>Critical reflections on literature, culture, and life.</p>
    </a>
    <a class="way-block" role="listitem" href="/creative/">
      <span class="way-icon" aria-hidden="true">✦</span>
      <h3>Creative → Feeling</h3>
      <p>Poems and stories written from mood, memory, and wonder.</p>
    </a>
    <a class="way-block" role="listitem" href="/projects/">
      <span class="way-icon" aria-hidden="true">✦</span>
      <h3>Projects → Building</h3>
      <p>Experiments, tools, and practical ideas brought to life.</p>
    </a>
    <a class="way-block" role="listitem" href="/achievements/">
      <span class="way-icon" aria-hidden="true">✦</span>
      <h3>Achievements → Proof</h3>
      <p>Milestones, recognitions, and moments worth documenting.</p>
    </a>
  </div>
</section>
