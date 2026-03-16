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

- Google will provide a TXT record like: `google-site-verification=...`
- Bing will provide a TXT or CNAME token.

Add both at the root (`@`) of `anshuman3kdka.in`.

To check that the records have propagated:

```bash
dig +short TXT anshuman3kdka.in
```

After propagation, click **Verify** in both dashboards.

## 3) Submit sitemap

Submit the following URL in both Google Search Console and Bing Webmaster Tools:

- `https://www.anshuman3kdka.in/sitemap.xml`

## 4) Request indexing for key pages

Use each tool's URL Inspection or Submit URL workflow for:

- `https://www.anshuman3kdka.in/`
- `https://www.anshuman3kdka.in/essays/`
- `https://www.anshuman3kdka.in/projects/`
- `https://www.anshuman3kdka.in/about/`
- `https://www.anshuman3kdka.in/creative/`

## 5) Google Search Console: step-by-step checklist

1. Open the **Domain property** for `anshuman3kdka.in` (preferred over a URL-prefix property).
2. Go to **Sitemaps**.
3. Submit: `https://www.anshuman3kdka.in/sitemap.xml`
4. Wait until sitemap status shows **Success**.
5. Revisit after **24–72 hours** and check whether the discovered URL count has increased.
6. If the sitemap shows an error, copy the exact error message and fix it before continuing.
7. Once the sitemap is clean, use **URL Inspection** to request indexing for:
   - `https://www.anshuman3kdka.in/`
   - `https://www.anshuman3kdka.in/about/`
   - `https://www.anshuman3kdka.in/essays/`
   - `https://www.anshuman3kdka.in/projects/`
   - `https://www.anshuman3kdka.in/creative/`

**Steps for each URL:**
1. Open [Search Console URL Inspection](https://search.google.com/search-console/).
2. Select the `anshuman3kdka.in` property.
3. Open **URL Inspection** and paste the URL.
4. Click **Test Live URL**.
5. If the result shows the page is available and crawlable, click **Request Indexing**.
6. If you already requested indexing for a URL today, skip it and wait a few days before retrying.

> **About redirects:** Seeing **"Page with redirect"** for the non-`www` version is expected and is not a problem, as long as the `www` URL is the one getting indexed.

## 6) Weekly coverage checks and crawl-error triage

Every week:
1. Review **Pages/Coverage** and **Sitemaps** in Google Search Console.
2. Review **Site Explorer/Index coverage** in Bing Webmaster Tools.
3. Triage and fix:
   - `404` pages: add content or redirect old URLs to the best-matching live page.
   - Blocked resources: check `robots.txt`, `X-Robots-Tag`, and page `meta robots`.
   - Redirect issues: remove redirect chains and loops; ensure the canonical URL returns `200`.
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
