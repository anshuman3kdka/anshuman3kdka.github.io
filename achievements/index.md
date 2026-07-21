---
title: Achievements
description: See milestones, recognitions, and progress snapshots that reflect consistent effort, growth, and real-world impact.
default_card_description: More details coming soon.
desk_page: true
---

<section class="section desk-page desk-achievements" aria-label="Achievement timeline">
  {% assign achievement_items = site.pages
    | where_exp: "page", "page.path contains 'achievements/'"
    | where_exp: "page", "page.name != 'index.md'"
    | sort: "title" %}
  {% assign public_item_count = achievement_items | size %}

  <div class="desk-timeline-heading desk-timeline-heading--intro tactile-deboss">
    <p class="desk-kicker">The Desk</p>
    <h2>A timeline of recognitions, competitions, and progress markers.</h2>
    <p>Tap a node to expand it. Think of each item like a pin on a physical desk board.</p>
  </div>

  {% if public_item_count > 0 %}
  <div class="desk-timeline" aria-label="Achievement nodes">
    <div class="desk-timeline-track" aria-hidden="true"></div>
    <div class="desk-timeline-list">
      {% assign first_public_rendered = false %}
      {% for achievement in achievement_items %}
      <details class="desk-node tactile-card"{% unless first_public_rendered %} open{% endunless %}>
      {% assign first_public_rendered = true %}
        <summary>
          <span class="desk-node-dot" aria-hidden="true"></span>
          <span>
            <small>{% if achievement.eyebrow %}{{ achievement.eyebrow | escape }}{% else %}Achievement{% endif %}</small>
            <strong>{% if achievement.title %}{{ achievement.title | escape }}{% else %}Untitled achievement{% endif %}</strong>
          </span>
        </summary>
        <div class="desk-node-details">
          <p><strong>Title:</strong> {% if achievement.title %}{{ achievement.title | escape }}{% endif %}</p>
          <p><strong>Date:</strong> {% if achievement.date %}{{ achievement.date | date: '%B %-d, %Y' }}{% endif %}</p>
          <div class="desk-node-detail-block"><strong>Details:</strong>{% if achievement.content != '' %}{{ achievement.content }}{% elsif achievement.details %}<p>{{ achievement.details | escape }}</p>{% endif %}</div>
          <div class="desk-node-detail-block"><strong>Image:</strong>{% if achievement.image %}<img src="{{ achievement.image | relative_url | escape }}" alt="{% if achievement.title %}{{ achievement.title | escape }} image{% else %}Achievement image{% endif %}" loading="lazy">{% endif %}</div>
        </div>
      </details>
      {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>Still on it! Achievements will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
