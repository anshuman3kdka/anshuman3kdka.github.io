---
title: Prose
---

Prose entries will appear here as they are added.

{% assign prose_items = site.pages
  | where_exp: "page", "page.path contains 'prose/'"
  | where_exp: "page", "page.name != 'index.md'"
  | sort: "title" %}

{% if prose_items.size > 0 %}
{% for prose in prose_items %}
- [{{ prose.title }}]({{ prose.url }})
{% endfor %}
{% endif %}
