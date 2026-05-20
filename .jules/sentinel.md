## 2025-03-07 - [XSS and Argument Injection Hardening]
**Vulnerability:** DOM-based XSS via `javascript:` URLs in navigation and argument injection in SEO script.
**Learning:** The fancy page transition logic in `assets/site.js` used `window.location.href = href` without sufficient protocol validation, allowing `javascript:` links to execute code. Additionally, the SEO script was vulnerable to argument injection if a malformed URL starting with `-` was passed to `curl`.
**Prevention:** Always explicitly block `javascript:` and protocol-relative URLs (`//`) in navigation handlers. Use the `--` separator in `curl` commands to treat following arguments as URLs rather than flags.

## 2026-04-11 - [DOM-XSS Hardening in Random Read Card]
**Vulnerability:** DOM-based XSS via `innerHTML` in the Random Read card link label.
**Learning:** Using `innerHTML` to set text that includes small decorative HTML elements (like spans for arrows) is a common pattern that introduces XSS risks if the text source becomes dynamic.
**Prevention:** Prefer `textContent` for labels and programmatically create/append decorative elements using `document.createElement`. Refactored `setCardState` to use a `showArrow` boolean to safely handle this UI pattern.
