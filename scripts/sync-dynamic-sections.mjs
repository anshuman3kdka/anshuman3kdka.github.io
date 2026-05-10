import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = process.cwd();
const siteDataPath = path.join(root, '_data', 'site.yml');
const pagesConfigPath = path.join(root, '.pages.yml');
const generatedMarkerStart = '  # BEGIN GENERATED DYNAMIC SECTIONS';
const generatedMarkerEnd = '  # END GENERATED DYNAMIC SECTIONS';

const proseFields = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'author', type: 'text', default: 'Anshuman3kdka', hidden: true },
  { name: 'eyebrow', label: 'Eyebrow Text (optional)', type: 'text', required: false },
  { name: 'description', label: 'SEO Description (optional)', type: 'text', required: false },
  { name: 'seo_title', label: 'SEO Title (optional)', type: 'text', required: false },
  { name: 'og_image', label: 'Open Graph Image (optional)', type: 'image', required: false },
  { name: 'canonical_url', label: 'Canonical URL (optional)', type: 'text', required: false },
  { name: 'noindex', label: 'Noindex (optional)', type: 'boolean', required: false },
  { name: 'featured_image', label: 'Featured Image (optional)', type: 'image', required: false },
  { name: 'draft', label: 'Draft', type: 'boolean', default: true },
  { name: 'featured', label: 'Feature on homepage', type: 'boolean', default: false },
  { name: 'featured_rank', label: 'Featured order (lower shows first)', type: 'text', required: false },
  {
    name: 'publish_date',
    label: 'Publish Date (optional)',
    type: 'date',
    options: { format: 'yyyy-MM-dd', time: true },
    required: false,
  },
  { name: 'body', label: 'Content', type: 'markdown' },
];

const pageFields = [
  { name: 'title', label: 'Page Title', type: 'text', required: true },
  { name: 'description', label: 'SEO Description (optional)', type: 'text', required: false },
  { name: 'seo_title', label: 'SEO Title (optional)', type: 'text', required: false },
  { name: 'og_image', label: 'Open Graph Image (optional)', type: 'image', required: false },
  { name: 'canonical_url', label: 'Canonical URL (optional)', type: 'text', required: false },
  { name: 'noindex', label: 'Noindex (optional)', type: 'boolean', required: false },
  { name: 'body', label: 'Content', type: 'markdown' },
];

const slugify = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const toSentenceCase = (value) => String(value || '')
  .replace(/[-_]+/g, ' ')
  .replace(/\b\w/g, (char) => char.toUpperCase());

const buildIndexPage = ({ label, slug, description }) => `---
title: ${label}
description: ${description || `Browse ${label} entries.`}
section_key: ${slug}
section_label: ${label}
category_browse: true
---

<section class="section category-browse" aria-label="${label} entries">
  {% capture section_path_prefix %}{{ page.section_key }}/{% endcapture %}
  {% assign section_items = site.pages
    | where_exp: "page", "page.path contains section_path_prefix"
    | where_exp: "page", "page.name != 'index.md'"
    | where_exp: "page", "page.draft != true" %}
  {% assign featured_section_items = section_items | where: "featured", true | sort: "featured_rank" %}
  {% assign regular_section_items = section_items | where_exp: "page", "page.featured != true" | sort: "title" %}

  <div class="category-browse-summary tactile-deboss">
    <p class="category-browse-summary__label">${label} shelf</p>
    <p class="category-browse-summary__count">{{ section_items.size }} {% if section_items.size == 1 %}entry{% else %}entries{% endif %}</p>
  </div>

  {% if section_items.size > 0 %}
  <div class="category-browse-list">
    {% for item in featured_section_items %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ item.url | relative_url | escape }}">
        <span class="category-browse-item__meta">{% if item.eyebrow %}{{ item.eyebrow | escape }}{% else %}${label}{% endif %}</span>
        <span class="category-browse-item__time tactile-deboss">Entry</span>
        <h2>{{ item.title | escape }}</h2>
        <p>{% if item.description %}{{ item.description | escape }}{% else %}{{ item.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endfor %}
    {% for item in regular_section_items %}
    <article class="category-browse-item tactile-card">
      <a class="category-browse-item__link" href="{{ item.url | relative_url | escape }}">
        <span class="category-browse-item__meta">{% if item.eyebrow %}{{ item.eyebrow | escape }}{% else %}${label}{% endif %}</span>
        <span class="category-browse-item__time tactile-deboss">Entry</span>
        <h2>{{ item.title | escape }}</h2>
        <p>{% if item.description %}{{ item.description | escape }}{% else %}{{ item.content | strip_html | normalize_whitespace | truncate: 150 }}{% endif %}</p>
      </a>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="category-browse-empty tactile-deboss">
    <p>${label} entries will appear here as they are added.</p>
  </div>
  {% endif %}
</section>
`;

const uniqueSections = (sections) => {
  const seen = new Set();
  return sections.filter((section) => {
    if (!section.slug || seen.has(section.slug)) return false;
    seen.add(section.slug);
    return true;
  });
};

const main = async () => {
  const rawSiteData = await fs.readFile(siteDataPath, 'utf8');
  const siteData = yaml.load(rawSiteData) || {};
  const dynamicSections = uniqueSections(
    (Array.isArray(siteData.dynamic_sections) ? siteData.dynamic_sections : []).map((section) => {
      const label = String(section?.label || section?.title || '').trim();
      const slug = slugify(section?.slug || label);
      return {
        label: label || toSentenceCase(slug),
        slug,
        description: String(section?.description || '').trim(),
      };
    }),
  );

  for (const section of dynamicSections) {
    const sectionDir = path.join(root, section.slug);
    await fs.mkdir(sectionDir, { recursive: true });
    await fs.writeFile(path.join(sectionDir, 'index.md'), buildIndexPage(section));
  }

  const pagesRaw = await fs.readFile(pagesConfigPath, 'utf8');
  const generatedEntries = [];

  for (const section of dynamicSections) {
    generatedEntries.push({
      name: `section_${section.slug}`,
      label: section.label,
      path: section.slug,
      type: 'collection',
      filename: '{primary}.md',
      exclude: ['index.md'],
      fields: proseFields,
    });

    generatedEntries.push({
      name: `${section.slug}_page`,
      label: `${section.label} Listing Page`,
      path: `${section.slug}/index.md`,
      type: 'file',
      fields: pageFields,
    });
  }

  const generatedYaml = generatedEntries.length
    ? yaml.dump(generatedEntries, { lineWidth: 1000, noRefs: true }).split('\n').map((line) => (line ? `  ${line}` : line)).join('\n')
    : '';
  const generatedBlock = `${generatedMarkerStart}
${generatedYaml}${generatedMarkerEnd}`;
  const nextPages = pagesRaw.includes(generatedMarkerStart)
    ? pagesRaw.replace(new RegExp(`${generatedMarkerStart}[\\s\\S]*?${generatedMarkerEnd}`), generatedBlock)
    : pagesRaw.replace('content:\n', `content:\n${generatedBlock}\n`);

  await fs.writeFile(pagesConfigPath, nextPages);
  console.log(`Synced ${dynamicSections.length} dynamic sections.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
