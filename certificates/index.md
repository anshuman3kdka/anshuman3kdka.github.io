---
title: Certificates
description: Track completed courses and professional certificates in one place.
category_browse: true
---

<section class="section category-browse" aria-label="Certificate entries">
  {% assign current_time = 'now' | date: '%s' %}
  {% assign certificate_items = site.pages
    | where_exp: "page", "page.path contains 'certificates/'"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true" %}
  {% assign featured_certificates = certificate_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_certificates = certificate_items | where_exp: "page", "page.featured != true" | sort: "title" %}
  {% assign public_item_count = 0 %}
  {% for certificate in certificate_items %}
    {% assign item_publish_time = certificate.publish_date | date: '%s' %}
    {% assign item_is_public = true %}
    {% if certificate.publish_date and certificate.publish_date != '' and item_publish_time > current_time %}
      {% assign item_is_public = false %}
    {% endif %}
    {% if item_is_public %}
      {% assign public_item_count = public_item_count | plus: 1 %}
    {% endif %}
  {% endfor %}

  <div class="category-browse-summary tactile-deboss">
    <p class="category-browse-summary__label">Certificate shelf</p>
    <p class="category-browse-summary__count">{{ public_item_count }} {% if public_item_count == 1 %}record{% else %}records{% endif %}</p>
  </div>

  {% if public_item_count > 0 %}
  <div class="category-browse-list">
    {% for certificate in featured_certificates %}
    {% assign item_publish_time = certificate.publish_date | date: '%s' %}
    {% unless certificate.publish_date and certificate.publish_date != '' and item_publish_time > current_time %}
    {% assign item_words = certificate.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ certificate.url | relative_url | escape }}">
        <span class="category-browse-item__meta">{% if certificate.eyebrow %}{{ certificate.eyebrow | escape }}{% else %}Certificate{% endif %}</span>
        <span class="category-browse-item__time tactile-deboss">Record</span>
        <h2>{{ certificate.title | escape }}</h2>
        <p>{% if certificate.description %}{{ certificate.description | escape }}{% else %}{{ certificate.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endunless %}
    {% endfor %}
    {% for certificate in regular_certificates %}
    {% assign item_publish_time = certificate.publish_date | date: '%s' %}
    {% unless certificate.publish_date and certificate.publish_date != '' and item_publish_time > current_time %}
    {% assign item_words = certificate.content | strip_html | number_of_words %}
    {% assign read_minutes = item_words | divided_by: 180 %}
    {% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ certificate.url | relative_url | escape }}">
        <span class="category-browse-item__meta">{% if certificate.eyebrow %}{{ certificate.eyebrow | escape }}{% else %}Certificate{% endif %}</span>
        <span class="category-browse-item__time tactile-deboss">Record</span>
        <h2>{{ certificate.title | escape }}</h2>
        <p>{% if certificate.description %}{{ certificate.description | escape }}{% else %}{{ certificate.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endunless %}
    {% endfor %}
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>Course certificates will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
