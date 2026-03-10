## 2025-03-07 - [XSS and Argument Injection Hardening]
**Vulnerability:** DOM-based XSS via `javascript:` URLs in navigation and argument injection in SEO script.
**Learning:** The fancy page transition logic in `assets/site.js` used `window.location.href = href` without sufficient protocol validation, allowing `javascript:` links to execute code. Additionally, the SEO script was vulnerable to argument injection if a malformed URL starting with `-` was passed to `curl`.
**Prevention:** Always explicitly block `javascript:` and protocol-relative URLs (`//`) in navigation handlers. Use the `--` separator in `curl` commands to treat following arguments as URLs rather than flags.

## 2025-03-10 - [Liquid Template XSS Hardening]
**Vulnerability:** Potential XSS via unescaped Liquid variables in Jekyll templates.
**Learning:** Variables derived from `_data/site.yml` and page front-matter (like `site_title`, `page.title`, `link.label`) were rendered directly into HTML without escaping. Since these are manageable via Pages CMS, a malicious user or compromised CMS could inject scripts.
**Prevention:** Always use the `| escape` filter for any dynamic Liquid variable rendered in HTML or as an attribute value. Note that filters like `relative_url` do not perform HTML encoding, so they must be followed by `| escape`.
