# Icon Families

`@kiskadee/icons` owns two deliberately separate capabilities:

- social and brand artwork, distributed as canonical SVG-based components;
- optional interface-icon family definitions, mappings, and lazy catalog entries.

The two capabilities never substitute for one another. A product logo is not resolved through the
interface family provider, and changing an interface family does not repaint or replace a brand.

## Interface family contract

A family maps semantic `IconName` values to presentation-only glyph renderers:

```tsx
const acmeClassic = defineIconFamily({
  id: 'acme-classic',
  label: 'Acme Classic',
  glyphs: {
    search: AcmeSearch,
    'acme:invoice-approved': AcmeInvoiceApproved
  },
  prepare: () => import('./acme-icons.css')
});
```

Canonical Kiskadee names are unnamespaced. Product-specific concepts use a namespace. Applications
can register their own families without editing Kiskadee metadata, and the same namespaced concept
may resolve to different artwork in different families.

Registration is inert. A catalog entry imports its family module only when selected, and
`prepare` runs only in the browser after selection. Concurrent loads share work, successful loads
are reused, and failed loads remain retryable.

The public broad catalog is opt-in. Direct family subpaths support static applications that want
one family and one upstream dependency.

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

The initial official Web adapters are Lucide, Fluent UI System Icons Regular, Material Symbols
Outlined, Carbon Icons, Iconoir Regular, Phosphor Regular, and Font Awesome Classic Free Solid.
Material Symbols is the only font-backed adapter; its preparation requests an alphabetically
subsetted Google Fonts stylesheet for the canonical ligatures.

## Preset and runtime boundary

A preset stores only:

```ts
global: {
  icons: {
    family: 'fluent-system'
  }
}
```

It contains no imports, glyphs, URLs, or loaders. `IconFamilyProvider` resolves the recommendation
against application definitions and catalog entries. The selected family changes glyph geometry
only. The consuming component continues to own size, color, surface relation, accessible name,
padding, background, border, divider, and interaction behavior.

`sf-symbols` is a semantic Apple-platform recommendation. The Web catalog's explicit
`sf-symbols -> iconoir` policy is a Kiskadee portability fallback and must be labeled as such.
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
