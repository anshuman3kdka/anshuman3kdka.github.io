---
title: Home
description: Anshuman’s personal site featuring thoughtful essays, original poetry, and hands-on projects, with notes on writing, literature, and creative experiments.
---

{% assign home_index = site.data.home_index %}
{% assign entries = home_index.index_entries | default: empty %}

<section class="home-index-layout" aria-label="Homepage index layout">
  <aside class="home-anchor-zone" aria-label="Current desk note">
    <p class="home-anchor-name">{{ home_index.anchor.byline_name | default: site.data.site.site_title }}</p>
    <p class="home-anchor-thought">{{ home_index.anchor.current_thought }}</p>
    <a class="home-anchor-link" href="#" data-random-read-inline>Start somewhere <span aria-hidden="true">→</span></a>
  </aside>

  <section class="home-index-zone" aria-label="Idea index">
    <div class="home-index-grid">
      {% for entry in entries %}
      {% assign tag_count = entry.tags | size %}
      <article class="home-index-item" data-thread-item data-tags="{{ entry.tags | join: '|' | downcase }}">
        <p class="home-index-theme">{{ entry.theme }}</p>
        <h2 class="home-index-title"><a href="{{ entry.url | relative_url }}">{{ entry.title }}</a></h2>
        <p class="home-index-description">{{ entry.description }}</p>
        <p class="home-index-connections" aria-label="{{ tag_count }} connected themes">
          {% for dot in (1..tag_count) %}<span aria-hidden="true">●</span>{% endfor %}
        </p>
      </article>
      {% endfor %}
    </div>
  </section>

  <aside class="home-thread-zone" aria-label="Active threads">
    <ul class="home-thread-list">
      {% assign collected_tags = '' | split: '' %}
      {% for entry in entries %}
        {% for raw_tag in entry.tags %}
          {% assign cleaned_tag = raw_tag | downcase | strip %}
          {% unless collected_tags contains cleaned_tag %}
            {% assign collected_tags = collected_tags | push: cleaned_tag %}
          {% endunless %}
        {% endfor %}
      {% endfor %}
      {% assign sorted_tags = collected_tags | sort %}
      {% for tag in sorted_tags %}
      <li>
        <button type="button" class="home-thread-tag" data-thread-tag="{{ tag }}">{{ tag }}</button>
      </li>
      {% endfor %}
    </ul>
  </aside>
</section>
