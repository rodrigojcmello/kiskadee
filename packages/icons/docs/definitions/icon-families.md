# Brand icon distribution

`@kiskadee/icons` owns only reusable third-party brand marks. It does not define a Kiskadee
interface-icon family and does not mirror Lucide or another general-purpose icon catalog.

Interface glyphs are selected by each platform consumer. React applications use `lucide-react`
directly as the recommended fallback, while the provider-agnostic Kiskadee `Icon` component owns
size, semantic color, surface context, and accessibility.

## Source and generated artifacts

- Canonical brand artwork lives in `assets/social/` as plain SVG and is never rewritten by a
  package build.
- `metadata/icons.json` owns stable IDs, presentations, provenance, color behavior, and shared
  cross-platform optical calibration.
- `src/families/social/` is generated, optically calibrated React source. Never edit those files
  manually.
- `dist/svg/` publishes the optically calibrated brand SVGs for non-React consumers.
- `dist/icons.json` publishes the cross-platform brand manifest with
  `assetState: "optically-calibrated"`.

Run `pnpm --filter @kiskadee/icons generate` after changing a brand asset or the manifest. The
package build performs adapter generation automatically, while `check:generated` detects stale
adapters. Run `pnpm --filter @kiskadee/icons audit:optical` to inspect bounds, alpha coverage,
center of mass, and clipping.

## Public imports

Use direct imports so brand dependencies remain explicit and tree-shakable:

```tsx
import { InstagramIcon } from '@kiskadee/icons/social/InstagramIcon';
```

The social family barrel and the `SocialIcons` root namespace exist for deliberate discovery use
cases such as the Showcase brand gallery.

## Shared brand contract

- Preserve the source artwork's coordinate system and silhouette.
- Calibrate perceived size and placement only through the manifest's `opticalTransform`.
- Apply one transform to every presentation so `brand` and `monochrome` share a footprint.
- Every mark exposes a `monochrome` presentation through `currentColor`.
- Keep generated SVG components presentation-only; the consuming Kiskadee `Icon` wrapper owns
  accessible-image versus decorative semantics.

Every mark must have first-party provenance recorded in
[`social-icons.md`](./social-icons.md). Distribution is a technical convenience and does not grant
trademark permission, partnership, or endorsement.

## Interface glyphs

General interface pictograms do not belong to this package:

- Web consumers import them directly from `lucide-react` or another chosen provider.
- The `/icons` Showcase route keeps a local 30-icon Lucide sample solely to demonstrate the
  Kiskadee `Icon` component across sizes, intents, and surfaces.
- Native components may generate implementation resources directly from a pinned upstream icon
  source when a platform primitive needs a fixed glyph. Those resources do not become a public
  Kiskadee icon family.

This boundary prevents a small documentation sample from becoming an incomplete Kiskadee-owned
icon catalog.
