import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = process.cwd();

const contentExtensions = new Set(['.md', '.html']);
const ignoredDirs = new Set(['.git', 'node_modules', '.jekyll-cache', 'assets', 'scripts']);
const allowedTopLevel = new Set(['poetry', 'prose', 'essays', 'projects', 'achievements', 'creative']);

const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'with']);

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.pages.yml') continue;
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (contentExtensions.has(ext)) files.push(fullPath);
  }

  return files;
};

const extractFrontMatter = async (text) => {
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

const toIsoString = (value) => {
  if (!value) return null;
  const date = new Date(value instanceof Date ? value : String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const categoryFromPath = (relativePath) => relativePath.split('/')[0];

const toUrl = (relativePath, frontMatterData) => {
  const permalink = typeof frontMatterData.permalink === 'string' ? frontMatterData.permalink.trim() : '';
  if (permalink) {
    if (path.extname(permalink)) return permalink;
    return permalink.endsWith('/') ? permalink : `${permalink}/`;
  }

  const parsed = path.parse(relativePath);
  const ext = parsed.ext.toLowerCase();

  if (ext === '.html') {
    if (parsed.name === 'index') return `/${parsed.dir}/`.replace(/\/+/g, '/').replace(/\/\//g, '/');
    return `/${parsed.dir}/${parsed.base}`.replace(/\/+/g, '/').replace(/\/\//g, '/');
  }

  // Jekyll renders non-index Markdown pages to "filename.html" by default.
  // Keep folder-style URLs only for index files or explicit permalinks.
  if (ext === '.md') {
    if (parsed.name === 'index') return `/${parsed.dir}/`.replace(/\/+/g, '/').replace(/\/\//g, '/');
    return `/${parsed.dir}/${parsed.name}.html`.replace(/\/+/g, '/').replace(/\/\//g, '/');
  }

  if (parsed.name === 'index') return `/${parsed.dir}/`.replace(/\/+/g, '/');
  return `/${parsed.dir}/${parsed.name}/`.replace(/\/+/g, '/');
};

const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokenize = (value) => normalizeText(value)
  .split(' ')
  .map((word) => word.trim())
  .filter((word) => word.length > 1 && !stopWords.has(word));

const dedupeTokens = (tokens) => [...new Set(tokens)];

const stripMarkdown = (value) => String(value || '')
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
  .replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1')
  .replace(/^#{1,6}\s+/gm, '')
  .replace(/[>*_~\-]{1,3}/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const extractTitle = (body, frontMatterData, fallback) => {
  if (typeof frontMatterData.title === 'string' && frontMatterData.title.trim()) return frontMatterData.title.trim();
  const headingMatch = body.match(/^#\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : fallback;
};

const extractTags = (frontMatterData) => {
  if (Array.isArray(frontMatterData.tags)) return frontMatterData.tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof frontMatterData.tags === 'string') return frontMatterData.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  return [];
};

const main = async () => {
  const allFiles = await walk(root);
  const records = [];

  for (const file of allFiles) {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    const top = rel.split('/')[0];
    if (!allowedTopLevel.has(top)) continue;

    const raw = await fs.readFile(file, 'utf8');
    const { data: frontMatterData, body } = await extractFrontMatter(raw);
    if (frontMatterData.search === false || String(frontMatterData.search).toLowerCase() === 'false') continue;

    const title = extractTitle(body, frontMatterData, rel);
    const category = String(frontMatterData.category || categoryFromPath(rel)).trim();
    const tags = extractTags(frontMatterData);
    const excerptSource = frontMatterData.description || frontMatterData.excerpt || body;
    const excerpt = stripMarkdown(excerptSource).slice(0, 220).trim();

    const titleTokens = dedupeTokens(tokenize(title));
    const categoryTokens = dedupeTokens(tokenize(category));
    const tagTokens = dedupeTokens(tokenize(tags.join(' ')));
    const excerptTokens = dedupeTokens(tokenize(excerpt));

    records.push({
      id: rel,
      title,
      url: toUrl(rel, frontMatterData),
      category,
      tags,
      date: toIsoString(frontMatterData.date),
      excerpt,
      titleTokens,
      categoryTokens,
      tagTokens,
      excerptTokens,
      titleNormalized: normalizeText(title),
    });
  }

  records.sort((a, b) => a.title.localeCompare(b.title));
  await fs.writeFile(path.join(root, 'search-index.json'), `${JSON.stringify(records)}\n`);
  console.log(`Indexed ${records.length} search records.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
