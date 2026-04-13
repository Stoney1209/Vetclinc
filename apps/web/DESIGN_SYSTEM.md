# VetClinic Pro - Design Tokens

## Overview

VetClinic Pro follows a "Veterinary Boutique" aesthetic — warm, premium, and trustworthy. The design language draws from nature (sage greens, terracotta warmth) and luxury branding (gold accents, generous spacing).

## Color Palette

### Primary - Sage Green
```
--primary: 145 25% 42%    /* #5B7B6D - Nature, health, trust */
--primary-foreground: 40 33% 97%  /* On primary */
```

### Secondary - Terracotta
```
--secondary: 20 45% 62%    /* #C4836A - Warmth, approachability */
--secondary-foreground: 40 33% 97%
```

### Accent - Muted Gold
```
--accent: 42 55% 60%       /* #D4A853 - Premium, highlights */
--accent-foreground: 210 15% 18%
```

### Semantic Colors

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--background` | 40 33% 97% | #FAF8F5 | Page background (warm cream) |
| `--foreground` | 210 15% 18% | #2D3638 | Primary text (soft charcoal) |
| `--muted` | 40 22% 92% | #EDE9E3 | Subtle backgrounds |
| `--muted-foreground` | 210 10% 45% | #707980 | Secondary text |
| `--destructive` | 0 62% 55% | #D94545 | Errors, danger |
| `--card` | 0 0% 100% | #FFFFFF | Card surfaces |
| `--border` | 40 20% 88% | #E4DFDD | Borders, dividers |
| `--ring` | 145 25% 42% | #5B7B6D | Focus rings |

### Badge Colors (Appointment Types)

| Type | Token | Hex | Usage |
|------|-------|-----|-------|
| Consultation | `--badge-consultation` | 221 83% 53% | #3B82F6 |
| Surgery | `--badge-surgery` | 330 75% 55% | #D946EF |
| Vaccination | `--badge-vaccination` | 142 76% 36% | #22C55E |
| Grooming | `--badge-grooming` | 280 65% 55% | #A855F7 |

## Typography

### Font Families

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Display | Sora | 300-800 | Headings, titles, hero text |
| Body | DM Sans | 300-700 | Body copy, UI text |
| Mono | JetBrains Mono | 400-600 | Code, IDs, data, prices |

### Usage

```tsx
// Headings (Sora)
<h1 className="font-display text-3xl font-bold">Title</h1>

// Body (DM Sans - default)
<p className="text-sm text-muted-foreground">Description</p>

// Data/Mono (JetBrains Mono)
<span className="font-mono text-sm">#A1B2C3</span>
<span className="font-mono">$1,234.56</span>
```

## Spacing & Radius

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 1rem (16px) | Default radius |
| sm | 0.5rem | Small elements |
| md | 0.75rem | Buttons, inputs |
| lg | 1rem | Cards |
| xl | 1.25rem | Large cards |
| 2xl | 1.5rem | Modals, dialogs |
| full | 9999px | Pills, avatars |

### Shadows

| Token | Value | Effect |
|-------|-------|--------|
| `--shadow-sm` | 0 1px 2px rgba | Subtle lift |
| `--shadow-md` | 0 4px 6px rgba | Cards, buttons |
| `--shadow-lg` | 0 10px 15px rgba | Hover states |
| `--shadow-xl` | 0 20px 25px rgba | Modals, dropdowns |

## Components

### Cards

```tsx
// Default card
<Card className="hover-lift">
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>

// Premium card with gradient header
<Card>
  <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>
```

### Buttons

| Variant | Usage | Style |
|---------|-------|-------|
| `default` | Primary actions | Primary bg, shadow |
| `destructive` | Delete, cancel | Red bg |
| `outline` | Secondary actions | Border only |
| `secondary` | Alternative actions | Terracotta bg |
| `ghost` | Subtle actions | No bg |
| `link` | Text links | Underline |
| `premium` | Special CTA | Gradient + glow |

### Badges

```tsx
// Type-specific badges (appointment types)
<Badge variant="consultation">Consulta</Badge>
<Badge variant="vaccination">Vacuna</Badge>
<Badge variant="surgery">Cirugía</Badge>
<Badge variant="grooming">Estética</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge>Default</Badge>
<Badge size="lg">Large</Badge>
```

### Inputs

```tsx
// Standard input
<Input className="h-11" placeholder="Search..." />

// With icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input className="pl-10" />
</div>
```

## Animations

### Utility Classes

| Class | Effect |
|-------|--------|
| `animate-fade-in` | Opacity 0→1, 400ms |
| `animate-slide-up` | Opacity 0→1 + translateY(10px→0), 400ms |
| `animate-scale-in` | Opacity 0→1 + scale(0.95→1), 300ms |
| `animate-stagger` | Sequential delay for children (75ms increments) |
| `hover-lift` | translateY(-4px) + shadow on hover |
| `table-row-hover` | bg-muted/50 on hover |

### Keyframes

```css
@keyframes fadeIn { ... }
@keyframes slideUp { ... }
@keyframes scaleIn { ... }
@keyframes shimmer { ... }
@keyframes float { ... }
@keyframes pulse-soft { ... }
```

## Utilities

### Glass Effect
```tsx
<div className="glass">...</div>
```

### Patterns
```tsx
<div className="pattern-dots">...</div>
<div className="pattern-grid">...</div>
```

### Text Gradient
```tsx
<h1 className="text-gradient">Title</h1>
```

## Custom Scrollbar

Applied globally to match the design system:
- Track: `hsl(var(--muted))`
- Thumb: `hsl(var(--primary) / 0.3)`
- Thumb hover: `hsl(var(--primary) / 0.5)`

## Selection

Custom text selection:
- Background: `hsl(var(--primary) / 0.2)`
- Color: `hsl(var(--primary))`
