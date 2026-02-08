---
title: Poetry
---

Browse the poems archived here:

{% assign poems = site.pages
  | where_exp: "page", "page.path contains 'poetry/'"
  | where_exp: "page", "page.name != 'index.md'"
  | sort: "title" %}

{% if poems.size > 0 %}
{% for poem in poems %}
- [{{ poem.title }}]({{ poem.url }})
{% endfor %}
{% else %}
No poems yet. Check back soon.
{% endif %}
