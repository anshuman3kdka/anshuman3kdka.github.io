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
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date | date: '%s' <= current_time"
    | sort: "title" %}

  {% if essay_items.size > 0 %}
  <div class="content-list">
    {% for essay in essay_items %}
    <article class="content-item">
      {% if essay.eyebrow %}<p class="content-eyebrow">{{ essay.eyebrow }}</p>{% endif %}
      <h3><a href="{{ essay.url }}">{{ essay.title }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">Essays will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
