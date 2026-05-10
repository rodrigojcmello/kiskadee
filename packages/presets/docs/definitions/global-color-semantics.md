# Global Color Semantics

## Layer 1: Primitive Colors

The foundation layer defines the actual color values. These are the raw HSLA
color definitions that represent specific hues.

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

Purpose: provide the actual color values that will be used throughout the
design system.

When to modify: when you want to adjust the specific tone/shade of a color
globally, such as making red more orange-tinted.

## Layer 2: Global Semantics (`-like`)

The global semantics layer provides general meaning to colors without enforcing
specific hues. This abstraction allows flexibility in color choices while
maintaining semantic consistency across the entire system.

```typescript
type SemanticColor =
  | 'primary'      // Brand identity color
  | 'neutral'      // Text, backgrounds, borders (grayscale)
  | 'redLike'      // Danger, error, urgent, notifications
  | 'greenLike'    // Success, purchase, confirmation, profit
  | 'yellowLike'   // Attention, warning, caution
  | 'purpleLike';  // Novelty, special features, badges
```

## Why `-like` Instead of `danger`, `success`, `warning`?

The `-like` suffix is intentional and important:

1. Flexibility: `redLike` can be red, orange, or any warm warning color. It is
   not forced to be exactly red.
2. Accuracy: terms like `danger` and `success` are imprecise:
   - A red badge does not mean danger; it means new notification.
   - A green button does not mean success; it is an action with alternative
     emphasis to primary.
   - A red number in a bank statement means withdrawal, not danger.
3. Context independence: the same semantic color (`redLike`) has different
   meanings in different components, which is handled by Layer 3.

When to modify: when you want to swap an entire color family, such as making all
red-like elements use orange instead.

```typescript
// Example: Change redLike to use orange
redLike = orange  // All destructive buttons, attention badges, etc. become orange
```

## Why Kiskadee Does Not Use `secondary` / `tertiary` Global Semantic Colors

Many design systems in the market expose `primary`, `secondary` and sometimes
`tertiary` colors. In practice, these labels tend to mix two concepts:

1. Brand palette (marketing): primary/secondary/tertiary brand colors.
2. UI usage: primary/secondary buttons, accents, etc.

Kiskadee separates these concerns explicitly:

- Brand colors live in Layer 1 (`BaseColor`). A brand can have yellow, blue,
  teal, purple, etc. as primitive colors.
- UI semantics live in Layer 2 (`SemanticColor`) and Layer 3 (component intents
  like `destructive`, `positive`).

Because of this, Kiskadee does not expose `secondary` or `tertiary` as global
semantic colors:

- What most design systems call a secondary button is, in Kiskadee, usually just
  a combination of `semantic="primary"` or `semantic="neutral"` with
  `emphasis="medium"` instead of `emphasis="high"`.
- A tertiary button is often just text with `primary` or `neutral` applied to
  `textColor`, without a strong `boxColor`. Many design systems also use
  tertiary as a highlight color for accents such as new feature badges, which
  fits better as a semantic (`purpleLike`) or a `primary.v2` variant, depending
  on the product.

In other words, the secondary/tertiary UX is modeled by tone and neutral usage,
not by extra global semantic color names.

In most real systems, secondary is not a new semantic role; it is a support
variation of the primary brand color, usually a nearby hue or a softer chroma.
Kiskadee captures this with semantic variants in Layer 2:

- `primary.v1` = main brand color ramp.
- `primary.v2` = supporting/auxiliary ramp within the same semantic family.

This keeps a single semantic meaning (primary) while still allowing multiple
brand ramps to coexist without inventing new semantics.

## Real-World Example: Mercado Livre

Mercado Livre is a good illustration of why Kiskadee avoids conflating brand and
UI primaries:

- In branding, the yellow is the clear primary color: logo, marketing, offline
  presence.
- In the digital product UI, however, the buttons are predominantly blue,
  because blue over yellow backgrounds has better contrast and readability.

In Kiskadee terms:

- The brand can keep both yellow and blue as primitive colors in Layer 1
  (`BaseColor`).
- For the digital design system, the segment can simply choose blue as
  `primary`, and use yellow freely as:
  - `yellowLike` for warnings/attention.
  - specific tokens for backgrounds/highlights.

This way, Kiskadee models brand reality (multiple important brand colors) and
UI reality (a single `primary` semantic color for actions) without inventing a
global `secondary`/`tertiary` semantic color that rarely has a precise,
consistent meaning across components.
