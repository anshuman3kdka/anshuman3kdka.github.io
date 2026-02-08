---
title: Essays
---

Essays will appear here as they are added.

{% assign essay_items = site.pages
  | where_exp: "page", "page.path contains 'essays/'"
  | where_exp: "page", "page.name != 'index.md'"
  | sort: "title" %}

{% if essay_items.size > 0 %}
{% for essay in essay_items %}
- [{{ essay.title }}]({{ essay.url }})
{% endfor %}
{% endif %}
