import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentExtensions = new Set(['.md', '.html']);
const ignoredDirs = new Set(['.git', 'node_modules', '.jekyll-cache']);

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.pages.yml') continue;
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      files.push(...(await walk(path.join(dir, entry.name))));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (contentExtensions.has(ext)) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
};

const stripFrontMatter = (text) => {
  if (!text.startsWith('---\n')) return text;
  const end = text.indexOf('\n---\n', 4);
  return end === -1 ? text : text.slice(end + 5);
};

const extractTitle = (text, fallback) => {
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (fmMatch) {
    const titleMatch = fmMatch[1].match(/^title:\s*(.+)$/m);
    if (titleMatch) return titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
  }

  const body = stripFrontMatter(text);
  const headingMatch = body.match(/^#\s+(.+)$/m);
  if (headingMatch) return headingMatch[1].trim();

  return fallback;
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

const toUrl = (relativePath) => {
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

const main = async () => {
  const siteYaml = await fs.readFile(path.join(root, '_data', 'site.yml'), 'utf8');
  const siteData = parseSiteData(siteYaml);

  const allFiles = await walk(root);
  const contentFiles = allFiles.filter((file) => {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    const top = rel.split('/')[0];
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
      'index.md',
    ]);

    return allowedTopLevel.has(top);
  });

  const records = [];

  for (const file of contentFiles) {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    const raw = await fs.readFile(file, 'utf8');
    const preprocessed = preprocessLiquid(stripFrontMatter(raw), siteData);
    const body = preprocessed
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    records.push({
      title: extractTitle(raw, rel),
      category: categoryFromPath(rel),
      url: toUrl(rel),
      content: body.slice(0, 400),
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
