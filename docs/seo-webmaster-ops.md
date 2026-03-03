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
- `https://www.anshuman3kdka.in/creative/`

## 5) Google Search Console: current action checklist (plain-language)

Use this exact checklist when working inside Google Search Console:

1. Open the **Domain property** for `anshuman3kdka.in` (this is preferred over a URL-prefix property).
2. Go to **Sitemaps**.
3. Submit:
   - `https://www.anshuman3kdka.in/sitemap.xml`
4. Wait until sitemap status shows **Success**.
5. Revisit after **24–72 hours** and check whether discovered URLs have increased.
6. If sitemap shows any error, copy the **exact error message** and fix that first.
7. Only after sitemap is clean, continue with **URL Inspection** and request indexing for:
   - `https://www.anshuman3kdka.in/`
   - `https://www.anshuman3kdka.in/about/`
   - `https://www.anshuman3kdka.in/essays/`
   - `https://www.anshuman3kdka.in/projects/`
   - `https://www.anshuman3kdka.in/creative/`

## 5.1) URL Inspection execution log (2026-03-03)

Requested URLs for this pass:

- `https://www.anshuman3kdka.in/`
- `https://www.anshuman3kdka.in/about/`
- `https://www.anshuman3kdka.in/essays/`
- `https://www.anshuman3kdka.in/projects/`
- `https://www.anshuman3kdka.in/creative/`

What was attempted from automation:

1. Open Google Search Console and run URL Inspection.
2. Trigger Live Test for each URL.
3. Click Request Indexing only when page is available.

Result:

- Could not complete Search Console actions from this environment due tool/browser restrictions and account-auth interaction requirements.
- Network-based checks from this environment also returned `403` responses, so status here is not authoritative for Google indexing decisions.

Manual completion steps (simple):

1. Open Search Console: <https://search.google.com/search-console/>.
2. Select property `anshuman3kdka.in`.
3. Open **URL Inspection**.
4. Paste each URL above, one at a time.
5. Click **Test Live URL**.
6. If result says the page is available/crawlable, click **Request Indexing**.
7. If you already requested indexing for a URL today, skip it and wait a few days before retrying.

### Important note about redirects

Seeing **"Page with redirect"** for the non-`www` version is expected.
That is okay as long as the `www` URL is the one getting indexed.

## 6) Weekly coverage checks and crawl-error triage

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
