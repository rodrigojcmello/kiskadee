# Layout schema rules

Layout is a **Kiskadee extension** shared by Fluent, Carbon, Material, iOS 27, Elegant and the
three Sandbox presets. Its initial spacing ladder is an approved framework calibration, not an
extraction of any upstream design system's spacing tokens or a claim of upstream Layout fidelity.

The shared factory is `src/utils/createLayoutSchema.ts`. Preset roots register its output under
`components.layout`. It adds no colors, context production, effects, variants or density defaults,
and does not change existing component recipes.

| Size | Spacing |
| --- | --- |
| `s:sm:5` | 2 |
| `s:sm:4` | 4 |
| `s:sm:3` | 6 |
| `s:sm:2` | 8 |
| `s:sm:1` | 12 |
| `s:md:1` | 16 |
| `s:lg:1` | 24 |
| `s:lg:2` | 32 |
| `s:lg:3` | 40 |
| `s:lg:4` | 48 |
| `s:lg:5` | 64 |

All eight frame padding/margin properties and both flow directions publish this identical ladder.
`e1` is named `frame`; `e2` is named `flow`. Flow row and column gaps reuse `paddingTop` and
`paddingLeft` as authored scale owners; no `gap` attribute is added to Core. Components select
generated spacing classes independently, rather than applying an aggregate size bucket.

The [Core Layout contract](../../../../core/docs/definitions/layout.md) defines the allowed
schema properties and the dedicated `sp`/`gc` class-map handoff. These are Layout buckets, not
SUP registry entries or new meanings for `p`. Responsive column counts use each preset's existing
breakpoints; spacing remains a fixed numeric value per size in this version.
