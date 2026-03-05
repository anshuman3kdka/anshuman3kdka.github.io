---
title: Complete Sitemap
permalink: /sitemap/
description: A complete and detailed sitemap of every public page and file on Anshuman3kdka.
---

{% assign sorted_pages = site.pages | sort: 'url' %}
# Complete Sitemap

This page is a **human-friendly master sitemap** with every public URL we can list from the site build.

- **Primary XML sitemap for search engines:** [https://www.anshuman3kdka.in/sitemap.xml](https://www.anshuman3kdka.in/sitemap.xml)
- **This detailed sitemap page:** [https://www.anshuman3kdka.in/sitemap/](https://www.anshuman3kdka.in/sitemap/)

## Quick totals

- **Jekyll pages:** {{ site.pages | size }}
- **Documents in collections:**
  {% for collection in site.collections %}
  - `{{ collection.label }}`: {{ collection.docs | size }}
  {% endfor %}
- **Static files (images, JSON, JS, CSS, icons, etc.):** {{ site.static_files | size }}

## Main pages (site.pages)

| Title | URL | Source file |
|---|---|---|
{% for p in sorted_pages %}
| {{ p.title | default: '(untitled)' | replace: '|', '\|' }} | [{{ p.url }}]({{ p.url | relative_url }}) | `{{ p.path }}` |
{% endfor %}

## Collections (all long-form content)

{% for collection in site.collections %}
### Collection: `{{ collection.label }}` ({{ collection.docs | size }} items)

| Title | URL | Source file |
|---|---|---|
{% assign sorted_docs = collection.docs | sort: 'url' %}
{% for d in sorted_docs %}
| {{ d.title | default: d.slug | default: '(untitled)' | replace: '|', '\|' }} | [{{ d.url }}]({{ d.url | relative_url }}) | `{{ d.path }}` |
{% endfor %}

{% endfor %}

## Static files (site.static_files)

These are public files like images, scripts, stylesheets, manifests, and JSON indexes.

| Public URL | Source file |
|---|---|
{% assign sorted_static = site.static_files | sort: 'path' %}
{% for f in sorted_static %}
| [{{ f.path }}]({{ f.path | relative_url }}) | `{{ f.path }}` |
{% endfor %}

## SEO and crawler helper links

- [robots.txt]({{ '/robots.txt' | relative_url }})
- [BingSiteAuth.xml]({{ '/BingSiteAuth.xml' | relative_url }})
- [search-index.json]({{ '/search-index.json' | relative_url }})
- [random-read.json]({{ '/random-read.json' | relative_url }})
