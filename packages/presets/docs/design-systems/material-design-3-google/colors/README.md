# Material tonal assets

Initial promotion: 2026-09-12, generator 0.13.0. Current promotion approved on 2026-09-13:
generator 0.16.0, Balanced, with a shared catalog for default and purple.

`tonal-system.recipe.json` is the authored input; `generated/` contains the canonical verified export. Ten TypeScript assets are copied verbatim into `packages/presets/src/presets/material-3-google/colors/default/`.

### Shared viewer — candidate generator 0.16.0

Candidate 0.16.0 adds a shared catalog with named additional variants and associated neutrals.
Existing approved assets retain their recorded versions until a separate promotion.

Candidate 0.15.0 changes the opt-in Chromatic derivation to Chromatic offset (-14 degrees).
Subtle and explicit-seed recipes preserve their colors. Approved preset assets retain their
recorded versions; the viewer candidate is not an automatic asset promotion.

The local viewer uses Balanced and `neutral.mode: derived-from-primary` with
`neutral.intensity: chromatic`. Blue, red and green seeds and their policies are unchanged.
The retained neutral input #001D35 is only the fallback for switching to existing mode; the
active neutral seed is #03233C, derived from the approved blue #0B57D0.

## Authored evidence and promoted references

| Family | Source seed / upstream role | Light subtle / medium / vivid | Dark subtle / medium / vivid |
| --- | --- | --- | --- |
| b.blue.v1 | #0B57D0 / Gmail primary | L4 `#e4eeff` / L18 `#86b3ff` / L50 `#0b57d0` | D4 `#001542` / D16 `#003285` / D40 `#0b57d0` |
| r.red.v1 | #B3261E / Gmail error; Material error40 | L4 `#ffe7e3` / L18 `#ff8e7f` / L50 `#b3261e` | D4 `#3b0000` / D16 `#790002` / D40 `#b3261e` |
| g.green.v1 | #146C2E / Gmail tertiary, adapted as semantic green | L4 `#e0f4e2` / L18 `#84c58d` / L55 `#146c2e` | D5 `#002308` / D16 `#004316` / D40 `#1b7132` |
| n.black.v2 | #03233C / primary-derived neutral, Chromatic offset (Kiskadee adaptation) | L4 `#e0f0ff` / L24 `#7d9fbf` / L85 `#03233c` | D5 `#001d36` / D26 `#2b4b66` / D90 `#b7dbfd` |
| n.black.v1 | #000000 / canonical pure grayscale | L4 `#ededed` / L28 `#8c8c8c` / L99 `#010101` | D5 `#1d1d1d` / D28 `#4b4b4b` / D99 `#fbfbfb` |

Gmail CSS tokens were inspected at https://mail.google.com/mail/u/0/#inbox on 2026-09-12. The primary represents a Google product theme, not a universal Material primary. Material error palette source: https://github.com/material-components/material-components-web/blob/master/packages/mdc-tokens/v0_161/_md-ref-palette.scss.

Additional promoted families `p.purple.v1`, `rp.magenta.v1` and `y.yellow.v1` are Kiskadee-generated support colors, not canonical Google semantic seeds. `rp.magenta.v1` occupies the existing Core `pink.v1` slot. Teal, lime, the base indigo V1, orange and brown remain in the export for inspection but are not promoted into this preset.

## Three-layer mapping

- Layer 1: canonical exported assets with Light/Dark scales and subtle, medium and vivid references. Black V1 is pure grayscale; Black V2 is the approved primary-derived tinted neutral.
- Layer 2: primary V1 uses Blue V1. Legacy primary V2 and neutral V1/V2 resolve to Black V2, avoiding a separate secondary blue. Pure black remains directly available through primitive.black.v1. Green is exposed as greenLike; existing redLike, yellowLike and purpleLike aliases remain.
- Layer 3: existing component intents remain valid. Button neutral resolves to neutral; Button primary and the existing Switch neutral intent resolve to primary. Destructive/error intents resolve to redLike. KIS-110 adds matching intent mappings for Badge, Chip, Icon, Progress, Slider and Text using these same approved families.

The initial promotion retained legacy component formulas and numeric tone positions. Button formulas were subsequently revised; see [Button evidence](../components/button.md). Card formulas were also revised; see [Card evidence](../components/card.md). KIS-110 subsequently revised remaining consumers; see the [coverage register](../components/coverage.md). Their resulting colors intentionally change with the new scales. This promotion does not claim pixel equality with the older purple Material kit or complete component-level visual homologation.

The old split Light/Dark files were removed after confirming they were imported only by color.layers.ts. KIS-110 removed the unused legacy Material generator and its library dependency after verifying that it had no external consumers. Use the tonal-scale export script and the authored recipe instead.

Validation includes manifest hashes, byte-identical TypeScript export parity, all three functional references, semantic/component alias resolution in default/dynamic Light/Dark, and Web Builder build/sync/generate.

## Historical same-hue Chromatic promotion (0.14.0) — 2026-09-13

The user approved the generated comparison and viewer before promotion. Regeneration changed
67 tone entries in n.black.v2 only; all other 12 exported families retain their scale colors,
including pure grayscale. The eight consumed TypeScript assets match the new canonical export
byte for byte; unchanged families receive only generator-provenance metadata updates.

The earlier #001D35 input came from Gmail on-secondary-container. It is retained here as
historical evidence, not the current neutral origin. No purple segment or component formula
change belongs to this promotion. Existing default/dynamic aliases continue sharing these assets.

That 0.14.0 neutral and blue shared L4 #E4EEFF. Intent mapping remains family-specific; equal
light tones are permitted and do not imply that neutral resolves through the primary family.

## Approved Chromatic offset promotion (0.15.0) — 2026-09-13

The user approved the -14 degree offset comparison and authorized promotion to the current
Material segment. Regeneration changes 67 neutral tone entries and no other family's scale.
The serialized recipe keeps `intensity: chromatic`; generator 0.15.0 records the offset behavior.
Light medium Card surfaces now differ: primary L4 #E4EEFF, neutral L4 #E0F0FF. Subtle mode,
pure grayscale, component formulas and the existing segment catalog are unchanged.
That promotion synchronized the 0.15.0 viewer and assets; the shared-catalog promotion below supersedes its metadata.


## Shared recipe and purple segment (0.16.0 / V6)

Approved visually by the user on 2026-09-13 before promotion. One recipe retains blue #0B57D0
as generation primary and adds **Roxo Material**, #6750A4, Light source-exact / Dark adaptive.
Official evidence: Material Web v0.192 `primary40`,
https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-ref-palette.scss.

The generator classifies that input as `pb.indigo.v2`. Core has no indigo slot, so its unchanged
exported asset is mapped to `primitive.purple.v2`; the existing `p.purple.v1` remains intact.
Its Chromatic offset neutral is `n.black.v3`, seed #1C1D3E, mapped to `primitive.black.v3`.
All 13 previously exported families retain exact scales and functional references.

| Segment | Primary V1 | Neutral V1/V2 and legacy Primary V2 | Shared roles |
| --- | --- | --- | --- |
| default / dynamic | blue.v1 | black.v2 | redLike, greenLike, yellowLike, purpleLike, pure black |
| purple | purple.v2 | black.v3 | same assets as default |

All ten consumed assets live in `colors/default/`; no `colors/purple/` exists. The segment
selects Layer 2 roles, not another generation recipe. Metadata records names and associated
neutral origins. The bundle includes both additions and remains atomically verifiable.
Existing component formulas, default colors and dynamic behavior are preserved.
