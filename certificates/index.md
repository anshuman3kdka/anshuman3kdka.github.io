---
title: Certificates
description: Track completed courses and professional certificates in one place.
---

<section class="section">
  {% assign certificate_items = site.pages
    | where_exp: "page", "page.path contains 'certificates/'"
    | where_exp: "page", "page.name != 'index.md'"
    | sort: "title" %}

  {% if certificate_items.size > 0 %}
  <div class="content-list">
    {% for certificate in certificate_items %}
    <article class="content-item">
      {% if certificate.eyebrow %}<p class="content-eyebrow">{{ certificate.eyebrow }}</p>{% endif %}
      <h3><a href="{{ certificate.url }}">{{ certificate.title }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">Course certificates will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
