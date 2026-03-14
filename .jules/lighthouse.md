## 2025-03-14 - SPA Transitions Intercepting Native Same-Page Anchor Links

Learning: In custom Single Page App (SPA) style transition setups, global `click` event listeners on `<a>` tags might inadvertently intercept same-page anchor links (e.g., `<a href="#section">` or `<a href="/current-page/#section">`). This overrides the native browser behavior (scrolling to the anchor) and triggers a full page transition, causing a jarring user experience or navigating away unnecessarily.

Action: When implementing custom navigation transitions, ensure `href` attributes are explicitly parsed using the `URL` constructor. A specific check should be added to verify if the link's `hash` exists while the `pathname` and `search` explicitly match `window.location`. In such cases, the default browser navigation behavior should be allowed.
