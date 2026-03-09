## 2024-03-22 - Search Form & Skip Link Accessibility
**Learning:** Skip-to-content links require the target element to have `tabindex="-1"` so it can programmatically receive focus and allow subsequent tabs to flow intuitively through the content. Mobile search keyboards only show a "Search" button when the input is wrapped in a `<form role="search">`, and the keyboard must be explicitly dismissed via `input.blur()` on submit. Disabled links should have their `href` attribute removed so they are dropped from the natural tab sequence.
**Action:** Always ensure target containers of skip links use `tabindex="-1"`, always wrap search inputs in a form tag to improve mobile accessibility, and manage disabled link focus states by removing the `href` attribute.

## 2024-06-25 - Decorative Link Arrows & SVG Accessibility
**Learning:** Screen readers often explicitly announce decorative characters like text arrows (e.g., "→" as "rightwards arrow"), which disrupts the intended reading flow of a button or link text. Additionally, icon-only buttons with an `aria-label` may read both the label and the underlying `svg` content if not hidden.
**Action:** Always wrap decorative text characters in `<span aria-hidden="true">` to preserve clean auditory reading, and explicitly add `aria-hidden="true"` to SVGs inside buttons with an `aria-label`.
