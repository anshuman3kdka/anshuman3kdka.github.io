---
title: Achievements
description: See milestones, recognitions, and progress snapshots that reflect consistent effort, growth, and real-world impact.
---

<section class="section">
  {% assign achievement_items = site.pages
    | where_exp: "page", "page.path contains 'achievements/'"
    | where_exp: "page", "page.name != 'index.md'"
    | sort: "title" %}

  {% if achievement_items.size > 0 %}
  <div class="content-list">
    {% for achievement in achievement_items %}
    <article class="content-item">
      {% if achievement.eyebrow %}<p class="content-eyebrow">{{ achievement.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ achievement.url | escape }}">{{ achievement.title | escape }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">Still on it! Achievements will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
