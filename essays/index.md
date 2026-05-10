---
title: Essays
description: Explore clear, thought-provoking essays where ideas are unpacked with honesty, structure, and a fresh student perspective.
category_browse: true
---

<section class="section category-browse" aria-label="Essays entries">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign essay_items = site.pages
    | where_exp: "page", "page.path contains 'essays/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true" %}
  {% assign featured_essays = essay_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_essays = essay_items | where_exp: "page", "page.featured != true" | sort: "title" %}

  <div class="category-browse-summary tactile-deboss">
    <p class="category-browse-summary__label">Essays shelf</p>
    <p class="category-browse-summary__count">{{ essay_items.size }} {% if essay_items.size == 1 %}piece{% else %}pieces{% endif %}</p>
  </div>

  {% if essay_items.size > 0 %}
  <div class="category-browse-list">
    {% for essay in featured_essays %}
    {% assign item_words = essay.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ essay.url | relative_url | escape }}">
        <span class="category-browse-item__meta">
          {% if essay.eyebrow %}{{ essay.eyebrow | escape }}{% else %}Essays{% endif %}
        </span>
        <span class="category-browse-item__time tactile-deboss">{{ read_minutes }} min</span>
        <h2>{{ essay.title | escape }}</h2>
        <p>{% if essay.description %}{{ essay.description | escape }}{% else %}{{ essay.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endfor %}
    {% for essay in regular_essays %}
    {% assign item_words = essay.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ essay.url | relative_url | escape }}">
        <span class="category-browse-item__meta">
          {% if essay.eyebrow %}{{ essay.eyebrow | escape }}{% else %}Essays{% endif %}
        </span>
        <span class="category-browse-item__time tactile-deboss">{{ read_minutes }} min</span>
        <h2>{{ essay.title | escape }}</h2>
        <p>{% if essay.description %}{{ essay.description | escape }}{% else %}{{ essay.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>The desk is empty here. Essays will appear as they are added.</p>
  </div>
  {% endif %}
</section>
