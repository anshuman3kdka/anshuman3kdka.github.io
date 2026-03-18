import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = process.cwd();
const contentExtensions = new Set(['.md', '.html']);
const ignoredDirs = new Set(['.git', 'node_modules', '.jekyll-cache', 'assets', 'scripts']);
const allowedTopLevel = new Set(['poetry', 'prose', 'essays']);

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

  // Jekyll 'pretty' permalinks render non-index Markdown pages to "filename/index.html"
  // Keep clean folder-style URLs.
  if (ext === '.md') {
    if (parsed.name === 'index') return `/${parsed.dir}/`.replace(/\/+/g, '/').replace(/\/\//g, '/');
    return `/${parsed.dir}/${parsed.name}/`.replace(/\/+/g, '/').replace(/\/\//g, '/');
  }

  if (parsed.name === 'index') return `/${parsed.dir}/`.replace(/\/+/g, '/').replace(/\/\//g, '/');
  return `/${parsed.dir}/${parsed.name}/`.replace(/\/+/g, '/').replace(/\/\//g, '/');
};

const extractTitle = (body, frontMatterData, fallback) => {
  if (typeof frontMatterData.title === 'string' && frontMatterData.title.trim()) return frontMatterData.title.trim();
  const headingMatch = body.match(/^#\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : fallback;
};

const isDraftedOff = (frontMatterData) => String(frontMatterData.draft ?? '').trim().toLowerCase() === 'true';

const isScheduledForFuture = (frontMatterData) => {
  if (!frontMatterData.publish_date) return false;

  const publishDate = new Date(frontMatterData.publish_date instanceof Date ? frontMatterData.publish_date : String(frontMatterData.publish_date));
  if (Number.isNaN(publishDate.getTime())) return false;

  return publishDate.getTime() > Date.now();
};

const main = async () => {
  const allFiles = await walk(root);

  // ⚡ Bolt: parallelized file parsing for faster build times
  const processFile = async (file) => {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    const top = rel.split('/')[0];
    if (!allowedTopLevel.has(top)) return null;

    const raw = await fs.readFile(file, 'utf8');
    const { data: frontMatterData, body } = await extractFrontMatter(raw);
    if (frontMatterData.search === false || String(frontMatterData.search).toLowerCase() === 'false') return null;
    if (isDraftedOff(frontMatterData) || isScheduledForFuture(frontMatterData)) return null;

    const category = String(frontMatterData.category || categoryFromPath(rel)).trim();
    const url = toUrl(rel, frontMatterData);

    return {
      title: extractTitle(body, frontMatterData, rel),
      url,
      category,
      eyebrow: typeof frontMatterData.eyebrow === 'string' ? frontMatterData.eyebrow.trim() : category,
      date: toIsoString(frontMatterData.date),
    };
  };

  const results = await Promise.all(allFiles.map(processFile));
  const records = results.filter(Boolean);

  records.sort((a, b) => a.title.localeCompare(b.title));
  await fs.writeFile(path.join(root, 'random-read.json'), `${JSON.stringify(records, null, 2)}\n`);
  console.log(`Indexed ${records.length} random-read records.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
