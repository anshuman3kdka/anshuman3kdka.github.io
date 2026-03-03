import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile as execFileCallback } from 'node:child_process';

const execFile = promisify(execFileCallback);

const RUBY_YAML_TO_JSON_SCRIPT = `
require 'yaml'
require 'json'
require 'base64'
require 'date'

payload = Base64.decode64(ARGV[0] || '')
value = YAML.safe_load(
  payload,
  permitted_classes: [Date, Time],
  aliases: false,
)

print JSON.generate(value || {})
`;

const root = process.cwd();
const contentExtensions = new Set(['.md', '.html']);
const ignoredDirs = new Set(['.git', 'node_modules', '.jekyll-cache']);

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.pages.yml') continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      files.push(...(await walk(fullPath)));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (contentExtensions.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
};

const parseYamlToJson = async (yamlText) => {
  const encodedYaml = Buffer.from(yamlText, 'utf8').toString('base64');
  const { stdout } = await execFile(
    'ruby',
    ['-e', RUBY_YAML_TO_JSON_SCRIPT, encodedYaml],
  );

  return JSON.parse(stdout);
};

const extractFrontMatter = async (text, file) => {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: text };

  let data = {};

  try {
    const parsed = await parseYamlToJson(match[1]);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      data = parsed;
    }
  } catch (error) {
    const message = error?.stderr?.trim() || error?.message || 'Unknown YAML parse error';
    console.warn(`[search-index] Warning: invalid front matter in ${file}. ${message}`);
  }

  return {
    data,
    body: text.slice(match[0].length),
  };
};

const normalizeUrl = (rawUrl, brandUrl = '') => {
  if (!rawUrl) return null;

  if (rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:')) return null;

  let pathname = rawUrl;

  if (/^https?:\/\//.test(rawUrl)) {
    try {
      const parsed = new URL(rawUrl);
      if (brandUrl) {
        const brandHost = new URL(brandUrl).host;
        if (parsed.host !== brandHost) return null;
      }
      pathname = parsed.pathname || '/';
    } catch {
      return null;
    }
  }

  if (!pathname.startsWith('/')) return null;

  return pathname.endsWith('/') ? pathname : `${pathname}/`;
};

const getInternalLinkUrls = (links, brandUrl = '') => {
  if (!Array.isArray(links)) return [];

  return links
    .map((link) => {
      if (!link || typeof link !== 'object') return null;
      const rawUrl = typeof link.url === 'string' ? link.url : '';
      return normalizeUrl(rawUrl, brandUrl);
    })
    .filter(Boolean);
};

const resolveSiteDataExpression = (expression, siteData) => {
  const [source] = expression.split('|').map((part) => part.trim());
  if (!source?.startsWith('site.data.site.')) return '';

  const key = source.slice('site.data.site.'.length);
  const value = siteData[key];

  return typeof value === 'string' ? value : '';
};

const preprocessLiquid = (text, siteData) => {
  const withResolvedOutput = text.replace(/{{\s*([\s\S]*?)\s*}}/g, (_, expr) => {
    const resolved = resolveSiteDataExpression(expr, siteData);
    return resolved;
  });

  return withResolvedOutput
    .replace(/{%[\s\S]*?%}/g, ' ')
    .replace(/{{[\s\S]*?}}/g, ' ');
};

const toUrl = (relativePath, frontMatterData = {}) => {
  const permalink = frontMatterData.permalink;
  if (typeof permalink === 'string' && permalink.trim()) {
    const normalizedPermalink = permalink.trim();
    const normalized = normalizedPermalink.startsWith('/') ? normalizedPermalink : `/${normalizedPermalink}`;
    return normalized.endsWith('/') ? normalized : `${normalized}/`;
  }

  let url = `/${relativePath.replace(/\\/g, '/')}`;
  if (url.endsWith('/index.md') || url.endsWith('/index.html')) {
    url = url.replace(/\/index\.(md|html)$/, '/');
  } else {
    url = url.replace(/\.md$/, '.html');
  }
  return url;
};

const categoryFromPath = (relativePath) => {
  const [first = 'Page'] = relativePath.split('/');
  if (!first || first === 'index.md' || first === 'index.html') return 'Page';
  return first.charAt(0).toUpperCase() + first.slice(1);
};

const normalizeCategory = (value, fallbackPath) => {
  const source = typeof value === 'string' && value.trim() ? value : fallbackPath;
  const cleaned = source
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return 'Page';

  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const normalizeTags = (value) => {
  if (!value) return [];

  const candidates = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return [...new Set(candidates
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .map((tag) => tag.toLowerCase()))];
};

const extractTitle = (body, frontMatterData, fallback) => {
  if (typeof frontMatterData.title === 'string' && frontMatterData.title.trim()) {
    return frontMatterData.title;
  }

  const headingMatch = body.match(/^#\s+(.+)$/m);
  if (headingMatch) return headingMatch[1].trim();

  return fallback;
};

const toPlainText = (text) => text
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/`[^`]*`/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[>#*_~-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const shouldIndexFile = (relativePath) => {
  const parts = relativePath.split('/');
  const [top] = parts;
  const allowedTopLevel = new Set([
    'about',
    'achievements',
    'contact',
    'creative',
    'essays',
    'home',
    'poetry',
    'projects',
    'prose',
    'resume',
  ]);
  const blockedRoots = new Set(['assets', 'scripts']);

  if (blockedRoots.has(top)) return false;
  if (parts.some((segment) => segment.startsWith('_'))) return false;

  if (parts.length === 1) {
    return false;
  }

  if (!allowedTopLevel.has(top)) return false;
  if (relativePath === 'search.json' || relativePath === 'sitemap.xml') return false;
  return true;
};

const toIsoString = (value) => {
  if (!value) return null;
  const dateInput = value instanceof Date ? value : String(value);
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const isSearchDisabled = (value) => value === false
  || (typeof value === 'string' && value.trim().toLowerCase() === 'false');

const resolveLastModified = (frontMatterData, fallbackStat) => {
  const frontMatterDate = toIsoString(
    frontMatterData.last_modified_at
      || frontMatterData.lastModified
      || frontMatterData.updated
      || frontMatterData.date,
  );
  if (frontMatterDate) return frontMatterDate;

  return fallbackStat.mtime.toISOString();
};

const main = async () => {
  const siteYaml = await fs.readFile(path.join(root, '_data', 'site.yml'), 'utf8');
  const parsedSiteData = await parseYamlToJson(siteYaml);
  const siteData = parsedSiteData && typeof parsedSiteData === 'object' && !Array.isArray(parsedSiteData)
    ? parsedSiteData
    : {};
  const excludedUrls = new Set([
    ...getInternalLinkUrls(siteData.header_links, siteData.brand_url),
    ...getInternalLinkUrls(siteData.social_links, siteData.brand_url),
  ]);

  const allFiles = await walk(root);
  const contentFiles = allFiles.filter((file) => {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    return shouldIndexFile(rel);
  });
  const records = [];

  for (const file of contentFiles) {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    const raw = await fs.readFile(file, 'utf8');
    const { data: frontMatterData, body } = await extractFrontMatter(raw, rel);

    if (isSearchDisabled(frontMatterData.search)) continue;

    const preprocessed = preprocessLiquid(body, siteData);
    const stats = await fs.stat(file);

    const url = toUrl(rel, frontMatterData);

    if (excludedUrls.has(url)) continue;

    records.push({
      title: extractTitle(body, frontMatterData, rel),
      category: normalizeCategory(frontMatterData.category, categoryFromPath(rel)),
      eyebrow: typeof frontMatterData.eyebrow === 'string' ? frontMatterData.eyebrow.trim() : '',
      date: toIsoString(frontMatterData.date),
      tags: normalizeTags(frontMatterData.tags),
      url,
      content: toPlainText(preprocessed).slice(0, 1400),
      lastModified: resolveLastModified(frontMatterData, stats),
    });
  }

  records.sort((a, b) => a.title.localeCompare(b.title));

  await fs.writeFile(path.join(root, 'search.json'), `${JSON.stringify(records, null, 2)}\n`);

  console.log(`Indexed ${records.length} files.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
