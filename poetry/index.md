---
title: Poetry
---

<section class="section page-intro reveal">
</section>

<section class="section">
  {% assign poems = site.pages
    | where_exp: "page", "page.path contains 'poetry/'"
    | where_exp: "page", "page.name != 'index.md'"
    | sort: "title" %}

  {% if poems.size > 0 %}
  <div class="content-list">
    {% for poem in poems %}
    <article class="content-item reveal">
      <h3><a href="{{ poem.url }}">{{ poem.title }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card reveal">
    <p class="card-text">No poems yet. Check back soon.</p>
  </div>
  {% endif %}
</section>
