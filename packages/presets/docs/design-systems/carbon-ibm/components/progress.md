# Carbon Progress Evidence

## Sources

- [Preview Progress bar specifications](https://preview.carbondesignsystem.com/building-blocks/core/components/progress-bar/specifications), inspected 2026-09-20.
- [Carbon Progress bar style](https://carbondesignsystem.com/components/progress-bar/style/).
- [Figma v11](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/?node-id=58-2763), file `MfGzFa79SfhHQ2mKpC3ss4`, entry node `58:2763`.

## Source Coverage

| Area | Relationship | Status |
| --- | --- | --- |
| Active/success/error colors, square track | Carbon Progress bar | Official adapted |
| Neutral/warning intents and OnVivid | Existing Kiskadee profiles | Kiskadee extension |
| 8px big size, labels and status icons | Upstream source, unavailable in current Progress slots | Deferred |

## Color And Token Provenance

`e2` publishes neutral/medium only, using `border-subtle-01`. `e3` maps Primary to
`border-interactive`, Positive to `support-success` and Destructive to `support-error`.
Neutral uses `border-inverse`; Warning uses `support-warning`. These last two intent choices are
framework extensions, not additional upstream statuses.

All source tokens use exact/cap locators registered as `source.tokens`;
[token-mapping.json](../colors/token-mapping.json) records White/G90/G100 source and generated
values. OnVivid indicators use their component family's Light `subtle` reference; the rail uses
physical white at 24%. Progress publishes Rest only.

## Geometry Boundary

Carbon specifies 4px small and 8px big bars. The current Core Progress validator fixes
`s:md:1` to 2px and `s:lg:1` to 4px, and requires at least one density to use `s:md:1`.
Regular and Spacious select `s:lg:1`, matching the official small bar; Compact selects
`s:md:1` as a **Kiskadee extension**. The 8px source size
is **Deferred**; changing Core would exceed the approved preset-only scope. Radius is zero through
the existing `pill` channel, giving the source square ends.

## Validation

The three-slot schema passes the Core Progress contract. No interaction states or label/icon
slots were added. Integrated render validation belongs to the preset-wide handoff.
