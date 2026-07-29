# Icon Component

Status: canonical first contract.

## Ownership

The consumer owns the interface glyph and may select any compatible icon provider.
`@kiskadee/icons` owns only third-party brand marks, their SVG paths, view boxes,
provenance, and presentation-specific fills. `@kiskadee/react-headless` owns the semantic
`span` and whether the supplied glyph is an accessible image or decorative.
`@kiskadee/react-components` owns generated class consumption and the structural
SVG viewport. Presets will own the generated size and foreground classes when
Icon schemas are authored.

The Icon component does not register glyphs and does not choose an asset. Its
single child is the SVG supplied by the consumer.

`lucide-react` is the recommended web fallback for general interface glyphs and is consumed
directly by applications. Kiskadee does not re-export or curate a public Lucide subset.
Consumers may instead pass a glyph from another library, a product-specific asset, or a
design-system-specific family through the same `children` contract.

Brand optical calibration is also owned and pre-resolved by `@kiskadee/icons`.
The component applies one common viewport to every glyph and must not contain
per-brand scale or position exceptions.

## Element Map

- `e1` (`glyph`) is required and is both the semantic root and visual glyph
  viewport.
- It consumes only `boxWidth`, `boxHeight`, and `textColor`.
- There are no options, interaction states, effects, extra elements, or
  component registry.
- There is no name-based lookup or dynamic provider registry. Asset selection
  stays explicit and tree-shakable at the consumer import site.

## Accessibility

A meaningful Icon requires `label` and renders a `span` with `role="img"` and
`aria-label`. A decorative Icon requires `decorative={true}` and hides the
wrapper from the accessibility tree. The wrapper owns this decision; nested SVG
assets remain presentation-only.

## Color Ownership

Monochrome assets use `currentColor`, so the generated `textColor` class on
`e1` controls their foreground. Brand assets with fixed fills retain those
asset-owned fills. Structural CSS sizes the SVG but never writes `fill`,
`stroke`, or a literal color.

The only public intent branches are `neutral` and `primary`. `neutral` is the
default, following the canonical Kiskadee component starting shape. Both use
`medium.rest` in `onSubtle` or `onVivid`. Icon exposes no interaction-state or
emphasis prop.

## Sizes

The public scale is fixed:

| Scale | Pixels |
| --- | ---: |
| `s:sm:2` | 12 |
| `s:sm:1` | 16 |
| `s:md:1` | 20 |
| `s:lg:1` | 24 |
| `s:lg:2` | 28 |
| `s:lg:3` | 32 |
| `s:lg:4` | 48 |

`s:md:1` is the default.

The Showcase intentionally starts its icon galleries at `s:lg:3` so glyph
geometry remains easy to inspect. That presentation choice does not change the
component default.
