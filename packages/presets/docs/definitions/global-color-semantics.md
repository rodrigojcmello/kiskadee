# Global Color Semantics

## Layer 1: Primitive Colors

The foundation layer defines the actual color values. Every declared theme is a complete canonical
Kiskadee tonal scale stored as lowercase HEX, or as CSS color references for a dynamic asset.

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
  | 'neutral'      // Neutral identity, either pure gray or tinted
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

## Secondary and Tertiary in Preset Authoring

Many design systems in the market expose `primary`, `secondary` and sometimes
`tertiary` colors. In practice, these labels tend to mix two concepts:

1. Brand palette (marketing): primary/secondary/tertiary brand colors.
2. UI usage: primary/secondary buttons, accents, etc.

Kiskadee separates these concerns explicitly:

- Brand colors live in Layer 1 (`BaseColor`). A brand can have yellow, blue,
  teal, purple, etc. as primitive colors.
- UI semantics live in Layer 2 (`SemanticColor`) and Layer 3 (component intents
  like `destructive`, `positive`).

The accepted authoring direction does not require dedicated `secondary` or
`tertiary` global semantics. The current Core `SemanticColor` type still
includes `secondary`; removing or changing that public member is outside this
documentation delivery. The simplified union above illustrates the preferred
authoring vocabulary rather than exhaustively reproducing the public type.
For new mappings:

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

A supporting brand ramp may use `primary.v2` when that is the preset's
intended meaning. This is an available mapping, not a required translation of
every upstream secondary color. Support may instead use `neutral` with a
suitable emphasis. The agreed Material migration uses the latter approach;
its published mappings remain unchanged until that migration is completed.

## Neutral and Shared Identity

`neutral` is not restricted to grayscale or exclusively assigned to surfaces,
backgrounds, and content. Component intents and formulas define its actual
use. A tinted neutral remains neutral even when its hue follows a red, blue,
or green primary; hue alone must not reclassify it as `redLike` or another
chromatic semantic.

Primitive family variants and semantic variants are separate namespaces.
Core currently supports semantic `v1`/`v2`; additional black primitive variants
can be selected through segment mappings without inventing `neutral.v3` as a
public semantic reference.

The [segment color model](./segment-color-model.md) owns the rules for the
shared preset catalog, simple/complex identities, neutral-origin choices,
variant preservation, and the staged Material adaptation. Reusing semantic
colors across segments is intentional; changing a primary does not authorize
regeneration or replacement of the other shared colors.

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
