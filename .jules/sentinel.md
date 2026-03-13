## 2025-03-07 - [XSS and Argument Injection Hardening]
**Vulnerability:** DOM-based XSS via `javascript:` URLs in navigation and argument injection in SEO script.
**Learning:** The fancy page transition logic in `assets/site.js` used `window.location.href = href` without sufficient protocol validation, allowing `javascript:` links to execute code. Additionally, the SEO script was vulnerable to argument injection if a malformed URL starting with `-` was passed to `curl`.
**Prevention:** Always explicitly block `javascript:` and protocol-relative URLs (`//`) in navigation handlers. Use the `--` separator in `curl` commands to treat following arguments as URLs rather than flags.

## 2025-03-07 - [Template XSS Hardening]
**Vulnerability:** Cross-Site Scripting (XSS) via unescaped Liquid variables in templates.
**Learning:** Jekyll's Liquid engine does not perform automatic HTML entity encoding. Variables sourced from `_data/*.yml` or page front-matter are rendered as raw strings, creating XSS vectors if these sources are compromised. Furthermore, filters like `relative_url` and `absolute_url` only resolve paths and do not escape output for use in HTML attributes.
**Prevention:** Explicitly apply the `escape` filter to all dynamic variables in Jekyll templates (`.html` and `.md`), especially when used in content areas or HTML attributes.
