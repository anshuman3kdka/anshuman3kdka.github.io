## 2024-03-12 - Same-Page Anchor Navigation Intercepted by SPA Transitions

Learning: A hidden dependency behavior exists where custom Single Page Application (SPA) transition logic intercepts *all* valid internal navigation links. This causes same-page anchor links (e.g., `#section`) to trigger a full page transition via `window.location.href`, overriding the native browser behavior of smooth/instant scrolling to the element. This breaks expected navigation patterns on pages with table of contents or long-form document outlines.

Action: Always parse navigation URLs using the `URL` constructor to explicitly verify if the target `pathname` and `search` exactly match the current `window.location`. If they match and a `hash` is present, explicitly opt-out of the SPA transition flow to preserve native anchor scrolling behavior.
