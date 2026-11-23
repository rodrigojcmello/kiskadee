# Tonal origin review of the ten workspace presets

## Outcome

Review date: 2026-11-22. All ten presets expose both primitive tracks. Recipe coverage differs:
a published Dark primitive scale does not imply an authored Dark theme. Origin-only corrections
in Fluent Microsoft, Material Google, iOS 27 and Carbon preserve the complete serialized schemas
compared with the working tree at the start of this review, including earlier uncommitted edits.
The tonal generator and artifact writers were not run.

| Preset | Opposite-track output coordinates before → after | Decision |
| --- | ---: | --- |
| [Fluent 2 Microsoft](presets/fluent-2-microsoft.md) | 2,420 → 940 | Four Blue Dark Highest destinations migrated after the initial 944 count. Teams Highest and several vivid interaction recipes still need an owner decision. |
| [Material 3 Google](presets/material-3-google.md) | 4,930 → 903 | Corrected physical paint, matching primary anchors and fixed-tone equivalences across segments, including purple. Inverse chromatic recipes remain. |
| [iOS 27 Apple](presets/ios-27-apple.md) | 1,244 → 360 | Migrated physical fills, contours, overlays and exact neutral tones, including L85 → D7 and L90 → D5. Several chromatic inverse fills and ink states remain. |
| [Carbon IBM](presets/carbon-ibm.md) | 756 → 146 | Migrated physical endpoints and matching semantic/intent recipes. Some Dark inverse and interaction values lack an equivalent. |
| [Fluent 2 Kiskadee](presets/fluent-2-kiskadee.md) | 0 detected | Legacy solid and gradient palettes include dynamic CSS references. No static cross-track change identified. Runtime colors have no fixed RGB to match. |
| [Elegant](presets/elegant.md) | 0 detected | Published color leaves under Light only; both primitive tracks exist. |
| [iOS 18 Apple](presets/ios-18-apple.md) | No tracked reads | Light-only legacy recipe with fixed values and reversed Dark placeholder scales. A literal does not establish the track that originally supplied it. |
| [Sandbox](presets/sandbox.md) | No tracked reads | Experimental legacy palettes contain literal paint, including Dark entries. No reliable source family/track for these literals. Left for their owner. |
| [Sandbox 2](presets/sandbox-2.md) | No tracked reads | Experimental legacy palettes contain literal paint, including Dark entries. No reliable source family/track for these literals. Left for their owner. |
| [Sandbox 3](presets/sandbox-3.md) | No tracked reads | Experimental legacy palettes contain literal paint, including Dark entries. No reliable source family/track for these literals. Left for their owner. |

Counts are distinct serialized destinations dependent on an opposite-track primitive lookup in
the audited standard preset schemas, including derived colors and alpha. One source tone may
supply many destinations. A separate scan found 904 explicit Light profile references in
Fluent Dark/Darker recipes (472/432); these are counted separately from primitive reads.

## Reproduction and scope

Run `pnpm check:preset-colors` for all ten schema producers, or set
`KISKADEE_LIST_TONAL_DEBT=1` to list the affected coordinates. This is a read-only
authoring check. It probes the public color getters in memory, compares dependent palette
leaves across opposing tracks and inspects serialized foreground/contour/sep coordinates.
Changed footprints require review. The normal Surface Builder build runs this check first.

For the linked preset inventories, each distinct source track/family/tone was probed separately at the
primitive read, before alpha and color composition. The resulting theme-specific leaves were
compared in components, global profiles/effects and theme tokens. Counterpart stops were checked
against the same approved primitive scale, without nearest-tone matching. Effects outside any
theme, raw literals, dynamic CSS values and optional consumer-supplied Brand Pack data are not
assigned primitive provenance by this procedure. Explicit profile links are a separate handoff:
rewriting them changes the serialized schema coordinate even when today's paint matches.
