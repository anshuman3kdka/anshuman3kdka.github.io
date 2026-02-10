# Site Notes

This repository hosts a static website with a build-time generated search index.

## Search indexing infrastructure

Search indexing is generated automatically at build/deploy time by `scripts/generate-search-index.mjs`.

- The script scans all content files (`.md` and `.html`) in the site source tree.
- It extracts page `title`, plain-text `content`, source `path`, and canonical `url`.
- It writes fresh output to both:
  - `assets/search-index.json`
  - `search-index.json`
- It logs discovered files vs indexed entries.
- If those counts differ, the script fails the build and reports skipped files with reasons.

## Host build hooks

The build hook is wired for common static hosts:

- GitHub Actions: `.github/workflows/search-index.yml`
- Netlify: `netlify.toml` runs `npm run build`
- Vercel: `vercel.json` runs `npm run build`

`npm run build` runs `npm run generate:search-index`, so newly added content files are indexed automatically without manual JSON updates.
