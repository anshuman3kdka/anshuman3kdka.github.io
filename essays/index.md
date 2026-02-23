---
title: Essays
---

<section class="section">
  {% assign essay_items = site.pages
    | where_exp: "page", "page.path contains 'essays/'"
    | where_exp: "page", "page.url != '/essays/'"
    | sort: "title" %}

  {% if essay_items.size > 0 %}
  <div class="content-list">
    {% for essay in essay_items %}
    <article class="content-item reveal">
      {% if essay.eyebrow %}<p class="card-label">{{ essay.eyebrow }}</p>{% endif %}
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
