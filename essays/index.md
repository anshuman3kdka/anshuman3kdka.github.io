---
title: Essays
description: Explore clear, thought-provoking essays where ideas are unpacked with honesty, structure, and a fresh student perspective.
---

<section class="section">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign essay_items = site.pages
    | where_exp: "page", "page.path contains 'essays/'"
    | where_exp: "page", "page.url != '/essays/'"
    | where_exp: "page", "page.draft != true"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date | date: '%s' <= current_time" %}
  {% assign featured_essays = essay_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_essays = essay_items | where_exp: "page", "page.featured != true" | sort: "title" %}

  {% if essay_items.size > 0 %}
  <div class="content-list">
    {% for essay in featured_essays %}
    <article class="content-item">
      {% if essay.eyebrow %}<p class="content-eyebrow">{{ essay.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ essay.url | relative_url | escape }}">{{ essay.title | escape }}</a></h3>
    </article>
    {% endfor %}
    {% for essay in regular_essays %}
    <article class="content-item">
      {% if essay.eyebrow %}<p class="content-eyebrow">{{ essay.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ essay.url | relative_url | escape }}">{{ essay.title | escape }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">Essays will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
