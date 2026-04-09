## 2025-03-07 - [XSS and Argument Injection Hardening]
**Vulnerability:** DOM-based XSS via `javascript:` URLs in navigation and argument injection in SEO script.
**Learning:** The fancy page transition logic in `assets/site.js` used `window.location.href = href` without sufficient protocol validation, allowing `javascript:` links to execute code. Additionally, the SEO script was vulnerable to argument injection if a malformed URL starting with `-` was passed to `curl`.
**Prevention:** Always explicitly block `javascript:` and protocol-relative URLs (`//`) in navigation handlers. Use the `--` separator in `curl` commands to treat following arguments as URLs rather than flags.

## 2025-05-22 - [Server-Side XSS Hardening in Jekyll Templates]
**Vulnerability:** Potential XSS and CSS injection via unescaped Liquid variables in templates.
**Learning:** Jekyll does not automatically escape all variables rendered in templates. Variables from `_data`, front-matter, or site config can be vectors for injection if they contain malicious characters. Even filters like `relative_url` do not provide HTML encoding.
**Prevention:** Always append the `| escape` filter to any Liquid variable rendered into HTML attributes, text content, or `<style>` blocks, unless the variable is explicitly intended to contain trusted HTML (in which case it should be handled with extreme care).
