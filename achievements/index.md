---
title: Achievements
---

<section class="section">
  {% assign achievement_items = site.pages
    | where_exp: "page", "page.path contains 'achievements/'"
    | where_exp: "page", "page.name != 'index.md'"
    | sort: "title" %}

  {% if achievement_items.size > 0 %}
  <div class="content-list">
    {% for achievement in achievement_items %}
    <article class="content-item reveal">
      {% if achievement.eyebrow %}<p class="content-eyebrow">{{ achievement.eyebrow }}</p>{% endif %}
      <h3><a href="{{ achievement.url }}">{{ achievement.title }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card reveal">
    <p class="card-text">Still on it! Achievements will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
