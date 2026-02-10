#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_FILES = [
  path.join(ROOT, "assets", "search-index.json"),
  path.join(ROOT, "search-index.json"),
];

const CONTENT_EXTENSIONS = new Set([".md", ".html"]);
const EXCLUDED_DIR_PREFIXES = [
  ".git/",
  ".github/",
  "assets/",
  "node_modules/",
  "scripts/",
  "_layouts/",
  "_site/",
];
const EXCLUDED_FILES = new Set([
  "README.md",
  "_config.yml",
  "CNAME",
  "sitemap.xml",
  "search-index.json",
]);

const toPosix = (value) => value.split(path.sep).join("/");

const stripFrontMatter = (source) => {
  if (!source.startsWith("---\n")) return source;
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) return source;
  return source.slice(end + 5);
};

const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();

const stripMarkdown = (source) => {
  let text = source;
  text = text.replace(/```[\s\S]*?```/g, " ");
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^[>*-]\s+/gm, "");
  text = text.replace(/\*\*|__|\*|_/g, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\{\%[\s\S]*?\%\}|\{\{[\s\S]*?\}\}/g, " ");
  return normalizeWhitespace(text);
};

const stripHtml = (source) => {
  const text = source
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return normalizeWhitespace(text);
};

const extractTitle = (source, relPath) => {
  const fmMatch = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (fmMatch) {
    const titleMatch = fmMatch[1].match(/^title:\s*(.+)$/m);
    if (titleMatch) return titleMatch[1].replace(/^['"]|['"]$/g, "").trim();
  }

  const htmlTitle = source.match(/<title>(.*?)<\/title>/is);
  if (htmlTitle) return normalizeWhitespace(htmlTitle[1]);

  const heading = source.match(/^#\s+(.+)$/m);
  if (heading) return normalizeWhitespace(heading[1]);

  if (relPath === "index.md" || relPath === "index.html") return "Home";
  return path.basename(relPath, path.extname(relPath)).replace(/[-_]+/g, " ").trim();
};

const toUrl = (relPath) => {
  const ext = path.extname(relPath);
  if (ext !== ".md" && ext !== ".html") return null;

  if (relPath === "index.md" || relPath === "index.html") return "/";

  if (relPath.endsWith("/index.md") || relPath.endsWith("/index.html")) {
    const directory = relPath.replace(/\/index\.(md|html)$/i, "");
    return `/${directory}/`;
  }

  const withoutExtension = relPath.slice(0, -ext.length);
  if (ext === ".md") return `/${withoutExtension}.html`;
  return `/${withoutExtension}`;
};

const shouldExcludeByPath = (relPath) => {
  if (EXCLUDED_FILES.has(relPath)) return "non-content file";
  if (relPath.startsWith(".")) return "hidden dotfile";
  if (EXCLUDED_DIR_PREFIXES.some((prefix) => relPath.startsWith(prefix))) {
    return "excluded directory";
  }
  return null;
};

const collectFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    const relPath = toPosix(path.relative(ROOT, absolute));

    if (entry.isDirectory()) {
      const skipReason = shouldExcludeByPath(`${relPath}/`);
      if (skipReason) continue;
      files.push(...(await collectFiles(absolute)));
      continue;
    }

    files.push(relPath);
  }

  return files;
};

const generateIndex = async () => {
  const allFiles = await collectFiles(ROOT);

  const discovered = [];
  const skipped = [];

  for (const relPath of allFiles) {
    const excludedReason = shouldExcludeByPath(relPath);
    if (excludedReason) continue;

    const extension = path.extname(relPath).toLowerCase();
    if (!CONTENT_EXTENSIONS.has(extension)) continue;

    discovered.push(relPath);
  }

  const entries = [];

  for (const relPath of discovered) {
    const absolute = path.join(ROOT, relPath);
    const source = await fs.readFile(absolute, "utf8");
    const url = toUrl(relPath);
    const title = extractTitle(source, relPath);

    const body = stripFrontMatter(source);
    const content = path.extname(relPath) === ".html" ? stripHtml(body) : stripMarkdown(body);

    if (!url) {
      skipped.push({ path: relPath, reason: "unsupported extension for URL mapping" });
      continue;
    }
    if (!title) {
      skipped.push({ path: relPath, reason: "title could not be resolved" });
      continue;
    }
    if (!content) {
      skipped.push({ path: relPath, reason: "empty extracted content" });
      continue;
    }

    entries.push({ title, url, content, path: relPath });
  }

  entries.sort((a, b) => a.url.localeCompare(b.url));

  const payload = `${JSON.stringify(entries, null, 2)}\n`;
  await Promise.all(OUTPUT_FILES.map((filePath) => fs.writeFile(filePath, payload, "utf8")));

  console.log(`[search-index] discovered content files: ${discovered.length}`);
  console.log(`[search-index] indexed entries: ${entries.length}`);

  if (skipped.length) {
    console.error("[search-index] skipped files:");
    for (const item of skipped) {
      console.error(`  - ${item.path}: ${item.reason}`);
    }
  }

  if (entries.length !== discovered.length) {
    throw new Error(
      `[search-index] build failed: discovered ${discovered.length} content files but indexed ${entries.length}.`,
    );
  }
};

generateIndex().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
