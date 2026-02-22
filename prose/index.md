---
title: Prose
---

<section class="section page-intro reveal">
</section>

<section class="section">
  {% assign prose_items = site.pages
    | where_exp: "page", "page.path contains 'prose/'"
    | where_exp: "page", "page.name != 'index.md'"
    | sort: "title" %}

  {% if prose_items.size > 0 %}
  <div class="content-list">
    {% for prose in prose_items %}
    <article class="content-item reveal">
      <h3><a href="{{ prose.url }}">{{ prose.title }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card reveal">
    <p class="card-text">Prose entries will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
