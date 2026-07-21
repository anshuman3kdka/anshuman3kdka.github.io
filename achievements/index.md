---
title: Achievements
description: See milestones, recognitions, and progress snapshots that reflect consistent effort, growth, and real-world impact.
default_card_description: More details coming soon.
desk_page: true
---

<section class="section desk-page desk-achievements" aria-label="Achievement timeline">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign achievement_items = site.pages
    | where_exp: "page", "page.path contains 'achievements/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true"
    | sort: "title" %}
  {% assign public_item_count = 0 %}
  {% for achievement in achievement_items %}
    {% assign item_publish_time = achievement.publish_date | date: '%s' %}
    {% unless achievement.publish_date and achievement.publish_date != '' and item_publish_time > current_time %}
      {% assign public_item_count = public_item_count | plus: 1 %}
    {% endunless %}
  {% endfor %}

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
      {% assign item_publish_time = achievement.publish_date | date: '%s' %}
      {% unless achievement.publish_date and achievement.publish_date != '' and item_publish_time > current_time %}
      <details class="desk-node tactile-card"{% unless first_public_rendered %} open{% endunless %}>
      {% assign first_public_rendered = true %}
        <summary>
          <span class="desk-node-dot" aria-hidden="true"></span>
          <span>
            <small>{% if achievement.eyebrow %}{{ achievement.eyebrow | escape }}{% else %}Achievement{% endif %}</small>
            <strong>{{ achievement.title | escape }}</strong>
          </span>
        </summary>
        <p>{% if achievement.description %}{{ achievement.description | escape }}{% else %}{{ page.default_card_description | default: 'More details coming soon.' | escape }}{% endif %}</p>
        <a class="card-link" href="{{ achievement.url | relative_url | escape }}">Open record</a>
      </details>
      {% endunless %}
      {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>Still on it! Achievements will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
