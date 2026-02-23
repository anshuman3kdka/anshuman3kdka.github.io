---
title: Projects
---

<section class="section">
  {% assign project_items = site.pages
    | where_exp: "page", "page.path contains 'projects/'"
    | where_exp: "page", "page.name != 'index.md'"
    | sort: "title" %}

  {% if project_items.size > 0 %}
  <div class="content-list">
    {% for project in project_items %}
    <article class="content-item reveal">
      {% if project.eyebrow %}<p class="card-label">{{ project.eyebrow }}</p>{% endif %}
      <h3><a href="{{ project.url }}">{{ project.title }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card reveal">
    <p class="card-text">Project notes will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
