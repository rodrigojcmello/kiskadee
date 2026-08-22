# Icon Component

Status: canonical definition.

## Independent responsibilities

Icon behavior is split into five dimensions:

- the active family selects glyph geometry;
- `Icon` owns accessible-image versus decorative semantics;
- the Icon schema owns scale, semantic color, and surface-relative paint;
- `FamilyResolvedIcon` optionally resolves presentation through the active family;
- social and brand artwork remains direct, independently versioned content.

Changing the family does not change color, scale, emphasis, padding, background, divider, border,
or accessible names.

## Composition

The styled Icon accepts direct content and remains independent of the icon-family provider:

```tsx
<Icon label="Search">
  <CustomGlyph />
</Icon>
```

`FamilyResolvedIcon` is a presentation-only resolver that may be composed inside `Icon` or another
component slot:

```tsx
<FamilyResolvedIcon name="search" />
```

It is always hidden from accessibility APIs, is never focusable, and normalizes SVG and icon-font
geometry to the parent slot. Button, Switch, Slider, Tabs, and Showcase controls use it when the
parent component already owns semantics.

## Essential component affordances

`EssentialIconProvider` owns the limited global map used by built-in component affordances such as
selection marks, disclosures, submenu navigation, back, and close. It accepts `IconName` values
only and sits below `IconFamilyProvider`; it never selects a family or variant itself.

`useEssentialIcon` returns a configured name only when the active effective family resolves it.
Provider absence, entry absence, and missing family coverage all return `undefined`. A component
then omits the complete icon-owned slot, including its wrapper, spacing, or divider. Public direct
composition through `children` remains consumer-owned.

The map is global rather than component-specific. Free item icons continue to come from component
composition or data and are not promoted into the essential catalog.

## Element map

- `e1` (`glyph`) is the semantic root and visual viewport.
- It consumes `textColor` and the square viewport generated from its `iconSize` references.
- Presets define the numeric levels in `global.iconSizes`; the component scale selects the matching
  generated scale class and performs no size lookup in the browser.
- It exposes no interaction state or emphasis axis.
- The family provider is runtime selection infrastructure, not a schema element.

## Accessibility

A meaningful Icon requires `label` and renders `role="img"` with `aria-label`. A decorative Icon
requires `decorative={true}` and hides the root. Nested glyphs remain presentation-only.

Component slots do not nest a semantic Icon. For example, `Button.Icon` may contain a
`FamilyResolvedIcon`, while Button retains its accessible name.

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
