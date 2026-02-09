---
title: Projects
---

<section class="section page-intro reveal">
  <p class="section-eyebrow">Projects</p>
  <h1 class="page-title">Systems, experiments, and product explorations.</h1>
  <p class="page-lead">A growing archive of creative technology work, prototypes, and structured thinking tools.</p>
</section>

<section class="section">
  {% assign project_items = site.pages
    | where_exp: "page", "page.path contains 'projects/'"
    | where_exp: "page", "page.name != 'index.md'"
    | sort: "title" %}

  {% if project_items.size > 0 %}
  <div class="content-list">
    {% for project in project_items %}
    <article class="content-item reveal">
      <h3><a href="{{ project.url }}">{{ project.title }}</a></h3>
      <p>Project · {{ project.url }}</p>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card reveal">
    <p class="card-text">Project notes will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
