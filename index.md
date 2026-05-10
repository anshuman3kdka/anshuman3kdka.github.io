---
title: Home
description: Anshuman’s personal site featuring thoughtful essays, original poetry, and hands-on projects, with notes on writing, literature, and creative experiments.
---

{% assign quote_rotator = site.data.home_quote_rotator %}
{% if quote_rotator.enabled and quote_rotator.quotes.size > 0 %}
<div class="home-quote-container" data-quote-rotator>
  {% for quote in quote_rotator.quotes %}
  <p class="home-quote-text" data-quote-item>{{ quote | escape }}</p>
  {% endfor %}
</div>
{% endif %}

<section class="section section--hero home-hero" aria-labelledby="hero-title">
  <div class="home-hero__left">
    <p class="home-eyebrow">WRITER · STUDENT · OCCASIONALLY VIBE-CODES</p>
    <h1 class="home-hero__title" id="hero-title">Words that question.<br><em>Stories that stay.</em></h1>
    <p class="home-hero__lead">I write essays, fiction, and poetry. Usually about literature, occasionally about why most of it fails.</p>
    <div class="hero-actions">
      <a class="button button-primary" href="/essays/">Explore Essays <span aria-hidden="true">→</span></a>
      <a class="button button-secondary" href="/projects/">Browse Projects <span aria-hidden="true">→</span></a>
    </div>
  </div>

  <aside class="home-hero__right" aria-label="Random read">
    <article class="currently-reading" data-random-read-card>
      <p class="card-label">Random Read</p>
      <p class="section-eyebrow card-random-read-eyebrow" data-random-read-eyebrow>On lost idealism</p>
      <h2 class="card-title" data-random-read-title>Merchants of Lush II</h2>
      <p class="card-text" data-random-read-message>A random pick from the archive.</p>
      <div class="card-random-read-actions">
        <a class="card-link" data-random-read-link aria-disabled="true">Read this piece</a>
        <button class="button button-secondary" type="button" data-random-read-refresh>Pick another</button>
      </div>
    </article>
  </aside>
</section>

<section class="section" aria-labelledby="categories-title">
  <h2 class="section-title home-section-title" id="categories-title">Explore by Category</h2>
  <div class="home-category-grid">
    <article class="card home-min-card"><h3 class="card-title">Essays</h3><p class="card-text">Ideas, arguments and reflections.</p><a class="card-link" href="/essays/">Browse essays</a></article>
    <article class="card home-min-card"><h3 class="card-title">Creative</h3><p class="card-text">Stories, scenes and worlds.</p><a class="card-link" href="/creative/">Browse creative</a></article>
    <article class="card home-min-card"><h3 class="card-title">Projects</h3><p class="card-text">Things I’m building and experimenting.</p><a class="card-link" href="/projects/">View projects</a></article>
    <article class="card home-min-card"><h3 class="card-title">Achievements</h3><p class="card-text">Milestones and recognitions.</p><a class="card-link" href="/achievements/">See achievements</a></article>
  </div>
</section>

<section class="section home-metrics" aria-label="Site metrics">
  <p>28+ essays written <span aria-hidden="true">·</span> 15+ creative pieces <span aria-hidden="true">·</span> 6 active projects <span aria-hidden="true">·</span> 8+ achievements</p>
</section>

<section class="section" aria-labelledby="featured-writing-title">
  <div class="home-featured-head">
    <h2 class="section-title home-section-title" id="featured-writing-title">Recent from the Desk</h2>
    <a class="button button-secondary" href="/essays/">View all essays</a>
  </div>
  <div class="home-desk-grid">
    <article class="card home-feature"><p class="card-label">Horror</p><h3 class="card-title">A Letter to You (Red Pen Edit)</h3><p class="card-text">Not every letter is meant to comfort you.</p><a class="card-link" href="/prose/A_letter_to_you/">Read prose</a></article>
    <article class="card home-feature"><p class="card-label">Essay</p><h3 class="card-title">On Lost Idealism</h3><p class="card-text">Chasing ideals in a world that moved on.</p><a class="card-link" href="/essays/">Read essay</a></article>
    <article class="card home-feature"><p class="card-label">Poetry</p><h3 class="card-title">Things That Don’t Heal</h3><p class="card-text">A small attempt at saying what stays.</p><a class="card-link" href="/poetry/">Read poem</a></article>
  </div>
</section>

<section class="section home-signature" aria-label="Signature line">
  <p><span></span><em>“I write to understand. You read to feel less alone.”</em><span></span></p>
</section>
