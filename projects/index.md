---
title: Projects
intro_spacing_class: page-intro--compact
description: Build trust fast by browsing hands-on projects that show how I turn ideas into practical, user-focused outcomes.
---

<section class="section section--tight">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign project_items = site.pages
    | where_exp: "page", "page.path contains 'projects/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft | append: '' | downcase != 'true'"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date | date: '%s' <= current_time" %}
  {% assign featured_projects = project_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_projects = project_items | where_exp: "page", "page.featured != true" | sort: "title" %}

  {% if project_items.size > 0 %}
  <div class="content-list content-list--compact">
    {% for project in featured_projects %}
    <article class="content-item">
      {% if project.eyebrow %}<p class="content-eyebrow">{{ project.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ project.url | relative_url | escape }}">{{ project.title | escape }}</a></h3>
    </article>
    {% endfor %}
    {% for project in regular_projects %}
    <article class="content-item">
      {% if project.eyebrow %}<p class="content-eyebrow">{{ project.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ project.url | relative_url | escape }}">{{ project.title | escape }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">Project notes will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
