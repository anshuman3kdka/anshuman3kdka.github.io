---
title: Projects
---

Project notes will appear here as they are added.

{% assign project_items = site.pages
  | where_exp: "page", "page.path contains 'projects/'"
  | where_exp: "page", "page.name != 'index.md'"
  | sort: "title" %}

{% if project_items.size > 0 %}
{% for project in project_items %}
- [{{ project.title }}]({{ project.url }})
{% endfor %}
{% endif %}
