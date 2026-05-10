---
title: Experience
description: Browse Experience entries.
section_key: experience
section_label: Experience
category_browse: true
---

<section class="section category-browse" aria-label="Experience entries">
  {% capture section_path_prefix %}{{ page.section_key }}/{% endcapture %}
  {% assign section_items = site.pages
    | where_exp: "page", "page.path contains section_path_prefix"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true" %}
  {% assign featured_section_items = section_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_section_items = section_items | where_exp: "page", "page.featured != true" | sort: "title" %}

  <div class="category-browse-summary tactile-deboss">
    <p class="category-browse-summary__label">Experience shelf</p>
    <p class="category-browse-summary__count">{{ section_items.size }} {% if section_items.size == 1 %}entry{% else %}entries{% endif %}</p>
  </div>

  {% if section_items.size > 0 %}
  <div class="category-browse-list">
    {% for item in featured_section_items %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ item.url | relative_url | escape }}">
        <span class="category-browse-item__meta">{% if item.eyebrow %}{{ item.eyebrow | escape }}{% else %}Experience{% endif %}</span>
        <span class="category-browse-item__time tactile-deboss">Entry</span>
        <h2>{{ item.title | escape }}</h2>
        <p>{% if item.description %}{{ item.description | escape }}{% else %}Experience note from the archive.{% endif %}</p>
      </a>
    </article>
    {% endfor %}
    {% for item in regular_section_items %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ item.url | relative_url | escape }}">
        <span class="category-browse-item__meta">{% if item.eyebrow %}{{ item.eyebrow | escape }}{% else %}Experience{% endif %}</span>
        <span class="category-browse-item__time tactile-deboss">Entry</span>
        <h2>{{ item.title | escape }}</h2>
        <p>{% if item.description %}{{ item.description | escape }}{% else %}Experience note from the archive.{% endif %}</p>
      </a>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>Experience entries will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
