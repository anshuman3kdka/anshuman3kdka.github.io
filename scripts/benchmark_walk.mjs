import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentExtensions = new Set(['.md', '.html']);
const ignoredDirs = new Set(['.git', 'node_modules', '.jekyll-cache', 'assets', 'scripts']);

const walkSequential = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.pages.yml') continue;
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkSequential(fullPath)));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (contentExtensions.has(ext)) files.push(fullPath);
  }

  return files;
};

const walkParallel = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = await Promise.all(entries.map(async (entry) => {
    if (entry.name.startsWith('.') && entry.name !== '.pages.yml') return [];
    if (ignoredDirs.has(entry.name)) return [];

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return await walkParallel(fullPath);
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (contentExtensions.has(ext)) return [fullPath];
    return [];
  }));

  return results.flat();
};

async function benchmark(name, fn, iterations = 10) {
  // Warm up
  await fn(root);

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await fn(root);
  }
  const end = performance.now();
  const average = (end - start) / iterations;
  console.log(`${name}: ${average.toFixed(4)}ms (average over ${iterations} iterations)`);
  return average;
}

async function run() {
  console.log('Starting benchmark...');
  const seqTime = await benchmark('Sequential Walk', walkSequential);
  const parTime = await benchmark('Parallel Walk', walkParallel);

  const diff = seqTime - parTime;
  const percent = (diff / seqTime) * 100;

  console.log(`\nImprovement: ${diff.toFixed(4)}ms (${percent.toFixed(2)}%)`);
}

run().catch(console.error);
