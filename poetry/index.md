---
title: Poetry
description: Read all the latest poetic endeavours of Anshuman3kdka
---
<section class="section">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign poems = site.pages
    | where_exp: "page", "page.path contains 'poetry/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft | append: '' | downcase != 'true'"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date | date: '%s' <= current_time" %}
  {% assign featured_poems = poems | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_poems = poems | where_exp: "page", "page.featured != true" | sort: "title" %}

  {% if poems.size > 0 %}
  <div class="content-list">
    {% for poem in featured_poems %}
    <article class="content-item">
      {% if poem.eyebrow %}<p class="content-eyebrow">{{ poem.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ poem.url | relative_url | escape }}">{{ poem.title | escape }}</a></h3>
    </article>
    {% endfor %}
    {% for poem in regular_poems %}
    <article class="content-item">
      {% if poem.eyebrow %}<p class="content-eyebrow">{{ poem.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ poem.url | relative_url | escape }}">{{ poem.title | escape }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">No poems yet. Check back soon.</p>
  </div>
  {% endif %}
</section>
