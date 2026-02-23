# Webmaster setup and weekly SEO operations

This runbook covers Google Search Console and Bing Webmaster Tools setup for `www.anshuman3kdka.in`, plus a weekly checklist for indexing and crawl health.

## 1) Create owner accounts

### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console/about).
2. Sign in with the Google account that should be the long-term owner.
3. Click **Start now**.
4. Choose **Domain** property and enter: `anshuman3kdka.in`.

### Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters/about).
2. Sign in with your Microsoft account.
3. Add site: `https://www.anshuman3kdka.in`.

## 2) Verify domain ownership via DNS TXT (preferred)

Use your DNS provider (the one managing `anshuman3kdka.in`) to add verification TXT records.

- Google will provide a TXT like: `google-site-verification=...`
- Bing will provide a TXT or CNAME token.

Add both at the root (`@`) of `anshuman3kdka.in`.

Verify propagation:

```bash
dig +short TXT anshuman3kdka.in
```

After propagation, click **Verify** in both dashboards.

## 3) Submit sitemap

Submit this URL in both tools:

- `https://www.anshuman3kdka.in/sitemap.xml`

## 4) Request indexing for key pages

Use each tool's URL inspection / submit URL workflow for:

- `https://www.anshuman3kdka.in/`
- `https://www.anshuman3kdka.in/essays/`
- `https://www.anshuman3kdka.in/projects/`
- `https://www.anshuman3kdka.in/about/`

## 5) Weekly coverage checks and crawl-error triage

Every week:
1. Review **Pages/Coverage** and **Sitemaps** in Google Search Console.
2. Review **Site Explorer/Index coverage** in Bing Webmaster Tools.
3. Triage and fix:
   - `404` pages: add content or redirect old URLs to best-match live pages.
   - Blocked resources: check `robots.txt`, `X-Robots-Tag`, and page `meta robots`.
   - Redirect issues: remove redirect chains/loops and ensure canonical URL returns `200`.
4. Re-submit affected URLs for re-indexing after fixes.

### Automated quick check (local)

Run the included script to validate sitemap and key-page status codes:

```bash
./scripts/seo-health-check.sh
```

Or via npm:

```bash
npm run check:seo
```
