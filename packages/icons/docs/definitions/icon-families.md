# Icon families

`@kiskadee/icons` owns reusable SVG icons for React consumers. Icons are grouped by visual family
so the package can add families without flattening similarly named assets into one namespace.

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

- Put public icons in `src/families/<family>/`.
- Keep shared implementation details in `src/internal/`; they are not public package exports.
- Export every public icon from its family `index.ts`.
- Add a family export and direct-import pattern to `package.json` when introducing a family.

## SVG contract

- Authorial Kiskadee icons use the shared 24 by 24 view box, `currentColor`, rounded line caps
  and joins, and a 1.75 unit stroke when the icon is stroke-based.
- Keep authorial artwork optically centered and leave enough edge clearance for focus rings,
  button padding, and small-size rendering. Do not compensate for one consuming component inside
  the SVG.
- Third-party marks live in a separate family. Preserve the source artwork's coordinate system and
  silhouette; normalize only the React wrapper, external `1em` size, decorative accessibility
  defaults, and an official monochrome color treatment when the brand permits one.
- Never redraw a brand mark on the Kiskadee 24 by 24 grid merely to make it resemble an authorial
  icon. Brand geometry and Kiskadee icon geometry are different contracts.
- Keep icons decorative by default with `aria-hidden="true"` and `focusable="false"`.
- Let consumers override SVG presentation and accessibility props through `IconProps`.
- Name variants by meaning, not by the page or component that first consumes them.

Existing application icons can move into this package incrementally. A migration should preserve
the consuming UI behavior and should not pull unrelated icons into the same change.

## Brand assets

The `social` family contains third-party trademarks, not Kiskadee-authored artwork:

```tsx
import { InstagramIcon } from '@kiskadee/icons/social/InstagramIcon';
```

Every social mark must have first-party provenance recorded in
[`social-icons.md`](./social-icons.md). A consumer is responsible for applying the trademark
owner's current usage rules. The package export is a technical convenience and does not grant a
license, partnership, endorsement, or permission to use a mark.
