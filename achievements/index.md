---
title: Achievements
description: See milestones, recognitions, and progress snapshots that reflect consistent effort, growth, and real-world impact.
---

<section class="section">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign achievement_items = site.pages
    | where_exp: "page", "page.path contains 'achievements/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date | date: '%s' <= current_time"
    | sort: "title" %}

  {% if achievement_items.size > 0 %}
  <div class="content-list">
    {% for achievement in achievement_items %}
    <article class="content-item">
      {% if achievement.eyebrow %}<p class="content-eyebrow">{{ achievement.eyebrow }}</p>{% endif %}
      <h3><a href="{{ achievement.url }}">{{ achievement.title }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">Still on it! Achievements will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
