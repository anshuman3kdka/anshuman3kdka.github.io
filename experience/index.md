---
title: Experience
description: Browse Experience entries.
section_key: experience
section_label: Experience
---

<section class="section">
  {% assign current_time = 'now' | date: '%s' %}
  {% capture section_path_prefix %}{{ page.section_key }}/{% endcapture %}
  {% assign section_items = site.pages
    | where_exp: "page", "page.path contains section_path_prefix"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date <= site.time" %}
  {% assign featured_section_items = section_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_section_items = section_items | where_exp: "page", "page.featured != true" | sort: "title" %}

  {% if section_items.size > 0 %}
  <div class="content-list">
    {% for item in featured_section_items %}
    <article class="content-item">
      {% if item.eyebrow %}<p class="content-eyebrow">{{ item.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ item.url | relative_url | escape }}">{{ item.title | escape }}</a></h3>
    </article>
    {% endfor %}
    {% for item in regular_section_items %}
    <article class="content-item">
      {% if item.eyebrow %}<p class="content-eyebrow">{{ item.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ item.url | relative_url | escape }}">{{ item.title | escape }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">Experience entries will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
