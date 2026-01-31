# @kiskadee/web-builder

Build pipeline that converts a Kiskadee `Schema` into Web artifacts (utility CSS + JSON maps).

## Gradients: `ResolvedGradient` + smooth transitions on Web

Kiskadee stores gradients in a **platform-agnostic** way (as a `ResolvedGradient` object coming from `@kiskadee/core`).
The Web builder is responsible for converting that data into valid CSS.

### Why gradients do not transition by default

In CSS, `linear-gradient(...)` is treated as an **image**, and browsers generally do not interpolate images.
That means transitions like `transition: background 180ms` typically do **not** animate between gradients.

### Strategy used by Kiskadee (CSS-only, no JS)

For `boxColor` gradients, the Web builder emits:

1) A stable gradient expression that references CSS custom properties:

```css
.myClass {
  background: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%);
}
```

2) State-specific rules that only override the variables (instead of swapping the whole gradient):

```css
.myClass { --k-bg0: #AABBCC; --k-bg1: #DDEEFF; background: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%); }
.myClass:hover { --k-bg0: #112233; --k-bg1: #445566; }
```

3) Global `@property` registrations (so browsers that support it can interpolate `<color>` values):

- `@property --k-bg0`
- `@property --k-bg1`
- `@property --k-bg2`

Those live in `packages/components/react/src/styles/style.kiskadee.scss`.

### Constraints and fallbacks

- This strategy is implemented only for `boxColor` on Web.
- Animation is enabled only for gradients with **2 or 3 stops**.
- For other gradients (or unsupported browsers), the output remains correct, but transitions may be skipped (progressive enhancement).

### Feature flag: force solid `boxColor` as gradient (showcase)

When switching between Design Systems, CSS cannot interpolate between `background-color` (a color) and
`background-image: linear-gradient(...)` (an image). That can cause a visual “jump” when a DS uses
solid backgrounds and another uses gradients.

To mitigate this (initially for the showcase), the web-builder supports forcing **solid `boxColor`**
to be emitted as a **degenerate 2-stop gradient** (same color on both stops), so the CSS type stays
consistent across DS.

- Flag lives in `packages/web-builder/src/run-build.ts`
- Name: `ENABLE_SOLID_BOXCOLOR_AS_GRADIENT`
- Default: `false`

When enabled, a solid `boxColor` becomes:

```css
.myClass {
  --k-bg0: #AABBCC;
  --k-bg1: #AABBCC;
  background: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%);
}
```

### Important note about class composition

State rules (like `:hover`, `:active`, `:focus-visible`) only override `--k-bg0/--k-bg1/--k-bg2`.
The base gradient `background: linear-gradient(...)` is emitted on the `rest` rule.
Therefore, the element must carry the base (rest) class for the state override to work.

### Control state (`selected`) vs selected-scoped effects

Kiskadee treats `controlState` (e.g. `selected`) and interaction effects (e.g. stateful `borderRadius`) as **separate, opt-in concerns**.

- `controlState` is a semantic toggle state that is activated by the runtime (e.g. `controlState={true}` on React components).
- Effects are optional, component-level features and must only be applied when the consumer explicitly opts in (e.g. `radiusEffect={true}`, `shadow={true}`).

This distinction matters because some Design Systems (e.g. Material Design 3) author *selected-specific* interaction effects (like “animated corners” under `effects.borderRadius.selected`). Those effects must **not** automatically activate just because `controlState` is on.

**Rule:** interaction keys under `selected:*` remain effects and stay inside the element `e` buckets in `core.kiskadee.json`. They must never be moved into the control-state field (`l`).

Practical implication for consumers: if a DS wants “selected + animated corners”, the component must be rendered with **both** `controlState={true}` and `radiusEffect={true}`.

## Border radius: modes vs effects (rounded / square / full)

Kiskadee separates **radius mode** (the base shape) from **radius effect** (stateful animated corners).
This keeps the base geometry cross‑platform and allows effects to be opt‑in.

### Radius modes (base geometry)

`radius` is a component prop that accepts:

- `rounded` (default): uses the schema `borderRadius` scale.
- `square`: forces 0 radius (hard corners).
- `full`: forces a capsule/pill shape.

The default mode comes from `schema.global.radius` and is exported in the build artifact `global.kiskadee.json`.
On web, `full` is implemented as a large fixed radius (`9999px`) while `square` is `0`.
On native platforms, `full` should be resolved as **50% of the element height** (or equivalent), and `square` as `0`.

### Radius effects (animated corners)

`radiusEffect` is a boolean prop that enables the **effects** bucket generated from `effects.borderRadius`:

- `rounded` uses `effects.borderRadius.rounded`
- `full` uses `effects.borderRadius.full`
- `square` ignores the radius effect

This is intentional: effects are opt‑in and never applied by default, even if the mode is `rounded` or `full`.

### Cross‑platform rule

- **Base geometry**: resolved by the renderer per platform (`rounded` uses schema values, `full` uses 50%/height‑2).
- **Effects**: always opt‑in via `radiusEffect`, regardless of platform.

### Feature flag: forced interaction states as class selectors (showcase)

For the showcase, it can be useful to display components in a specific interaction state
without relying on native browser pseudos (e.g. you cannot realistically force `:hover`
on a static HTML snapshot).

When enabled, the web-builder emits **additional selectors** for interaction states using
**forced state classes** (e.g. `.-h`, `.-f`) gated by the activator class `.-a`.

Examples (conceptual):

```css
/* Native pseudo */
.myClass:hover { /* ... */ }

/* Forced state (opt-in via classes) */
.myClass.-h.-a { /* ... */ }
```

- Flag lives in `packages/web-builder/src/run-build.ts`
- Name: `ENABLE_FORCED_INTERACTION_STATES`
- Default: `true` (showcase-oriented; change as needed)

## Segment registry vs `segments.json` artifact

Kiskadee no longer uses a `schema.segments` object as a source of truth.

### Source of truth (in presets)

Segments are defined and discovered via:

- `schema.colors.globalSemanticsBySegment`

This is a **segment registry** (metadata + optional overrides):

- `meta.name` is the human-friendly segment label shown in tooling.
- `themes` is optional and only exists when a segment overrides Layer 2 mappings.

Conceptually, runtime resolution works like this:

1) Segment override (if present)
2) Fallback to the global baseline

In code terms:

```ts
override = colors.globalSemanticsBySegment[segment].themes?.[theme]?.[semantic]
base = colors.globalSemantics[theme][semantic]
resolved = override ?? base
```

### Build artifact (`segments.json`)

`segments.json` is a **metadata artifact** published by the web-builder (used by the showcase and other tooling).

Even though the runtime resolver supports fallback/inheritance, artifacts should be **explicit**.
Therefore, `segments.json` is generated by:

- taking the global baseline (`colors.globalSemantics`)
- merging it with per-segment overrides (`colors.globalSemanticsBySegment[segment].themes`)
- writing an explicit `themes` object for **every segment**, including `default`

This means:

- `default.themes` is always fully populated (no “implicit inheritance” in the artifact)
- `dynamic.themes` (or any other segment) contains a fully materialized view (baseline + overrides)

### Why this split exists

- **Runtime config** should stay small and avoid duplication (baseline + overrides).
- **Artifacts** should be easy to inspect and consume without requiring the reader to understand inheritance.
