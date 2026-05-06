# Gradients

Kiskadee stores gradients in a platform-agnostic way, as a `ResolvedGradient` object coming from
`@kiskadee/core`. The web-builder is responsible for converting that data into valid CSS.

## Why gradients do not transition by default

In CSS, `linear-gradient(...)` is treated as an image, and browsers generally do not interpolate
images. That means transitions like `transition: background 180ms` typically do not animate between
gradients.

## Strategy used by Kiskadee

For `boxColor` gradients, the web-builder emits a CSS-only strategy with no JavaScript:

1. A stable gradient expression that references CSS custom properties:

   ```css
   .myClass {
     background: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%);
   }
   ```

2. State-specific rules that only override the variables, instead of swapping the whole gradient:

   ```css
   .myClass { --k-bg0: #AABBCC; --k-bg1: #DDEEFF; background: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%); }
   .myClass:hover { --k-bg0: #112233; --k-bg1: #445566; }
   ```

3. Global `@property` registrations so browsers that support it can interpolate `<color>` values:

   - `@property --k-bg0`
   - `@property --k-bg1`
   - `@property --k-bg2`

Those registrations live in `packages/components/react/src/styles/style.kiskadee.scss`.

## Constraints and fallbacks

- This strategy is implemented only for `boxColor` on web.
- Animation is enabled only for gradients with 2 or 3 stops.
- For other gradients or unsupported browsers, the output remains correct, but transitions may be
  skipped as progressive enhancement.

## Mirrored `boxColor` for structural reuse

Some components need to reuse the emitted `boxColor` inside structural CSS, for example when a
floating label needs a local background patch that follows the control surface.

For those cases, the web-builder may emit a mirrored background variable alongside `background`:

```css
.myClass {
  --k-bgc: #AABBCC;
  background: #AABBCC;
}
```

For gradients, the mirrored variable carries the full emitted background expression:

```css
.myClass {
  --k-bgc: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%);
  --k-bg0: #AABBCC;
  --k-bg1: #DDEEFF;
  background: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%);
}
```

Important limitations:

- This mirrored value is safe only when the structural consumer can reuse the same background paint
  semantics.
- Small overlay patches, such as TextField floating label cutouts, may not visually match a
  transparent or gradient shell background.
- In those cases, a dedicated surface token may still be needed instead of mirroring `boxColor`.

## Feature flag: force solid `boxColor` as gradient

When switching between Design Systems, CSS cannot interpolate between `background-color` (a color)
and `background-image: linear-gradient(...)` (an image). That can cause a visual jump when a DS uses
solid backgrounds and another uses gradients.

To mitigate this, initially for the showcase, the web-builder supports forcing solid `boxColor` to be
emitted as a degenerate 2-stop gradient with the same color on both stops, so the CSS type stays
consistent across DS.

- Flag lives in `packages/web-builder/src/run-build.ts`.
- Name: `ENABLE_SOLID_BOXCOLOR_AS_GRADIENT`.
- Default: `false`.

When enabled, a solid `boxColor` becomes:

```css
.myClass {
  --k-bg0: #AABBCC;
  --k-bg1: #AABBCC;
  background: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%);
}
```

## Class composition

State rules like `:hover`, `:active`, and `:focus-visible` only override
`--k-bg0`/`--k-bg1`/`--k-bg2`. The base gradient `background: linear-gradient(...)` is emitted on
the `rest` rule.

Therefore, the element must carry the base `rest` class for the state override to work.
