---
title: Poetry
description: Read all the latest poetic endeavours of Anshuman3kdka
category_browse: true
---

<section class="section category-browse" aria-label="Poetry entries">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign poems = site.pages
    | where_exp: "page", "page.path contains 'poetry/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true" %}
  {% assign featured_poems = poems | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_poems = poems | where_exp: "page", "page.featured != true" | sort: "title" %}

  <div class="category-browse-summary tactile-deboss">
    <p class="category-browse-summary__label">Poetry shelf</p>
    <p class="category-browse-summary__count">{{ poems.size }} {% if poems.size == 1 %}piece{% else %}pieces{% endif %}</p>
  </div>

  {% if poems.size > 0 %}
  <div class="category-browse-list">
    {% for poem in featured_poems %}
    {% assign item_words = poem.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ poem.url | relative_url | escape }}">
        <span class="category-browse-item__meta">
          {% if poem.eyebrow %}{{ poem.eyebrow | escape }}{% else %}Poetry{% endif %}
        </span>
        <span class="category-browse-item__time tactile-deboss">{{ read_minutes }} min</span>
        <h2>{{ poem.title | escape }}</h2>
        <p>{% if poem.description %}{{ poem.description | escape }}{% else %}{{ poem.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endfor %}
    {% for poem in regular_poems %}
    {% assign item_words = poem.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ poem.url | relative_url | escape }}">
        <span class="category-browse-item__meta">
          {% if poem.eyebrow %}{{ poem.eyebrow | escape }}{% else %}Poetry{% endif %}
        </span>
        <span class="category-browse-item__time tactile-deboss">{{ read_minutes }} min</span>
        <h2>{{ poem.title | escape }}</h2>
        <p>{% if poem.description %}{{ poem.description | escape }}{% else %}{{ poem.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>The desk is empty here. Poems will appear as they are added.</p>
  </div>
  {% endif %}
</section>
