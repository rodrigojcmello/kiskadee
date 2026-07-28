# Icon families

`@kiskadee/icons` owns reusable, cross-platform SVG sources. React components are generated
adapters, not the artwork's source of truth. Icons are grouped by visual family so the package can
add families without flattening similarly named assets into one namespace.

## Source and generated artifacts

- Canonical, uncalibrated artwork lives in `assets/<family>/` as plain SVG and is never rewritten.
- `metadata/icons.json` owns stable IDs, presentations, color behavior, provenance, and any
  cross-platform optical calibration.
- `src/families/<family>/` is generated, optically calibrated React source. Never edit those files
  manually.
- `dist/svg/` publishes the optically calibrated SVGs for non-React consumers.
- `dist/icons.json` publishes the cross-platform manifest with
  `assetState: "optically-calibrated"`. It exposes the resolved value as
  `appliedOpticalTransform` for provenance and omits the operational `opticalTransform` field, so
  consumers cannot accidentally apply the calibration twice.
- Native iOS and Android adapters are intentionally deferred. They must consume the same SVG
  sources and optical contract rather than extracting artwork from React.

Run `pnpm --filter @kiskadee/icons generate` after changing an asset or the manifest. The package
build performs the same generation automatically, while `check:generated` detects stale adapters.
Run `pnpm --filter @kiskadee/icons audit:optical` to inspect raw and calibrated bounds, alpha
coverage, center of mass, and clipping. Audit metrics are diagnostic evidence; they never replace
or update the human-approved calibration.

## Public imports

Use a direct icon import in application code so the dependency stays explicit and bundlers do not
need to traverse a complete family barrel:

```tsx
import { VolumeHighIcon } from '@kiskadee/icons/kiskadee/VolumeHighIcon';
```

Family barrels are available for discovery or consumers that intentionally use several icons:

```tsx
import { VolumeHighIcon, VolumeLowIcon } from '@kiskadee/icons/kiskadee';
```

The package root exposes each family as a namespace. It does not flatten icon exports because
different families may use the same icon names.

## Family structure

- Put canonical icons in `assets/<family>/` and describe them in `metadata/icons.json`.
- Treat `src/families/<family>/` as generated output.
- Keep shared implementation details in `src/internal/`; they are not public package exports.
- The generator exports every public icon from its family `index.ts`.
- Add a family export and direct-import pattern to `package.json` when introducing a family.

## SVG contract

- Authorial Kiskadee icons use the shared 24 by 24 view box, `currentColor`, rounded line caps
  and joins, and a 1.75 unit stroke when the icon is stroke-based.
- Keep authorial artwork optically centered and leave enough edge clearance for focus rings,
  button padding, and small-size rendering. Do not compensate for one consuming component inside
  the SVG.
- Third-party marks live in a separate family. Preserve the source artwork's coordinate system and
  silhouette. Their perceived size and placement may be calibrated only through the manifest's
  icon-level `opticalTransform`.
- `opticalTransform` adjusts the generated `viewBox`; it never rewrites canonical paths, fills,
  gradients, strokes, or proportions. One transform is shared by every presentation of the icon,
  so `brand` and `monochrome` always retain the same calibrated footprint.
- React adapters and `dist/svg/` are generated from the same calibrated SVG representation.
  Platform consumers must not recreate per-icon corrections locally.
- Every social mark exposes a `monochrome` presentation that renders entirely through
  `currentColor`. This technical presentation follows the consuming Icon component's semantic
  color even when the trademark owner requires the official brand artwork in marketing contexts.
- Never redraw a brand mark on the Kiskadee 24 by 24 grid merely to make it resemble an authorial
  icon. Brand geometry and Kiskadee icon geometry are different contracts.
- Keep icons decorative by default with `aria-hidden="true"` and `focusable="false"`.
- Let consumers override SVG presentation and accessibility props through `IconProps`.
- Name variants by meaning, not by the page or component that first consumes them.

Existing application icons can move into this package incrementally. A migration should preserve
the consuming UI behavior and should not pull unrelated icons into the same change.

## Platform consumption

- React consumers use the generated named components and retain direct, tree-shakable imports.
- Web consumers without React can import the calibrated file through `@kiskadee/icons/svg/*`.
- iOS and Android may later generate platform-native resources from the calibrated SVGs and their
  published manifest. The package does not require SVG loading at native runtime, and platform
  adapters must not reapply `appliedOpticalTransform`.
- A generic runtime `Icon` registry is not part of this contract. It may be added later as a
  convenience without replacing named component imports.

## Brand assets

The `social` family contains third-party trademarks, not Kiskadee-authored artwork:

```tsx
import { InstagramIcon } from '@kiskadee/icons/social/InstagramIcon';
```

Every social mark must have first-party provenance recorded in
[`social-icons.md`](./social-icons.md). A consumer is responsible for applying the trademark
owner's current usage rules. The package export is a technical convenience and does not grant a
license, partnership, endorsement, or permission to use a mark.
