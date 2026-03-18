---
title: Certificates
description: Track completed courses and professional certificates in one place.
---

<section class="section">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign certificate_items = site.pages
    | where_exp: "page", "page.path contains 'certificates/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft | append: '' | downcase != 'true'"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date | date: '%s' <= current_time"
    | sort: "title" %}

  {% if certificate_items.size > 0 %}
  <div class="content-list">
    {% for certificate in certificate_items %}
    <article class="content-item">
      {% if certificate.eyebrow %}<p class="content-eyebrow">{{ certificate.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ certificate.url | relative_url | escape }}">{{ certificate.title | escape }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">Course certificates will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
