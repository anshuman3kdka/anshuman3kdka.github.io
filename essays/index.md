---
title: Essays
---

<ul>
{% for item in site.essays %}
  <li>
    <a href="{{ item.url }}">{{ item.title }}</a>
  </li>
{% endfor %}
</ul>
