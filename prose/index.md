---
title: Prose
description: Step into short fiction and narrative experiments crafted to entertain, surprise, and stay with you after the last line.
---

<section class="section">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign prose_items = site.pages
    | where_exp: "page", "page.path contains 'prose/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date | date: '%s' <= current_time"
    | sort: "title" %}

  {% if prose_items.size > 0 %}
  <div class="content-list">
    {% for prose in prose_items %}
    <article class="content-item">
      {% if prose.eyebrow %}<p class="content-eyebrow">{{ prose.eyebrow }}</p>{% endif %}
      <h3><a href="{{ prose.url }}">{{ prose.title }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">Prose entries will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
