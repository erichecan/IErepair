# Design System — IERepair (Claude.ai Layout Philosophy)

> **Color palette is locked.** Only layout, spacing, grid, typography scale, and component geometry are updated here.
> Inspired by claude.ai's expansive, full-width design language — no artificial width caps on content.

---

## 1. Visual Theme & Atmosphere

Monochromatic restraint with confident use of full-width space. The design takes cues from claude.ai: content breathes across the full viewport, sections self-regulate their own reading widths, and nothing feels crammed into a phone-sized column on a 1440px screen. Depth comes from the shadow system, not from borders or color. The layout feels open and purposeful — like a professional tool, not a mobile app stretched onto a desktop.

**Key Characteristics:**
- Full viewport width layout — no outer wrapper max-width constraint
- Sections control their own content width based on content type
- Cal Sans for headings, Inter for body — strict typographic division
- Multi-layered shadow system for depth (ring + diffused + contact)
- White canvas with near-black (`#242424`) text — maximum contrast
- Generous section spacing that scales up on wide screens
- 12-column grid for content areas, collapsing gracefully to 4 on mobile

---

## 2. Color Palette & Roles

### Primary (locked — do not change)
- **Charcoal** (`#242424`): Primary heading and button text
- **Midnight** (`#111111`): Deepest text, overlay color
- **White** (`#ffffff`): Primary background and surface

### Secondary & Accent (locked)
- **Link Blue** (`#0099ff`): In-text links only
- **Focus Ring** (`#3b82f6` at 50% opacity): Keyboard focus indicator only
- **Brand Orange** (`#e05c2a`): Price display, CTA accent — used sparingly

### Surface & Background (locked)
- **Pure White** (`#ffffff`): Primary page background and card surfaces
- **Light Gray** (`#f8f8f8`): Card backgrounds, hover states, image wells
- **Mid Gray** (`#898989`): Secondary text, descriptions, muted labels

### Border System (locked)
- **Shadow Border**: `rgba(34, 42, 53, 0.08) 0px 0px 0px 1px` — ring shadow replaces CSS borders
- **Divider**: `rgba(34, 42, 53, 0.08)` as `border-color` for horizontal rules only

---

## 3. Typography Rules

### Font Family
- **Display / Headings**: `Cal Sans` — geometric sans-serif, weight 600
- **Body / UI**: `Inter` — all readable body text, labels, captions
- **Fallback stack**: `Cal Sans, Inter, -apple-system, sans-serif`

### Scale

| Role | Font | Size (desktop) | Size (mobile) | Weight | Line Height | Letter Spacing |
|------|------|----------------|---------------|--------|-------------|----------------|
| Hero Display | Cal Sans | 64px | 36px | 600 | 1.08 | -0.02em |
| Page Heading | Cal Sans | 48px | 30px | 600 | 1.10 | -0.01em |
| Section Title | Cal Sans | 32px | 24px | 600 | 1.15 | 0 |
| Card Title | Cal Sans | 20px | 18px | 600 | 1.20 | 0 |
| Label / Badge | Cal Sans | 12px | 12px | 600 | 1.50 | +0.05em |
| Body Large | Inter | 18px | 16px | 400 | 1.65 | 0 |
| Body | Inter | 15px | 14px | 400 | 1.60 | 0 |
| Caption | Inter | 13px | 12px | 500 | 1.50 | 0 |
| Micro | Inter | 11px | 11px | 500 | 1.40 | +0.02em |
| UI Button | Inter | 14px | 14px | 600 | 1.00 | 0 |
| Nav Link | Inter | 14px | — | 500 | 1.00 | 0 |

### Principles
- Cal Sans exclusively for headings — never for body text or anything below 12px
- Inter for all body, labels, captions, form fields, and nav
- Tight tracking at large display sizes (`-0.02em` at 64px), neutral at small
- Never use Cal Sans at weight other than 600

---

## 4. Layout Architecture (claude.ai Philosophy)

### Core Principle: Sections Own Their Width

The page wrapper is **full viewport width** with no max-width cap. Each section controls its own content width based on what the content needs:

```
Viewport (100vw)
└── Page wrapper: w-full, no max-width
    ├── Header: w-full, inner content max-w-screen-2xl (1536px) centered
    ├── Hero section: w-full (full bleed, no cap)
    ├── Content section: px-6 md:px-10 lg:px-16, inner max-w-[1400px] centered
    ├── Grid section: px-6 md:px-10 lg:px-16, inner max-w-[1400px] centered
    └── Footer: w-full
```

### Container Width Tokens

| Token | Value | Use |
|-------|-------|-----|
| `content` | `max-w-[1400px]` | Standard content sections |
| `wide` | `max-w-[1600px]` | Wide grid layouts (device browsers) |
| `reading` | `max-w-[720px]` | Text-heavy pages, blog, legal |
| `form` | `max-w-[560px]` | Forms, checkout, modals |
| `nav` | `max-w-screen-2xl` | Navigation header |
| `hero` | `w-full` | Full-bleed hero banners |

**Never constrain the outer `<main>` with a max-width.** `<main>` is always `w-full`. Sections apply their own container class internally.

### Padding System

| Screen | Horizontal padding |
|--------|-------------------|
| Mobile (<768px) | `px-4` (16px) |
| Tablet (768–1024px) | `px-8` (32px) |
| Desktop (1024–1440px) | `px-12` (48px) |
| Large Desktop (>1440px) | `px-16` (64px) |

Use responsive shorthand: `px-4 md:px-8 lg:px-12 xl:px-16`

---

## 5. Grid System

### 12-Column Base

All content grids derive from a 12-column system:

| Content type | Mobile | Tablet | Desktop | Large |
|---|---|---|---|---|
| Device cards | 3 col | 4 col | 5–6 col | 7–8 col |
| Category cards | 2 col | 3 col | 4 col | 4 col |
| Feature highlights | 1 col | 2 col | 3 col | 4 col |
| Service list items | 1 col | 2 col | 2 col | 3 col |
| Hero + sidebar | 1 col stack | 1 col stack | 8+4 col split | 8+4 col split |

### Device Card Grid (browsing pages)

```css
grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8
gap-3
```

Cards: `min-w-0`, auto-fill, no fixed widths.

### Repair Section (homepage scrollable)

Horizontal scroll on all sizes, cards `w-36 md:w-44 lg:w-48`.

---

## 6. Navigation

### Desktop Header

```
┌─────────────────────────────────────────────────────────────────┐
│ Logo (Cal Sans 18px)    Nav links (Inter 14px)    CTA button    │
└─────────────────────────────────────────────────────────────────┘
```

- Full width: `w-full sticky top-0 z-50`
- Inner wrapper: `max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16`
- Height: `h-14` (56px)
- Background: `bg-white` with bottom border `border-b border-[rgba(34,42,53,0.08)]`
- No max-width cap on the outer header element

### Mobile Bottom Nav

- Fixed bottom, full width (not constrained to 430px)
- `w-full` not `max-w-[430px]`
- Safe area padding for notch devices: `pb-safe`

---

## 7. Component Stylings

### Buttons

| Variant | Background | Text | Radius | Padding |
|---------|------------|------|--------|---------|
| Primary Dark | `#242424` | white | `rounded-xl` (12px) | `px-5 py-2.5` |
| Primary Orange | `#e05c2a` | white | `rounded-xl` | `px-5 py-2.5` |
| Ghost | white + ring shadow | `#242424` | `rounded-xl` | `px-5 py-2.5` |
| Pill Badge | `#f5f5f5` | `#898989` | `rounded-full` | `px-3 py-1` |

Hover: `hover:opacity-80 transition-opacity` for dark/colored buttons.
Size variants: `h-10` (40px default), `h-12` (48px large), `h-8` (32px compact).

### Cards

```css
/* Standard card */
bg-white rounded-2xl
box-shadow: rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 12px

/* Device card */
bg-white rounded-2xl p-4
hover:bg-[#f8f8f8] transition-colors

/* Hero/CTA card */
bg-[#242424] rounded-2xl p-6 md:p-8
```

Radius scale: `rounded-xl` (12px) for small cards, `rounded-2xl` (16px) for containers and device cards, `rounded-3xl` (24px) for hero sections.

### Service List Row

```css
flex items-center justify-between
py-4 border-b border-[rgba(34,42,53,0.06)] last:border-0
```

Price: right-aligned, `text-base font-bold` in category accent color.
Name: left, `text-sm font-medium text-[#242424]`.

### Form Inputs

```css
h-12 px-4 rounded-xl
bg-white border border-[rgba(34,42,53,0.16)]
text-sm text-[#242424] placeholder:text-[#898989]
focus:border-[#242424] focus:outline-none transition-colors
```

---

## 8. Depth & Elevation

| Level | Shadow | Use |
|-------|--------|-----|
| 0 — Flat | none | Page canvas, sections |
| 1 — Ring | `rgba(34,42,53,0.08) 0px 0px 0px 1px` | Subtle card border |
| 2 — Card | `rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 12px` | Standard cards |
| 3 — Elevated | `rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px` | Modals, dropdowns |
| 4 — Inset | `rgba(0,0,0,0.06) 0px 2px 4px inset` | Input wells, pressed states |

Shadow philosophy: ring borders replace CSS `border`. No gradients for depth.

---

## 9. Spacing System

Base unit: 4px. Use Tailwind spacing scale.

| Token | Value | Use |
|-------|-------|-----|
| `gap-3` | 12px | Card grid gaps |
| `gap-4` | 16px | Form element gaps |
| `gap-6` | 24px | Section internal gaps |
| `gap-8` | 32px | Component group gaps |
| `py-10` | 40px | Section vertical (mobile) |
| `py-14 md:py-20` | 56px / 80px | Section vertical (desktop) |
| `py-20 md:py-28` | 80px / 112px | Hero sections |
| `mb-6` | 24px | Between heading and content |
| `mb-10` | 40px | Between major sections |

---

## 10. Responsive Strategy

### Philosophy: Content-First, Not Device-First

The site serves desktop users shopping for repairs (larger screens). Mobile is fully supported but not the primary constraint. Do not lock layouts to phone widths.

### Breakpoints

| Name | Tailwind | Min Width | Primary Changes |
|------|----------|-----------|-----------------|
| Mobile | (default) | 0 | Single column, stacked nav, bottom nav bar |
| sm | `sm:` | 640px | 2-col grids begin |
| md | `md:` | 768px | Desktop header appears, wider padding |
| lg | `lg:` | 1024px | Full grid columns, wider containers |
| xl | `xl:` | 1280px | Maximum column counts |
| 2xl | `2xl:` | 1536px | Ultra-wide optimizations |

### Layout at Key Widths

**Mobile (375–767px)**
- Bottom nav, no desktop header
- Single column content
- `px-4` padding
- Cards: 3 across

**Tablet (768–1023px)**
- Desktop header visible
- 2–4 column grids
- `px-8` padding

**Desktop (1024–1439px)**
- Full desktop experience
- 5–6 column device grids
- `px-12` padding
- Wide two-column layouts (8+4 split)

**Large Desktop (1440px+)**
- 7–8 column device grids
- `px-16` padding
- Maximum use of horizontal space

### Anti-Patterns to Avoid

- ❌ `max-w-[430px]` on `<main>` — locks desktop into phone width
- ❌ `max-w-5xl` on layout wrapper — too narrow for modern 1440px screens
- ❌ Fixed pixel widths on cards (`w-36`) without flex/grid context
- ❌ Horizontal scroll sections that stay narrow on desktop instead of expanding to a grid

---

## 11. Page-Level Layout Templates

### Home Page

```
[Full-bleed hero banner — gradient, no max-width cap]
[Selling points grid — max-w-[1400px] mx-auto, 3 col → 6 col]
[iPhone Repair section — max-w-[1400px] mx-auto, horizontal scroll on mobile, grid on lg+]
[Android Repair section — same]
[Browse CTA — centered]
```

### Browse / List Pages

```
[Sticky type tabs — full width with inner max-w-[1600px]]
[Brand pills — full width with inner max-w-[1600px]]
[Device grid — grid-cols-3 sm:4 md:5 lg:6 xl:7 2xl:8, max-w-[1600px]]
[Pagination — max-w-[1600px]]
```

### Device Detail Page

```
[Full-bleed dark hero — device image + name]
[Services list — max-w-[720px] mx-auto (reading width) or 2-col on large screens]
[Book CTA — max-w-[1400px] mx-auto]
```

---

## 12. Do's and Don'ts

### Do
- Let `<main>` be `w-full` — sections control their own max-width
- Use `max-w-[1400px]` or `max-w-[1600px]` for content sections, not `max-w-5xl`
- Scale device card grids up to 7–8 columns on 2xl screens
- Use `px-4 md:px-8 lg:px-12 xl:px-16` for consistent horizontal padding
- Apply Cal Sans only to headings (weight 600), Inter everywhere else
- Use shadow-based borders (`rgba(34,42,53,0.08) 0px 0px 0px 1px`)
- Keep section spacing generous: `py-14 md:py-20` minimum between sections

### Don't
- ❌ Constrain `<main>` with `max-w-[430px]` — phone-width layout on desktop
- ❌ Use `max-w-5xl` (1024px) as a layout wrapper — too narrow
- ❌ Add CSS `border` when ring shadows achieve the same
- ❌ Use Cal Sans for body text or below 12px
- ❌ Mix `border-radius` arbitrarily — stick to `rounded-xl/2xl/3xl/full`
- ❌ Use inline `max-w-5xl` in individual page files — use container tokens
- ❌ Fix mobile bottom nav to 430px width — it should span the full viewport

---

## 13. Quick Reference for Agents

```
Colors (locked):
  Primary text:    #242424
  Secondary text:  #898989
  Background:      #ffffff
  Surface hover:   #f8f8f8
  Orange accent:   #e05c2a
  Shadow border:   rgba(34,42,53,0.08)

Container widths:
  <main>:          w-full (NO max-width)
  header inner:    max-w-screen-2xl mx-auto
  content:         max-w-[1400px] mx-auto
  wide grid:       max-w-[1600px] mx-auto
  reading:         max-w-[720px] mx-auto

Horizontal padding: px-4 md:px-8 lg:px-12 xl:px-16

Device card grid:   grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8
Card gap:           gap-3

Section spacing:    py-10 md:py-14 lg:py-20

Typography:
  Hero:             64px Cal Sans 600, leading-[1.08], tracking-tight
  Page heading:     48px Cal Sans 600, leading-[1.10]
  Section title:    32px Cal Sans 600, leading-[1.15]
  Body:             15px Inter 400, leading-[1.60]
  Caption:          13px Inter 500
  Button:           14px Inter 600
```
