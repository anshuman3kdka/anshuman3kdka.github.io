## 2024-03-22 - Search Form & Skip Link Accessibility
**Learning:** Skip-to-content links require the target element to have `tabindex="-1"` so it can programmatically receive focus and allow subsequent tabs to flow intuitively through the content. Mobile search keyboards only show a "Search" button when the input is wrapped in a `<form role="search">`, and the keyboard must be explicitly dismissed via `input.blur()` on submit. Disabled links should have their `href` attribute removed so they are dropped from the natural tab sequence.
**Action:** Always ensure target containers of skip links use `tabindex="-1"`, always wrap search inputs in a form tag to improve mobile accessibility, and manage disabled link focus states by removing the `href` attribute.

## 2024-03-22 - Hide Redundant and Decorative Text from Screen Readers
**Learning:** Screen readers will stutter or read duplicate text when a button or link has both an `aria-label` and visible text content (e.g. `aria-label="Download PDF"` with `<span>PDF</span>`). Additionally, decorative arrows (like `→`) read aloud disruptively, polluting the auditory flow.
**Action:** Always add `aria-hidden="true"` to child text elements/icons if their parent already provides a fully descriptive `aria-label`. Wrap decorative characters like arrows in `<span aria-hidden="true">` to preserve visual rhythm without breaking auditory clarity.

## 2026-03-14 - Descriptive ARIA Labels for "Read More" Links
**Learning:** Screen readers read links out of context when tabbing through them. Generic text like "Read more" provides no information about the link destination.
**Action:** When a link has generic visible text like "Read more" or "Learn more", always add an `aria-label` attribute with a descriptive context (e.g. `aria-label="Read more about Project X"`). Add `aria-hidden="true"` to the inner visible text so the screen reader uses the descriptive label instead without reading both.
