---
title: Certificates
description: Track completed courses and professional certificates in one place.
category_browse: true
---

<section class="section category-browse" aria-label="Certificate entries">
  {% assign certificate_items = site.pages
    | where_exp: "page", "page.path contains 'certificates/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true"
    | sort: "title" %}

  <div class="category-browse-summary tactile-deboss">
    <p class="category-browse-summary__label">Certificate shelf</p>
    <p class="category-browse-summary__count">{{ certificate_items.size }} {% if certificate_items.size == 1 %}record{% else %}records{% endif %}</p>
  </div>

  {% if certificate_items.size > 0 %}
  <div class="category-browse-list">
    {% for certificate in certificate_items %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ certificate.url | relative_url | escape }}">
        <span class="category-browse-item__meta">{% if certificate.eyebrow %}{{ certificate.eyebrow | escape }}{% else %}Certificate{% endif %}</span>
        <span class="category-browse-item__time tactile-deboss">Record</span>
        <h2>{{ certificate.title | escape }}</h2>
        <p>{% if certificate.description %}{{ certificate.description | escape }}{% else %}Course certificate details and credentials.{% endif %}</p>
      </a>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>Course certificates will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
