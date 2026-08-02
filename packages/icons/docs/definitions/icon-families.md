# Brand icon distribution

`@kiskadee/icons` owns only reusable third-party brand marks. It does not define a Kiskadee
interface-icon family and does not mirror Lucide or another general-purpose icon catalog.

Interface glyphs are selected by each platform consumer. React applications use `lucide-react`
directly as the recommended fallback, while the provider-agnostic Kiskadee `Icon` component owns
size, semantic color, surface context, and accessibility.

## Source and generated artifacts

- Canonical brand artwork lives in `assets/social/` as plain SVG and is never rewritten by a
  package build.
- `metadata/icons.json` owns stable IDs, constructions, presentations, provenance, color behavior,
  and cross-platform optical calibration per construction.
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
- A construction is one official geometry, such as Reddit `contained` or `mark`.
- A presentation changes the paint of that geometry, such as `brand`, `monochrome`, or a
  brand-specific adaptive treatment.
- `brand` means the trademark holder owns the paint. It remains fixed even when the official
  artwork uses only Black.
- `monochrome` means the consumer owns one paint through `currentColor`.
- An adaptive presentation must name the owned and contextual parts explicitly. It does not weaken
  the rule that `monochrome` is entirely consumer-owned.
- Calibrate perceived size and placement only through each construction's `opticalTransform`.
- Apply one transform to every presentation in the same construction so those presentations share
  a footprint.
- Every brand exposes at least one `monochrome` presentation through `currentColor`; a construction
  that exists only for official color artwork does not need to duplicate it.
- `defaultConstruction` and each construction's `defaultPresentation` are deterministic API
  defaults, not responsive or size-dependent rules. The default construction always defaults to
  its `brand` presentation.
- Keep generated SVG components presentation-only; the consuming Kiskadee `Icon` wrapper owns
  accessible-image versus decorative semantics.

No construction is selected automatically from icon size, component, surface, or viewport. A
consumer that needs a non-default construction must request it explicitly:

```tsx
<RedditIcon construction="mark" presentation="monochrome" />
```

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
