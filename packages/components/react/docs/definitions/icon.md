# Icon Component

Status: canonical definition.

## Independent responsibilities

Icon behavior is split into five dimensions:

- the active family selects glyph geometry;
- `Icon` owns accessible-image versus decorative semantics;
- the Icon schema owns scale, semantic color, and surface-relative paint;
- `IconGlyph` normalizes presentation inside component-owned slots;
- social and brand artwork remains direct, independently versioned content.

Changing the family does not change color, scale, emphasis, padding, background, divider, border,
or accessible names.

## Composition

The styled Icon accepts exactly one content mode:

```tsx
<Icon name="search" label="Search" />
<Icon decorative name="search" />

<Icon decorative>
  <CustomGlyph />
</Icon>
```

`name` resolves through the active `IconFamilyProvider`. `children` preserves direct composition
and does not require a provider. `fallback` is valid only with `name`; missing mappings never
silently mix in another family. Without a provider or mapping, a named Icon uses only its explicit
fallback; otherwise it reports the contract error in development and renders `null`.

`IconGlyph` is a presentation-only resolver:

```tsx
<IconGlyph name="search" />
```

It is always hidden from accessibility APIs, is never focusable, and normalizes SVG and icon-font
geometry to the parent slot. Button, Switch, Slider, Tabs, and Showcase controls use it when the
parent component already owns semantics.

## Element map

- `e1` (`glyph`) is the semantic root and visual viewport.
- It consumes `boxWidth`, `boxHeight`, and `textColor`.
- It exposes no interaction state or emphasis axis.
- The family provider is runtime selection infrastructure, not a schema element.

## Accessibility

A meaningful Icon requires `label` and renders `role="img"` with `aria-label`. A decorative Icon
requires `decorative={true}` and hides the root. Nested glyphs remain presentation-only.

Component slots do not nest a semantic Icon. For example, `Button.Icon name="send"` renders an
`IconGlyph` inside the Button's already-hidden icon slot, while Button retains its accessible name.

## Color and slot ownership

Monochrome glyphs use `currentColor`; the generated `textColor` on `e1` or the parent component
controls their paint. Fixed brand paint remains asset-owned.

The component containing an icon owns any background, padding, corner treatment, and contrast
strategy around that slot. Those concerns never move into the family adapter.

## Sizes

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
