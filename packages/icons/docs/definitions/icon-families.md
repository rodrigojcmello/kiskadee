# Icon Families

`@kiskadee/icons` owns two deliberately separate capabilities:

- social and brand artwork, distributed as canonical SVG-based components;
- optional interface-icon family definitions, mappings, and lazy catalog entries.

The two capabilities never substitute for one another. A product logo is not resolved through the
interface family provider, and changing an interface family does not repaint or replace a brand.

## Interface family contract

A family maps semantic `IconName` values to presentation-only glyph renderers. A family may expose
local variants without turning each visual weight into an unrelated family:

```tsx
const acmeClassic = defineIconFamily({
  id: 'acme-classic',
  label: 'Acme Classic',
  defaultVariant: 'regular',
  variants: {
    regular: {
      label: 'Regular',
      glyphs: {
        search: AcmeSearch,
        'acme:invoice-approved': AcmeInvoiceApproved
      }
    },
    bold: {
      label: 'Bold',
      glyphs: {
        search: AcmeSearchBold,
        'acme:invoice-approved': AcmeInvoiceApprovedBold
      }
    }
  },
});
```

The original single-variant shorthand remains valid and normalizes to `regular`:

```tsx
defineIconFamily({
  id: 'acme-classic',
  label: 'Acme Classic',
  glyphs: { search: AcmeSearch },
  prepare: () => import('./acme-icons.css')
});
```

Canonical Kiskadee names are unnamespaced. Product-specific concepts use a namespace. Applications
can register their own families without editing Kiskadee metadata, and the same namespaced concept
may resolve to different artwork in different families.

`radio-selected` is the canonical menu-radio indicator. It resolves to an isolated filled dot from
each family rather than a checkmark or CSS-drawn circle. Mapping-level renderer defaults may fill or
optically normalize an upstream circle when the installed family has no native filled-dot export;
the geometry still comes from the mapped upstream glyph and remains generator-owned.

Registration is inert. A catalog entry imports its family module only when selected, and
the selected variant's `prepare` runs only in the browser after selection. Concurrent family loads
share work, variant preparation is keyed by `family + variant`, successful work is reused, and
failed work remains retryable.

Variants are local IDs, not a universal weight taxonomy. `fill`, `duotone`, and `bold` may exist in
one family and be meaningless in another. The provider resolves an omitted variant to the
family's declared default and rejects an unavailable explicit variant. It never substitutes a
different variant or mixes glyphs from another family.

Variant selection changes the complete family profile. Individual `Icon` and `IconGlyph`
instances do not override it in this contract. Arbitrary direct children remain the escape hatch
for a deliberate one-off glyph.

The public broad catalog is opt-in. Direct family subpaths support static applications that want
one family and one upstream dependency.

## Essential component icons

Kiskadee separates three responsibilities:

- a preset recommends one interface family and optional variant;
- an application supplies free icons to public component slots and data models;
- `EssentialIconProvider` supplies a small global map for built-in component affordances.

The essential catalog contains `check`, `radio-selected`, `chevron-down`, `chevron-left`,
`chevron-end`, and `close`. Its values are `IconName` strings, never instantiated components or
React nodes. The provider does not accept a family or variant: it is placed below
`IconFamilyProvider` and resolves every configured name against the current effective family.
Applications may replace individual mappings or provide a partial map.

An absent provider, absent entry, or unavailable glyph resolves to no icon. Components must then
omit the icon's wrapper, spacing, divider, or affordance instead of choosing another family or an
internal fallback. An explicit public `name`, `icon`, `children`, or `fallback` remains a deliberate
consumer override and is not replaced by the essential map.

Unchecked checkbox and radio items may preserve an invisible wrapper only when their essential
entry resolves, maintaining alignment with selected siblings. The radio indicator always comes
from the family's `radio-selected` mapping; components do not draw the dot in CSS.

## Canonical coverage

`src/interface/canonical.ts` owns the public canonical-name union.
`metadata/interface-families.json` maps every canonical name across every official Web family and
records `fixed`, `mirror`, or explicit RTL geometry per family.
`scripts/generate-interface-families.ts` validates complete coverage and requires a separate RTL
mapping whenever a family classifies a concept as `unique`, then generates the adapters in
`src/interface/families/`.

When an upstream family publishes distinct left-to-right and right-to-left artwork, Kiskadee uses
`unique` with both mappings rather than mirroring glyphs that contain numbers or other asymmetric
details.

Do not hand-edit generated family files. Run:

```sh
pnpm --filter @kiskadee/icons generate
pnpm --filter @kiskadee/icons check:generated
```

The official Web adapters expose:

- Lucide: `thin`, `regular`, and `bold` Kiskadee stroke-width profiles;
- Fluent UI System Icons: `regular`;
- Material Symbols Outlined: `fill-0` and `fill-1`, both weight 400, grade 0, optical size 24;
- Carbon Icons: `regular`;
- Iconoir: `regular`;
- Phosphor: `thin`, `regular`, `fill`, and `duotone`;
- Font Awesome Classic Free: `solid`.

Lucide's profile names describe Kiskadee defaults over the upstream `strokeWidth` API; they are not
separately drawn official Lucide catalogs. Phosphor already ships every supported weight inside
the same per-icon component, so the variants share one lazy family module. Material Symbols is
font-backed and shares one alphabetically subsetted variable-font stylesheet covering FILL 0–1.
This avoids duplicating chunks or network resources merely to preserve a clean public variant
contract.

Iconoir Solid and Font Awesome Classic Free Regular are not exposed because their installed
upstream catalogs cannot cover all canonical Kiskadee names. Partial coverage is recorded as a
deferred capability, not hidden behind a Regular-to-Solid or Solid-to-Regular fallback.

## Preset and runtime boundary

A preset stores only:

```ts
global: {
  icons: {
    family: 'fluent-system',
    variant: 'regular'
  }
}
```

`variant` is optional and resolves to the catalog default. The schema contains no imports, glyphs,
URLs, or loaders. `IconFamilyProvider` resolves the recommendation against application definitions
and catalog entries. The selected family variant changes glyph geometry only. The consuming
component continues to own size, color, surface relation, accessible name, padding, background,
border, divider, and interaction behavior.

`sf-symbols` is a semantic Apple-platform recommendation. The Web catalog's explicit
`sf-symbols -> iconoir.regular` policy is a Kiskadee portability fallback and must be labeled as such.
Iconoir is never presented as Apple's official family.

## Direct glyphs

Named resolution is optional. `Icon` and component icon slots continue to accept arbitrary
presentation nodes directly. This is the escape hatch for one-off artwork, upstream concepts not
in the canonical subset, and custom application orchestration.

Missing named glyphs never silently fall back to Lucide or mix families. A consumer must provide
an explicit fallback or fix the mapping.

## Brand sources and generated artifacts

Brand artwork remains governed by [`social-icons.md`](./social-icons.md):

- canonical SVGs live in `assets/social/`;
- `metadata/icons.json` owns constructions, presentations, provenance, and optical calibration;
- `src/families/social/` and `dist/svg/` are generated;
- fixed brand paint remains asset-owned, while monochrome presentations use `currentColor`.

Distribution is a technical convenience and does not grant trademark permission, partnership, or
endorsement.
