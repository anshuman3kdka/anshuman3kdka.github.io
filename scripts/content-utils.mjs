import path from 'node:path';
import yaml from 'js-yaml';

export const slugify = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const toSentenceCase = (value) => String(value || '')
  .replace(/[-_]+/g, ' ')
  .replace(/\b\w/g, (char) => char.toUpperCase());

export const buildIndexPage = ({ label, slug, description }) => `---
title: ${label}
description: ${description || `Browse ${label} entries.`}
section_key: ${slug}
section_label: ${label}
---

<section class="section">
  {% assign current_time = 'now' | date: '%s' %}
  {% capture section_path_prefix %}{{ page.section_key }}/{% endcapture %}
  {% assign section_items = site.pages
    | where_exp: "page", "page.path contains section_path_prefix"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true"
    | where_exp: "page", "page.publish_date == nil or page.publish_date == '' or page.publish_date <= site.time" %}
  {% assign featured_section_items = section_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_section_items = section_items | where_exp: "page", "page.featured != true" | sort: "title" %}

  {% if section_items.size > 0 %}
  <div class="content-list">
    {% for item in featured_section_items %}
    <article class="content-item">
      {% if item.eyebrow %}<p class="content-eyebrow">{{ item.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ item.url | relative_url | escape }}">{{ item.title | escape }}</a></h3>
    </article>
    {% endfor %}
    {% for item in regular_section_items %}
    <article class="content-item">
      {% if item.eyebrow %}<p class="content-eyebrow">{{ item.eyebrow | escape }}</p>{% endif %}
      <h3><a href="{{ item.url | relative_url | escape }}">{{ item.title | escape }}</a></h3>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="card">
    <p class="card-text">${label} entries will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
`;

export const uniqueSections = (sections) => {
  const seen = new Set();
  return sections.filter((section) => {
    if (!section.slug || seen.has(section.slug)) return false;
    seen.add(section.slug);
    return true;
  });
};

export const extractFrontMatter = (text) => {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: text };

  try {
    const parsed = yaml.load(match[1]);
    const data = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    return { data, body: text.slice(match[0].length) };
  } catch {
    return { data: {}, body: text.slice(match[0].length) };
  }
};

export const toIsoString = (value) => {
  if (!value) return null;
  const date = new Date(value instanceof Date ? value : String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const categoryFromPath = (relativePath) => relativePath.split('/')[0];

export const toUrl = (relativePath, frontMatterData) => {
  const permalink = typeof frontMatterData.permalink === 'string' ? frontMatterData.permalink.trim() : '';
  if (permalink) {
    if (path.extname(permalink)) return permalink;
    return permalink.endsWith('/') ? permalink : `${permalink}/`;
  }

  const parsed = path.parse(relativePath);
  const ext = parsed.ext.toLowerCase();

  if (ext === '.html') {
    if (parsed.name === 'index') return `/${parsed.dir}/`.replace(/\/+/g, '/');
    return `/${parsed.dir}/${parsed.base}`.replace(/\/+/g, '/');
  }

  // Jekyll 'pretty' permalinks render non-index Markdown pages to "filename/index.html"
  // Keep clean folder-style URLs.
  if (ext === '.md') {
    if (parsed.name === 'index') return `/${parsed.dir}/`.replace(/\/+/g, '/');
    return `/${parsed.dir}/${parsed.name}/`.replace(/\/+/g, '/');
  }

  if (parsed.name === 'index') return `/${parsed.dir}/`.replace(/\/+/g, '/');
  return `/${parsed.dir}/${parsed.name}/`.replace(/\/+/g, '/');
};

export const extractTitle = (body, frontMatterData, fallback) => {
  if (typeof frontMatterData.title === 'string' && frontMatterData.title.trim()) return frontMatterData.title.trim();
  const headingMatch = body.match(/^#\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : fallback;
};

export const isDraftedOff = (frontMatterData) => String(frontMatterData.draft ?? '').trim().toLowerCase() === 'true';

export const isScheduledForFuture = (frontMatterData) => {
  if (!frontMatterData.publish_date) return false;

  const publishDate = new Date(
    frontMatterData.publish_date instanceof Date
      ? frontMatterData.publish_date
      : String(frontMatterData.publish_date),
  );
  if (Number.isNaN(publishDate.getTime())) return false;

  return publishDate.getTime() > Date.now();
};

export const stripMarkdown = (value) => String(value || '')
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
  .replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1')
  .replace(/^#{1,6}\s+/gm, '')
  .replace(/[>*_~\-]{1,3}/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const extractTags = (frontMatterData) => {
  if (Array.isArray(frontMatterData.tags)) return frontMatterData.tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof frontMatterData.tags === 'string') return frontMatterData.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  return [];
};
