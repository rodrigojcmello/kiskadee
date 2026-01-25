# @kiskadee/presets

Official presets (tokens + schemas) for Kiskadee — a framework that generates and supports any design system.

This package contains ready-to-use schema presets built on top of `@kiskadee/core`, including templates like iOS 26, Material Design 3, and more.

---

### Interaction Feedback: Pressed State Rule

The pressed interaction state (`:active`) is intentionally the highest-contrast step among interaction states. It is also the only state that does not transition: the click itself should immediately trigger the color change. This makes the feedback unmistakable and confirms to the user that the control was actually pressed.

This behavior applies to every design system registered in Kiskadee (Material, Fluent, iOS, Carbon, etc.). It is treated as a UX micro-interaction, not a brand choice, so we keep it consistent across all presets.

---

### Button Variants: Subtle as Low-Emphasis Base (Kiskadee Extensions)

Kiskadee treats `subtle` as the **low-emphasis base** for button styling. The `outline` and `flat`
variants (when available) are derived from `subtle`, since those variants are conceptually low-
emphasis (white/transparent background with colored or neutral text).

Important: **official presets stay faithful** to the original design systems. If a DS does not
define outline/flat (e.g., Material 3, Carbon), those variants are not introduced in the official
preset. The "kiskadee" versions may extend the DS by:

- Adding a `subtle` low-emphasis definition when the original only provides `vivid`
- Exposing `outline` and `flat` based on that `subtle` base

This keeps fidelity for official presets while enabling richer variants in "kiskadee" presets.

---

### Color Architecture: The 3-Layer System

Kiskadee implements a robust 3-layer color architecture designed to provide maximum flexibility while maintaining semantic consistency across components. This system allows design systems to be fully customizable without sacrificing the benefits of inheritance and cascading changes.

#### Overview

```
Layer 1: Primitive Colors  →  Layer 2: Global Semantics  →  Layer 3: Component Intents
─────────────────────────────────────────────────────────────────────────────────────
red                        →  redLike                   →  Button.destructive
                                                        →  Badge.attention
                                                        
green                      →  greenLike                 →  Button.positive
                                                        
purple                     →  purpleLike                →  Badge.new
                                                        
blue                       →  primary                   →  Button.primary
                                                        
gray                       →  neutral                   →  Button.neutral
```

---

### Layer 1: Primitive Colors

The foundation layer defines the actual color values. These are the raw HSLA color definitions that represent specific hues.

```typescript
// Examples of primitive colors (actual type lives in @kiskadee/core)
type BaseColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'black';
```

**Purpose**: Provide the actual color values that will be used throughout the design system.

**When to modify**: When you want to adjust the specific tone/shade of a color globally (e.g., making red more orange-tinted).

---

### Layer 2: Global Semantics (`-like`)

The global semantics layer provides general meaning to colors without enforcing specific hues. This abstraction allows flexibility in color choices while maintaining semantic consistency across the entire system.

```typescript
type SemanticColor = 
  | 'primary'      // Brand identity color
  | 'neutral'      // Text, backgrounds, borders (grayscale)
  | 'redLike'      // Danger, error, urgent, notifications
  | 'greenLike'    // Success, purchase, confirmation, profit
  | 'yellowLike'   // Attention, warning, caution
  | 'purpleLike';  // Novelty, special features, badges
```

#### Why `-like` Instead of `danger`, `success`, `warning`?

The `-like` suffix is intentional and important:

1. **Flexibility**: `redLike` can be red, orange, or any warm warning color — it's not forced to be exactly red.

2. **Accuracy**: Terms like "danger" and "success" are imprecise:
   - A red badge doesn't mean "danger" — it means "new notification"
   - A green button doesn't mean "success" — it's an action with alternative emphasis to "primary"
   - A red number in a bank statement means "withdrawal", not "danger"

3. **Context independence**: The same semantic color (`redLike`) has different meanings in different components, which is handled by Layer 3.

**When to modify**: When you want to swap an entire color family (e.g., making all "red-like" elements use orange instead).

```typescript
// Example: Change redLike to use orange
redLike = orange  // All destructive buttons, attention badges, etc. become orange
```

---

#### Why Kiskadee Does Not Use `secondary` / `tertiary` Global Semantic Colors

Many design systems in the market expose `primary`, `secondary` and sometimes `tertiary` colors. In practice, these labels tend to mix two concepts:

1. **Brand palette** (marketing): primary/secondary/tertiary brand colors.
2. **UI usage**: primary/secondary buttons, accents, etc.

Kiskadee separates these concerns explicitly:

- **Brand colors** live in **Layer 1** (`BaseColor`). A brand can have yellow, blue, teal, purple, etc. as primitive colors.
- **UI semantics** live in **Layer 2** (`SemanticColor`) and **Layer 3** (component intents like `destructive`, `positive`).

Because of this, Kiskadee does **not** expose `secondary` or `tertiary` as global semantic colors:

- What most design systems call a *secondary button* is, in Kiskadee, usually just a combination of:
  - `semantic="primary"` or `semantic="neutral"`, with
  - `tone="subtle"` instead of `tone="vivid"`.
- A *tertiary button* is often just text with `primary` or `neutral` applied to `textColor`, without a strong `boxColor`.

In other words, the "secondary/tertiary" UX is modeled by **tone and neutral usage**, not by extra global semantic color names.

##### Real‑world example: Mercado Livre

Mercado Livre is a good illustration of why Kiskadee avoids conflating brand and UI primaries:

- In branding, the **yellow** is the clear primary color (logo, marketing, offline presence).
- In the digital product UI, however, the **buttons are predominantly blue**, because blue over yellow backgrounds has better contrast and readability.

In Kiskadee terms:

- The brand can keep both **yellow** and **blue** as primitive colors in **Layer 1** (`BaseColor`).
- For the **digital design system**, the segment can simply choose **`blue` as `primary`**, and use `yellow` freely as:
  - `yellowLike` (for warnings/attention), or
  - specific tokens for backgrounds/highlights.

This way, Kiskadee models:

- **Brand reality** (multiple important brand colors), and
- **UI reality** (a single `primary` semantic color for actions),

without inventing a global `secondary`/`tertiary` semantic color that rarely has a precise, consistent meaning across components.

---

### Layer 3: Component Intents

The intent layer provides context-specific meaning for each component. This is where the same semantic color can have different purposes depending on the component.

```typescript
// Button intents
type ButtonIntent = 'primary' | 'neutral' | 'destructive' | 'positive';

// Badge intents  
type BadgeIntent = 'primary' | 'neutral' | 'attention' | 'new';

// Avatar status
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
```

#### Why Different Intents Per Component?

The same color means different things in different contexts:

| Color | Button | Badge | Avatar | Bank Statement |
|-------|--------|-------|--------|----------------|
| Red-like | Destructive action | New notification | Offline/Busy | Withdrawal |
| Green-like | Positive action | Verified | Online | Deposit |
| Purple-like | — | New feature | — | — |

Calling everything "danger" would be semantically incorrect.

---

### How the Cascade Works

The 3-layer system uses **object references**, meaning changes automatically propagate through the chain:

```
red (Layer 1)
  ↓ (referenced by)
redLike (Layer 2)
  ↓ (referenced by)
Button.destructive (Layer 3)
Badge.attention (Layer 3)
```

---

### Segments: Layer 2 overrides vs Schema palette composition

In Kiskadee, the word `segment` appears in **two related but distinct places**. They both follow a similar mental model (a `base` plus `overrides`), but they operate at different levels and solve different problems.

#### A) Segment overrides in Color Layer 2 (`globalSemanticsBySegment`)

**Where:** `schema.colors.globalSemantics` + `schema.colors.globalSemanticsBySegment`

**What it does:** defines the **identity/brand** of a segment by overriding Layer 2 semantic mappings.

- `globalSemantics` is the baseline: per theme, it maps global semantic keys like `primary` and `neutral` to a `PrimitiveRole` (Layer 1), e.g. `primary -> primitive.blue.v1`.
- `globalSemanticsBySegment[segment].themes` is optional and only exists when a segment must override the baseline, e.g. `modern.primary -> primitive.purple.v1`.

**Why it exists:** lets a segment change what `primary` means globally (and therefore affect every component intent that points to `primary`) without rewriting component palettes.

Conceptually:

```ts
override = colors.globalSemanticsBySegment[segment].themes?.[theme]?.[semantic]
base = colors.globalSemantics[theme][semantic]
resolved = override ?? base
```

This is used by the `color()` resolver in `@kiskadee/core`, and it is also the source of truth for segment discovery in builders/tooling (for Web, see `@kiskadee/web-builder` documentation).

#### B) Segment composition when authoring a preset Schema (`buildBySegment`)

**Where:** preset `*.schema.ts` files (element `palettes`), via `packages/presets/src/utils/buildBySegment.ts`

**What it does:** helps preset authors generate a `Schema` where `element.palettes` contains an explicit object for each segment (e.g. `default`, `modern`, `dynamic`) **without duplicating the entire palette** or adding `if/ternary` conditionals everywhere.

`buildBySegment` is an authoring utility:

- you provide a `base(segment)` palette generator (the default behavior of the element)
- you optionally provide a patch/override per segment for the few paths that differ
- it produces a fully materialized `palettes` map for the Schema

This does **not** change the public `Schema` contract. It only changes how the preset code *builds* the final object.

#### How they work together (example)

They complement each other:

- Layer 2 segment overrides answer: **"What is `primary` in this segment?"**
- Schema palette composition answers: **"How does this element use `primary` in this segment?"**

For example, a `modern` segment can:

- map `primary` to a purple primitive in Layer 2, and
- choose to consume it as `button.primary.gradient` in `boxColor` palettes for some elements.

---

#### Customization Scenarios

| Scenario | Action | Result |
|----------|--------|--------|
| Adjust red tone globally | Modify `red` color value | Everything using `redLike` updates automatically |
| Use orange instead of red | Set `redLike = orange` | All red-like semantics become orange |
| Purple badge, red button | Set `badge.attention = purpleLike` | Only badge changes; button stays red |
| Direct color assignment | Set `badge.attention = purple` | Badge uses purple directly, skipping `-like` layer |

---

### Smart Defaults

**Zero configuration required to start.** Everything comes pre-configured:

```
red → redLike → destructive (Button)
               → attention (Badge)

green → greenLike → positive (Button)

purple → purpleLike → new (Badge)
```

Designers and developers can use the system immediately without understanding all three layers. The layers exist for **when customization is needed**, not as a barrier to entry.

---

### Not All Combinations Are Required

An important design decision: **not every component needs every semantic color**.

Based on research of major design systems (iOS, Material Design, Fluent, Carbon):

- ✅ **Buttons**: `primary`, `neutral`, `destructive` (redLike), `positive` (greenLike)
- ❌ **Buttons**: No yellow buttons, no purple buttons (not used in practice)
- ✅ **Badges**: `primary`, `neutral`, `attention` (redLike or purpleLike)
- ✅ **Inputs**: `error` (redLike), `success` (greenLike)

This is **opinion based on real-world usage**, not theoretical completeness. If a specific design system needs a yellow button, it can be added via preset configuration.

---

### Type Definitions

```typescript
// Layer 1: Primitive colors (for palette generation)
type BaseColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'black';

// Layer 2: Global semantics (already in @kiskadee/core)
type SemanticColor = 'primary' | 'neutral' | 'redLike' | 'greenLike' | 'yellowLike' | 'purpleLike';

// Layer 3: Component intents (defined per component)
type ButtonIntent = 'primary' | 'neutral' | 'destructive' | 'positive';
type BadgeIntent = 'primary' | 'neutral' | 'attention' | 'new';

// Intent values can reference either layer
type IntentValue = SemanticColor | BaseColor;

// Configurable mapping per preset
type IntentMapping = {
  button: Record<ButtonIntent, SemanticColor>;
  badge: Record<BadgeIntent, SemanticColor>;
};
```

---

### Visual Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Layer 1               │  Layer 2                │  Layer 3                 │
│  (Primitive Colors)    │  (Global Semantics)     │  (Component Intents)     │
├─────────────────────────────────────────────────────────────────────────────┤
│  red              │  redLike ───────────┼─→ Button.destructive             │
│                   │           └─────────┼─→ Badge.attention                │
│                   │                     │                                  │
│  green            │  greenLike ─────────┼─→ Button.positive                │
│                   │                     │                                  │
│  purple           │  purpleLike ────────┼─→ Badge.new                      │
│                   │                     │                                  │
│  blue             │  primary ───────────┼─→ Button.primary                 │
│                   │                     │                                  │
│  gray             │  neutral ───────────┼─→ Button.neutral                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Philosophy

> "The system is **progressively revealed**: simple for those who want to use it, powerful for those who want to customize it."

This architecture solves the tension between **flexibility** and **practicality** in design systems:

1. **Flexibility**: Any color can be swapped at any level
2. **Semantic consistency**: Colors maintain meaning across the system
3. **Context awareness**: Same color, different meaning per component
4. **No forced symmetry**: Components only support intents that make sense for them
5. **Cascade by default**: Changes propagate automatically
6. **Override when needed**: Any level can be customized independently

---

### Related Packages

- `@kiskadee/core` — Platform-agnostic schema types and utilities
- `@kiskadee/web-builder` — Generates CSS from presets
- `@kiskadee/react-components` — React components using generated CSS
- `@kiskadee/runtime` — Runtime color calculation for dynamic theming
