## 2025-03-07 - [XSS and Argument Injection Hardening]
**Vulnerability:** DOM-based XSS via `javascript:` URLs in navigation and argument injection in SEO script.
**Learning:** The fancy page transition logic in `assets/site.js` used `window.location.href = href` without sufficient protocol validation, allowing `javascript:` links to execute code. Additionally, the SEO script was vulnerable to argument injection if a malformed URL starting with `-` was passed to `curl`.
**Prevention:** Always explicitly block `javascript:` and protocol-relative URLs (`//`) in navigation handlers. Use the `--` separator in `curl` commands to treat following arguments as URLs rather than flags.

## 2026-03-11 - [Systemic Liquid Template XSS Hardening]
**Vulnerability:** Widespread unescaped Liquid output from dynamic data sources (CMS-managed site settings and front matter) allowed potential HTML/script injection.
**Learning:** Jekyll/Liquid does not automatically escape output variables. In a "vibe coding" environment where content is managed via a CMS, dynamic fields like titles, labels, and metadata are high-risk vectors if not explicitly sanitized.
**Prevention:** Apply the `escape` filter to all dynamic Liquid variables rendered in the DOM. Crucially, Jekyll's `relative_url` filter does not perform HTML entity encoding, so even relative paths derived from data require an explicit `escape` filter (e.g., `{{ url | relative_url | escape }}`).
