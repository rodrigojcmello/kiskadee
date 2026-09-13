# Material tonal assets

Promoted with user authorization on 2026-09-12. Generator: 0.13.0; profile: Balanced.

`tonal-system.recipe.json` is the authored input; `generated/` contains the canonical verified export. Eight TypeScript assets are copied verbatim into `packages/presets/src/presets/material-3-google/colors/`.

### Shared viewer — candidate generator 0.13.0

The local viewer uses the current recipe with Balanced. Seeds, policies and explicit neutral are preserved. Primary-derived neutral is disabled.

## Authored evidence and promoted references

| Family | Source seed / upstream role | Light subtle / medium / vivid | Dark subtle / medium / vivid |
| --- | --- | --- | --- |
| b.blue.v1 | #0B57D0 / Gmail primary | L4 `#e4eeff` / L18 `#86b3ff` / L50 `#0b57d0` | D4 `#001542` / D16 `#003285` / D40 `#0b57d0` |
| r.red.v1 | #B3261E / Gmail error; Material error40 | L4 `#ffe7e3` / L18 `#ff8e7f` / L50 `#b3261e` | D4 `#3b0000` / D16 `#790002` / D40 `#b3261e` |
| g.green.v1 | #146C2E / Gmail tertiary, adapted as semantic green | L4 `#e0f4e2` / L18 `#84c58d` / L55 `#146c2e` | D5 `#002308` / D16 `#004316` / D40 `#1b7132` |
| n.black.v2 | #001D35 / Gmail on-secondary-container, adapted as tinted neutral | L4 `#e0f0ff` / L26 `#7697b6` / L90 `#001d35` | D5 `#001d35` / D28 `#2f4e69` / D95 `#dceeff` |
| n.black.v1 | #000000 / canonical pure grayscale | L4 `#ededed` / L28 `#8c8c8c` / L99 `#010101` | D5 `#1d1d1d` / D28 `#4b4b4b` / D99 `#fbfbfb` |

Gmail CSS tokens were inspected at https://mail.google.com/mail/u/0/#inbox on 2026-09-12. The primary represents a Google product theme, not a universal Material primary. Material error palette source: https://github.com/material-components/material-components-web/blob/master/packages/mdc-tokens/v0_161/_md-ref-palette.scss.

Additional promoted families `p.purple.v1`, `rp.magenta.v1` and `y.yellow.v1` are Kiskadee-generated support colors, not canonical Google semantic seeds. `rp.magenta.v1` occupies the existing Core `pink.v1` slot. Teal, lime, indigo, orange and brown remain in the export for inspection but are not promoted into this preset.

## Three-layer mapping

- Layer 1: canonical exported assets with Light/Dark scales and subtle, medium and vivid references. Black V1 is pure grayscale; Black V2 is the explicit tinted neutral.
- Layer 2: primary V1 uses Blue V1. Legacy primary V2 and neutral V1/V2 resolve to Black V2, avoiding a separate secondary blue. Pure black remains directly available through primitive.black.v1. Green is exposed as greenLike; existing redLike, yellowLike and purpleLike aliases remain.
- Layer 3: existing component intents remain valid. Button neutral resolves to neutral; Button primary and the existing Switch neutral intent resolve to primary. Destructive/error intents resolve to redLike. No new component appearance is added merely to consume green.

The initial promotion retained legacy component formulas and numeric tone positions. Button formulas were subsequently revised; see [Button evidence](../components/button.md). Other component formulas remain unchanged. Their resulting colors intentionally change with the new scales. This promotion does not claim pixel equality with the older purple Material kit or complete component-level visual homologation.

The old split Light/Dark files were removed after confirming they were imported only by color.layers.ts. The legacy generate-material-color-artifacts tool is not used for this preset promotion; its default output must not be used to regenerate these assets. Use the tonal-scale export script and the authored recipe instead.

Validation includes manifest hashes, byte-identical TypeScript export parity, all three functional references, semantic/component alias resolution in default/dynamic Light/Dark, and Web Builder build/sync/generate.
