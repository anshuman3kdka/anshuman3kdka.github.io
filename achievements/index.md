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
            {% assign achievement_heading = achievement.display_title | default: achievement.title %}
            <small>{% if achievement.eyebrow %}{{ achievement.eyebrow | escape }}{% else %}Achievement{% endif %}</small>
            <strong>{% if achievement_heading %}{{ achievement_heading | escape }}{% else %}Untitled achievement{% endif %}</strong>
            {% if achievement.title and achievement.title != achievement_heading %}<em>{{ achievement.title | escape }}</em>{% endif %}
          </span>
        </summary>
        <div class="desk-node-details">
          {% assign achievement_heading = achievement.display_title | default: achievement.title %}
          {% if achievement.title and achievement.title != achievement_heading %}<h3>{{ achievement.title | escape }}</h3>{% endif %}
          {% if achievement.date %}<time datetime="{{ achievement.date | date_to_xmlschema }}">{{ achievement.date | date: '%B %-d, %Y' }}</time>{% endif %}
          {% if achievement.content != '' %}<div class="desk-node-detail-block">{{ achievement.content }}</div>{% elsif achievement.details %}<p>{{ achievement.details | escape }}</p>{% endif %}
          {% if achievement.image %}<img src="{{ achievement.image | relative_url | escape }}" alt="{% if achievement.display_title %}{{ achievement.display_title | escape }}{% elsif achievement.title %}{{ achievement.title | escape }}{% else %}Achievement{% endif %} image" loading="lazy">{% endif %}
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
