---
title: Prose
description: Step into short fiction and narrative experiments crafted to entertain, surprise, and stay with you after the last line.
category_browse: true
---

<section class="section category-browse" aria-label="Prose entries">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign prose_items = site.pages
    | where_exp: "page", "page.path contains 'prose/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true" %}
  {% assign featured_prose_items = prose_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_prose_items = prose_items | where_exp: "page", "page.featured != true" | sort: "title" %}

  <div class="category-browse-summary tactile-deboss">
    <p class="category-browse-summary__label">Prose shelf</p>
    <p class="category-browse-summary__count">{{ prose_items.size }} {% if prose_items.size == 1 %}piece{% else %}pieces{% endif %}</p>
  </div>

  {% if prose_items.size > 0 %}
  <div class="category-browse-list">
    {% for prose in featured_prose_items %}
    {% assign item_words = prose.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ prose.url | relative_url | escape }}">
        <span class="category-browse-item__meta">
          {% if prose.eyebrow %}{{ prose.eyebrow | escape }}{% else %}Prose{% endif %}
        </span>
        <span class="category-browse-item__time tactile-deboss">{{ read_minutes }} min</span>
        <h2>{{ prose.title | escape }}</h2>
        <p>{% if prose.description %}{{ prose.description | escape }}{% else %}{{ prose.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endfor %}
    {% for prose in regular_prose_items %}
    {% assign item_words = prose.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ prose.url | relative_url | escape }}">
        <span class="category-browse-item__meta">
          {% if prose.eyebrow %}{{ prose.eyebrow | escape }}{% else %}Prose{% endif %}
        </span>
        <span class="category-browse-item__time tactile-deboss">{{ read_minutes }} min</span>
        <h2>{{ prose.title | escape }}</h2>
        <p>{% if prose.description %}{{ prose.description | escape }}{% else %}{{ prose.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>The desk is empty here. Prose entries will appear as they are added.</p>
  </div>
  {% endif %}
</section>
