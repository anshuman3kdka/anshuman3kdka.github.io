---
title: Projects
---

<ul>
{% for item in site.projects %}
  <li>
    <a href="{{ item.url }}">{{ item.title }}</a>
  </li>
{% endfor %}
</ul>
