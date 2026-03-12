## 2024-03-11 - Custom Navigation Hijacking Same-Page Anchors

**Learning:** Custom JS page navigation mechanisms (like `runNavigableTransition` triggered via click events) can accidentally intercept and hijack links pointing to same-page anchor tags (e.g. `href="/current-page#section"`), causing full page reloads or broken transitions instead of the browser's native smooth scrolling behavior to the anchor. `URL` constructor properties (`hash`, `pathname`, `search`) are needed to distinguish true same-page navigation from cross-page transitions.

**Action:** Whenever implementing custom JS routing or link interception, ensure `isNavigableDocumentLink` explicitly checks if a URL points to a hash on the exact same `pathname` and `search` as the current `window.location`. Block the transition event for these links, allowing default browser anchor navigation to execute correctly.
