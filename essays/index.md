---
title: Essays
---

<section class="section page-intro reveal">
  <p class="section-eyebrow">Essays</p>
  <h1 class="page-title">Long-form writing on creativity, systems, and craft.</h1>
  <p class="page-lead">A home for essays that explore how thoughtful work gets made. New posts appear here as they are published.</p>
</section>

<section class="section">
  {% assign essay_items = site.pages
    | where_exp: "page", "page.path contains 'essays/'"
    | where_exp: "page", "page.name != 'index.md'"
    | sort: "title" %}

  {% if essay_items.size > 0 %}
  <div class="content-list">
    {% for essay in essay_items %}
    <article class="content-item reveal">
      <h3><a href="{{ essay.url }}">{{ essay.title }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card reveal">
    <p class="card-text">Essays will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
