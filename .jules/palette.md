## 2024-03-22 - Search Form & Skip Link Accessibility
**Learning:** Skip-to-content links require the target element to have `tabindex="-1"` so it can programmatically receive focus and allow subsequent tabs to flow intuitively through the content. Mobile search keyboards only show a "Search" button when the input is wrapped in a `<form role="search">`, and the keyboard must be explicitly dismissed via `input.blur()` on submit. Disabled links should have their `href` attribute removed so they are dropped from the natural tab sequence.
**Action:** Always ensure target containers of skip links use `tabindex="-1"`, always wrap search inputs in a form tag to improve mobile accessibility, and manage disabled link focus states by removing the `href` attribute.

## 2024-03-22 - Hide Redundant and Decorative Text from Screen Readers
**Learning:** Screen readers will stutter or read duplicate text when a button or link has both an `aria-label` and visible text content (e.g. `aria-label="Download PDF"` with `<span>PDF</span>`). Additionally, decorative arrows (like `→`) read aloud disruptively, polluting the auditory flow.
**Action:** Always add `aria-hidden="true"` to child text elements/icons if their parent already provides a fully descriptive `aria-label`. Wrap decorative characters like arrows in `<span aria-hidden="true">` to preserve visual rhythm without breaking auditory clarity.

## 2025-03-15 - ARIA Busy States for Asynchronous Operations
**Learning:** Screen readers may not intuitively know when a background asynchronous task (like picking a random read item or executing a search via fetch) is occurring without explicit signals.
**Action:** Always explicitly toggle `aria-busy="true"` on elements initiating or awaiting asynchronous actions, and ensure it is removed cleanly in a `finally` block or at the end of execution to properly alert screen readers of the state change.
