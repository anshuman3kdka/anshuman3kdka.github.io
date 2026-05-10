---
title: Experience
description: Browse Experience entries.
section_key: experience
section_label: Experience
category_browse: true
---

<section class="section category-browse" aria-label="Experience entries">
  {% assign current_time = 'now' | date: '%s' %}
  {% capture section_path_prefix %}{{ page.section_key }}/{% endcapture %}
  {% assign section_items = site.pages
    | where_exp: "page", "page.path contains section_path_prefix"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true" %}
  {% assign featured_section_items = section_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_section_items = section_items | where_exp: "page", "page.featured != true" | sort: "title" %}
  {% assign public_item_count = 0 %}
  {% for item in section_items %}
    {% assign item_publish_time = item.publish_date | date: '%s' %}
    {% assign item_is_public = true %}
    {% if item.publish_date and item.publish_date != '' and item_publish_time > current_time %}
      {% assign item_is_public = false %}
    {% endif %}
    {% if item_is_public %}
      {% assign public_item_count = public_item_count | plus: 1 %}
    {% endif %}
  {% endfor %}

  <div class="category-browse-summary tactile-deboss">
    <p class="category-browse-summary__label">Experience shelf</p>
    <p class="category-browse-summary__count">{{ public_item_count }} {% if public_item_count == 1 %}entry{% else %}entrys{% endif %}</p>
  </div>

  {% if public_item_count > 0 %}
  <div class="category-browse-list">
    {% for item in featured_section_items %}
    {% assign item_publish_time = item.publish_date | date: '%s' %}
    {% unless item.publish_date and item.publish_date != '' and item_publish_time > current_time %}
    {% assign item_words = item.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ item.url | relative_url | escape }}">
        <span class="category-browse-item__meta">{% if item.eyebrow %}{{ item.eyebrow | escape }}{% else %}Experience{% endif %}</span>
        <span class="category-browse-item__time tactile-deboss">Entry</span>
        <h2>{{ item.title | escape }}</h2>
        <p>{% if item.description %}{{ item.description | escape }}{% else %}{{ item.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endunless %}
    {% endfor %}
    {% for item in regular_section_items %}
    {% assign item_publish_time = item.publish_date | date: '%s' %}
    {% unless item.publish_date and item.publish_date != '' and item_publish_time > current_time %}
    {% assign item_words = item.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ item.url | relative_url | escape }}">
        <span class="category-browse-item__meta">{% if item.eyebrow %}{{ item.eyebrow | escape }}{% else %}Experience{% endif %}</span>
        <span class="category-browse-item__time tactile-deboss">Entry</span>
        <h2>{{ item.title | escape }}</h2>
        <p>{% if item.description %}{{ item.description | escape }}{% else %}{{ item.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endunless %}
    {% endfor %}
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>Experience entries will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
