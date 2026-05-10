---
title: Projects
intro_spacing_class: page-intro--compact
description: Build trust fast by browsing hands-on projects that show how I turn ideas into practical, user-focused outcomes.
category_browse: true
---

<section class="section category-browse" aria-label="Projects entries">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign project_items = site.pages
    | where_exp: "page", "page.path contains 'projects/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true" %}
  {% assign featured_projects = project_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_projects = project_items | where_exp: "page", "page.featured != true" | sort: "title" %}

  <div class="category-browse-summary tactile-deboss">
    <p class="category-browse-summary__label">Projects shelf</p>
    <p class="category-browse-summary__count">{{ project_items.size }} {% if project_items.size == 1 %}piece{% else %}pieces{% endif %}</p>
  </div>

  {% if project_items.size > 0 %}
  <div class="category-browse-list">
    {% for project in featured_projects %}
    {% assign item_words = project.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ project.url | relative_url | escape }}">
        <span class="category-browse-item__meta">
          {% if project.eyebrow %}{{ project.eyebrow | escape }}{% else %}Projects{% endif %}
        </span>
        <span class="category-browse-item__time tactile-deboss">{{ read_minutes }} min</span>
        <h2>{{ project.title | escape }}</h2>
        <p>{% if project.description %}{{ project.description | escape }}{% else %}{{ project.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endfor %}
    {% for project in regular_projects %}
    {% assign item_words = project.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ project.url | relative_url | escape }}">
        <span class="category-browse-item__meta">
          {% if project.eyebrow %}{{ project.eyebrow | escape }}{% else %}Projects{% endif %}
        </span>
        <span class="category-browse-item__time tactile-deboss">{{ read_minutes }} min</span>
        <h2>{{ project.title | escape }}</h2>
        <p>{% if project.description %}{{ project.description | escape }}{% else %}{{ project.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>The desk is empty here. Project notes will appear as they are added.</p>
  </div>
  {% endif %}
</section>
