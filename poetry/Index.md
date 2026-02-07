---
title: Poetry
---

<ul>
{% for poem in site.poetry %}
  <li>
    <a href="{{ poem.url }}">{{ poem.title }}</a>
  </li>
{% endfor %}
</ul>
