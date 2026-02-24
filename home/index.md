---
title: Home
---

<section class="section page-intro reveal">
  <h1 class="page-title">{{ page.title }}</h1>
</section>

<section class="section reveal" aria-labelledby="favorite-excerpts-title">
  <p class="section-eyebrow">Reading Journal</p>
  <h2 id="favorite-excerpts-title" class="section-title">Favorite Excerpts</h2>
  <p class="section-subtitle">A small shelf of lines I return to when I need clarity, wonder, or courage.</p>

  <div class="quote-grid" data-quote-grid data-quote-count="8">
    {% for quote in site.data.quotes limit: 10 %}
      <article class="quote-card" data-quote-card>
        <p class="quote-text">“{{ quote.text }}”</p>
        <p class="quote-source">
          <a href="{{ quote.source_url }}" target="_blank" rel="noopener noreferrer">{{ quote.source_title }}</a>
        </p>
      </article>
    {% endfor %}
  </div>
</section>
