import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile as execFileCallback } from 'node:child_process';

const execFile = promisify(execFileCallback);

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

const extractFrontMatter = (text) => {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: text };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyValue) continue;
    const [, key, rawValue] = keyValue;
    data[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
  }

  return {
    data,
    body: text.slice(match[0].length),
  };
};

const parseSiteData = (yamlText) => {
  const lines = yamlText.split(/\r?\n/);
  const data = {};

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line || /^\s*#/.test(line)) continue;

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) continue;

    const [, key, rawValue] = keyMatch;

    if (/^[>|]/.test(rawValue)) {
      const blockLines = [];
      i += 1;
      while (i < lines.length) {
        const blockLine = lines[i];
        if (!/^\s+/.test(blockLine)) {
          i -= 1;
          break;
        }
        blockLines.push(blockLine.replace(/^\s{2}/, ''));
        i += 1;
      }
      data[key] = blockLines.join('\n').trim();
      continue;
    }

    data[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
  }

  return data;
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
  if (permalink) {
    const normalized = permalink.startsWith('/') ? permalink : `/${permalink}`;
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

const extractTitle = (body, frontMatterData, fallback) => {
  if (frontMatterData.title) return frontMatterData.title;

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
    return relativePath === 'index.md' || relativePath === 'index.html';
  }

  if (!allowedTopLevel.has(top)) return false;
  if (relativePath === 'search.json' || relativePath === 'sitemap.xml') return false;
  return true;
};

const toIsoString = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const resolveLastModified = async (file, frontMatterData, fallbackStat) => {
  const frontMatterDate = toIsoString(
    frontMatterData.last_modified_at
      || frontMatterData.lastModified
      || frontMatterData.updated
      || frontMatterData.date,
  );
  if (frontMatterDate) return frontMatterDate;

  try {
    const { stdout } = await execFile('git', ['log', '-1', '--format=%cI', '--', file], { cwd: root });
    const gitTimestamp = toIsoString(stdout.trim());
    if (gitTimestamp) return gitTimestamp;
  } catch {
    // Fall back when git metadata is unavailable.
  }

  return fallbackStat.mtime.toISOString();
};

const main = async () => {
  const siteYaml = await fs.readFile(path.join(root, '_data', 'site.yml'), 'utf8');
  const siteData = parseSiteData(siteYaml);

  const allFiles = await walk(root);
  const contentFiles = allFiles.filter((file) => {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    return shouldIndexFile(rel);
  });

  const records = [];

  for (const file of contentFiles) {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    const raw = await fs.readFile(file, 'utf8');
    const { data: frontMatterData, body } = extractFrontMatter(raw);

    if (frontMatterData.search === 'false') continue;

    const preprocessed = preprocessLiquid(body, siteData);
    const stats = await fs.stat(file);

    records.push({
      title: extractTitle(body, frontMatterData, rel),
      category: categoryFromPath(rel),
      url: toUrl(rel, frontMatterData),
      content: toPlainText(preprocessed).slice(0, 400),
      lastModified: await resolveLastModified(rel, frontMatterData, stats),
    });
  }

  records.sort((a, b) => a.title.localeCompare(b.title));

  await fs.writeFile(path.join(root, 'search.json'), `${JSON.stringify(records, null, 2)}\n`);
  await fs.mkdir(path.join(root, 'assets'), { recursive: true });
  await fs.writeFile(path.join(root, 'assets', 'search-index.json'), `${JSON.stringify(records, null, 2)}\n`);

  console.log(`Indexed ${records.length} files.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
