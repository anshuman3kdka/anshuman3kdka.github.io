# Tactile Narrative Portfolio

## Product Overview

**The Pitch:** A deeply tactile, immersive mobile portfolio that frames writing not just as text, but as physical narrative artifacts. It leverages "Neumorphism 2.0" to create a sensory reading experience where interface elements feel carved from a digital canvas, inviting readers to linger, scroll, and reflect.

**For:** Editors, collaborators, and avid readers seeking the thoughtful essays, creative writing, and projects of a student writer (Anshuman3kdka).

**Device:** mobile

**Design Direction:** A dark, tactile literary aesthetic blending deep forest greens with sand-colored accents, defined by embossed/debossed UI components, asymmetric rhythms, and cinematic scroll-triggered text reveals.

**Inspired by:** Readymag editorial pieces, The Atlantic's immersive features

---

## Screens

- **Home Entry:** Establishes the tactile aesthetic, presenting the hero statement, a serendipitous entry point, and navigation.
- **Category Browse:** An asymmetric, rhythmic list of works categorized by theme (Essays, Creative, Projects).
- **The Reading Room (Article View):** The core storytelling experience with sticky pins and scroll-fading paragraphs.
- **The Desk (About & Achievements):** A debossed, structured timeline of personal milestones and contact points.

---

## Key Flows

**Serendipitous Discovery:** Reader wants to jump straight into a story.

1. User is on Home Entry -> sees `Random Read` debossed button
2. User clicks `Random Read` -> Button visually presses inward (active state), smoothly transitions to a random Article View
3. Reader enters The Reading Room seamlessly with the article title sticking to the top edge.

---

<details>
<summary>Design System</summary>

## Color Palette

- **Primary:** `#D4B886` - Sand accent, links, active states
- **Background:** `#16241D` - Deep forest green base
- **Surface:** `#1A2A22` - Base for embossed/debossed elements
- **Text:** `#F4F1E1` - Crisp ivory body and headings
- **Muted:** `#7A9684` - Sage green secondary text, borders
- **Accent:** `#E8A365` - Warm terracotta for highlights/achievements

## Typography

- **Headings:** `Lora`, 400 & 600, `28-40px` - Literary, sweeping serif
- **Body:** `Satoshi`, 400, `16px` - Crisp, modern geometric sans-serif for high legibility
- **Small text:** `Satoshi`, 500, `13px` - Uppercase, wide tracking (`0.05em`)
- **Buttons:** `Lora`, 500, `18px` - Italicized, tactile feel

**Style notes:** Neumorphism 2.0 utilizes high-contrast shadow pairs. Instead of mushy gradients, elements feature a crisp `1px` inner highlight and deliberate drop shadows to simulate physical depth. Embossed elements sit "above" the screen; debossed elements are carved "into" it.

## Design Tokens

```css
:root {
  --color-primary: #D4B886;
  --color-background: #16241D;
  --color-surface: #1A2A22;
  --color-text: #F4F1E1;
  --color-muted: #7A9684;
  --font-heading: 'Lora', serif;
  --font-body: 'Satoshi', sans-serif;
  --radius-sm: 8px;
  --radius-lg: 24px;
  --spacing-md: 16px;
  --spacing-xl: 48px;
  --shadow-emboss: 6px 6px 12px #101B15, -4px -4px 10px #21352A;
  --shadow-deboss: inset 4px 4px 8px #101B15, inset -4px -4px 8px #21352A;
}
```

</details>

---

<details>
<summary>Screen Specifications</summary>

### Home Entry

**Purpose:** Introduce the writer's voice and provide tactile pathways into the content.

**Layout:** Vertical scroll. Massive typographic hero at top, centered serendipity CTA, followed by an asymmetric 2-column grid of categories, ending with a vertical list of recent works.

**Key Elements:**
- **Hero Typography:** `40px` Lora, `#F4F1E1`, reading "Words that question. Stories that stay." with "question" and "stay" italicized and in `#D4B886`.
- **Random Read Button:** Massive `120px` circular button, debossed (`--shadow-deboss`), centered. Text "Roll the Dice" wrapped inside in `14px` Lora italic.
- **Category Grid:** Asymmetric blocks. 'Essays' is large and spans full width. 'Creative' is small and right-aligned. 'Projects' is square and left-aligned. All use `--shadow-emboss`.

**States:**
- **Empty:** N/A (Static categories).
- **Loading:** Entire screen fades in from `#16241D` via an elegant `800ms` opacity wipe.
- **Error:** N/A.

**Components:**
- **Category Card:** `min-height: 140px`, `#1A2A22` surface, `--shadow-emboss`. Content: Top-left label, bottom-right article count (`#7A9684`).

**Interactions:**
- **Click [Random Read]:** Inner shadow darkens abruptly to simulate physical button press, navigates to random article after `300ms`.
- **Hover [Category Card]:** Card translates `Y: -2px`, shadow softens and expands.

**Responsive:**
- **Desktop:** N/A (Mobile target).
- **Tablet:** Scales grid to 3 columns.
- **Mobile:** Core asymmetric vertical flow.

### Category Browse

**Purpose:** Display a chronological or thematic list of writings within a specific category (e.g., Essays).

**Layout:** Sticky header with category title. Long continuous vertical list of embossed cards, staggered left and right by `16px` to break the rigid grid.

**Key Elements:**
- **Sticky Header:** Category Name (`32px` Lora). Glassmorphic background (`rgba(22, 36, 29, 0.8)`) with `12px` backdrop blur.
- **Article Item:** Rectangular embossed cards. `24px` corner radius. Contains title, date, and `3-line` excerpt.
- **Reading Time Badge:** Debossed pill in top right of each card, `12px` text.

**States:**
- **Empty:** "The desk is empty here. Check back soon." (`#7A9684`, centered).
- **Loading:** Debossed skeleton loaders pulse from dark green to slightly lighter green.
- **Error:** Standard toast notification at screen bottom.

**Components:**
- **List Item:** `calc(100vw - 32px)`, `--shadow-emboss`. Excerpt uses `rgba(244, 241, 225, 0.7)`.

**Interactions:**
- **Click [List Item]:** Card compresses (`scale: 0.98`), translates to Article View.

**Responsive:**
- **Mobile:** Full width with `16px` lateral margins.

### The Reading Room (Article View)

**Purpose:** Immersive storytelling, minimizing UI to focus strictly on the narrative flow.

**Layout:** Full-bleed reading experience. The title section pins to the top, while paragraphs fade in as they enter the viewport.

**Key Elements:**
- **Sticky Title Block:** Spans top `25vh`. Title (`36px` Lora) anchors here. As user scrolls, the background becomes a heavy blur, text shrinks to `18px`.
- **Body Content:** `18px` Satoshi, `1.6` line height. No distinct "blocks", just fluid text.
- **Return Home Orb:** Floating `48px` circular debossed button fixed at bottom-right `24px`. Contains an upward arrow icon.

**States:**
- **Empty:** N/A.
- **Loading:** Title types out character by character (`50ms` delay per char).
- **Error:** Fails gracefully to a readable sans-serif fallback if fonts fail to load.

**Components:**
- **Text Block:** Margins `0 24px`, `#F4F1E1` text.

**Interactions:**
- **Scroll [Down]:** Paragraphs fade from `opacity: 0.2` and `Y: 10px` to `opacity: 1` and `Y: 0` as they cross the 80% viewport threshold.

**Responsive:**
- **Mobile:** Optimal typography measure (approx `45-60` characters per line).

### The Desk (About & Achievements)

**Purpose:** A physical-feeling resume and timeline of Anshuman3kdka.

**Layout:** Split vertically. Top half is bio (embossed card). Bottom half is a central timeline (debossed track).

**Key Elements:**
- **Bio Card:** Massive top card (`--shadow-emboss`), containing portrait avatar (monochrome, high contrast) and brief bio.
- **Timeline Track:** A `4px` wide vertical debossed line running down the center (`--shadow-deboss`).
- **Achievement Nodes:** Embossed circles intersecting the track. Expanding on tap to reveal awards, publications, or milestones.

**States:**
- **Empty:** N/A.
- **Loading:** Track draws from top to bottom over `1s`.
- **Error:** N/A.

**Components:**
- **Timeline Node:** `24px` circle, `#D4B886` center dot. Associated text sits alternatingly left and right of the track.

**Interactions:**
- **Click [Timeline Node]:** Node expands width to a `200px` card revealing description.

**Responsive:**
- **Mobile:** Fits perfectly in viewport, nodes alternate left/right securely.

</details>

---

<details>
<summary>Build Guide</summary>

**Stack:** HTML + Tailwind CSS v3 + Framer Motion (for scroll/tactile animations)

**Build Order:**
1. **Home Entry** - Establishes the precise values for the `shadow-emboss` and `shadow-deboss` utilities in Tailwind configuration. Set up the exact background color and typography scaling.
2. **The Reading Room** - Implements the scroll-fade logic (Intersection Observer/Framer Motion) and tests the sticky header transitions crucial to the "Narrative" part of the PRD.
3. **Category Browse** - Reuses the embossed components, applying them to the staggered list layout.
4. **The Desk** - Implements the complex timeline layout and accordion-style node expansions.

</details>