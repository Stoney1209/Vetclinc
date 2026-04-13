# Design System Specification: The Clinical Curator

## 1. Overview & Creative North Star

This design system is built upon the **"Clinical Curator"** North Star. In the high-stakes environment of veterinary medicine, software should not feel like a "database" but like a precision instrument. We move away from the cluttered, line-heavy aesthetic of legacy medical software toward an editorial, high-fidelity experience.

The core philosophy is **Information Architecture as Art**. By leveraging intentional white space, tonal depth, and a "No-Line" approach, we create a sanctuary for data. We replace the rigid, boxed-in feel of standard SaaS with a fluid, layered interface that feels as clean and sterile—yet welcoming—as a modern surgical suite.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule

Our palette is anchored in a sophisticated Teal (`primary`) that evokes trust and precision, supported by a Zinc/Slate-inspired neutral scale.

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders (`#E2E8F0` or similar) are prohibited for sectioning. Structural boundaries must be defined solely through background color shifts or subtle tonal transitions.
* **The Transition:** Use `surface-container-low` for the page background and `surface-container-lowest` (Pure White) for content cards. The contrast is the border.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to define importance:
* **Level 0 (Base):** `surface` (#fbf8ff) - The canvas.
* **Level 1 (Sections):** `surface-container-low` (#f4f2fd) - Secondary sidebars or groupings.
* **Level 2 (Active Content):** `surface-container-lowest` (#ffffff) - Primary cards and data tables.
* **Level 3 (Interactions):** `surface-container-high` (#e8e7f1) - Hover states or active selections.

### The "Glass & Gradient" Rule
To elevate the "out-of-the-box" feel:
* **CTAs:** Use a subtle linear gradient from `primary` (#005c55) to `primary_container` (#0f766e) at 135 degrees. This adds "soul" and prevents the UI from feeling flat.
* **Modals/Popovers:** Apply `backdrop-blur: 12px` to containers using a semi-transparent `surface` color. This integrates the element into the environment rather than "pasting" it on top.

---

## 3. Typography: Editorial Clarity

We utilize **Inter** as our typographic workhorse. Its tall x-height and neutral character allow it to disappear, letting the veterinary data take center stage.

* **Display & Headlines:** Use `headline-lg` for dashboard summaries. These should be set with a tighter letter-spacing (`-0.02em`) to give an authoritative, editorial feel.
* **Data Labels:** Use `label-md` and `label-sm` in `on_surface_variant` (#3e4947). These should often be Uppercase with `+0.05em` tracking for a "labeled specimen" look.
* **Body:** `body-md` is the default for patient notes and clinical records, ensuring maximum legibility at 0.875rem.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved by stacking surface tiers. Instead of a shadow, place a `surface-container-lowest` card on a `surface-container-low` background. This "soft lift" is more sophisticated than traditional drop shadows.

### Ambient Shadows
When a floating effect is required (e.g., a critical surgery alert or a context menu), use an **Ambient Shadow**:
* **Shadow Token:** `box-shadow: 0 8px 30px rgba(26, 27, 34, 0.06);`
* The shadow is never black; it is a tinted version of `on_surface` at very low opacity to mimic natural, soft laboratory lighting.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input fields), use a **Ghost Border**:
* **Stroke:** 1px solid `outline_variant` (#bdc9c6) at **20% opacity**. It should be felt, not seen.

---

## 5. Components: Precision Primitives

### Buttons
* **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text. `rounded-md` (0.375rem).
* **Secondary:** `surface_container_highest` background with `on_surface` text. No border.
* **Tertiary:** Transparent background, `primary` text. No border.

### Cards & Tables
* **The Rule:** Forbid divider lines between table rows or card sections.
* **Implementation:** Use a 12px vertical spacing shift or a 2% color shift on hover (`surface_container_high`) to define rows. Tables should feel like a clean sheet of paper, not a spreadsheet.

### Input Fields
* **Default State:** Background `surface_container_lowest`, Ghost Border (20% opacity).
* **Focus State:** Border becomes 100% `primary`, with a 3px outer "glow" of `primary` at 10% opacity.

### Additional Signature Components
* **Status Pills:** Use `secondary_container` for neutral statuses and `tertiary_container` for "Urgent" patient alerts. The text color should always be the corresponding `on_` token for high-contrast accessibility.
* **The "Patient Timeline" Track:** A vertical 2px track using `surface_variant` with `primary` nodes, representing the patient's medical history without the use of heavy boxes.

---

## 6. Do's and Don'ts

### Do
* **Do** use asymmetrical layouts for dashboards (e.g., a wide medical chart next to a narrow, high-contrast action list).
* **Do** emphasize "Primary" data by using `title-lg` in `on_primary_fixed_variant` (#00504a).
* **Do** prioritize vertical rhythm. Use the Spacing Scale (4px, 8px, 16px, 24px) consistently to separate content.

### Don't
* **Don't** use 100% opaque borders to separate sections.
* **Don't** use standard "Web Blue" for links. Always use the `primary` teal.
* **Don't** clutter the screen with icons. Use icons only as functional anchors, never as purely decorative elements.
* **Don't** use pure black (#000000). Always use `on_surface` (#1a1b22) for text to maintain a high-end, softer contrast.