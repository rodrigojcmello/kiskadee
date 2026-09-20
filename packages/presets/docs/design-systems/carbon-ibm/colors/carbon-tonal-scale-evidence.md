# Carbon tonal scale evidence

## Source and method

Source: [Carbon preview color tokens](https://preview.carbondesignsystem.com/building-blocks/foundations/color/tokens)
and the user-provided [Carbon v11 Figma Color page](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/?node-id=169-0).
`figma-theme-tokens.json` records the inspected theme variables (White, G10, G90, G100).
`official-primitives.json` records their resolved primitive names. Aliases were resolved through
Figma's variable API, without modifying the file. The double hyphen in the file's
`text--on-color-disabled` is normalized to the official `text-on-color-disabled` spelling.

The Green 60 seed `#198038` is also confirmed by `$syntax-comment` in the
[official Carbon color tokens](https://carbondesignsystem.com/elements/color/tokens/).
This seed is separate from the captured `support-success` values; success lookups retain their
independently mapped source stops within the generated green family.

The current candidate generator is **0.19.0** (`@kiskadee/tonal-scale`), multifamily artifact
contract V5 and recipe format 7. The standalone artifact generator remains 0.8.2 and is not used.
The balanced profile produces independent Light/Dark scales. Darker consumes the Dark track
with independent G100 token coordinates; it does not invert the Light array.

## Promoted subset and identity

| Primitive | Upstream seed | Role |
| --- | --- | --- |
| `b.blue.v1` | Blue60 `#0f62fe` | Primary |
| `n.black.v1` | Achromatic generator family | Neutral and physical caps |
| `r.red.v1` | Red60 `#da1e28` | Destructive, attention |
| `g.green.v1` | Green60 `#198038` | Positive; success tokens independently mapped |
| `y.yellow.v1` | Yellow30 `#f1c21b` | Warning |
| `yr.orange.v1` | Orange40 `#ff832b` | Auxiliary foreground family |
| `pb.indigo.v1` | Purple60 `#8a3ffc` | Novelty/purple |

Carbon Purple60 classifies in the generator's purple-blue sector; Core exposes it as
`primitive.purple.v1` without relabeling its generated identity. IBM Blue is near the blue-sector
boundary. The diagnostic remains `review`; preserving the official seed is intentional.
Generated harmony-only teal, lime, purple, magenta and brown families are not promoted.

## Exact token mapping

`token-mapping.json` records every upstream token/primitive, theme, generated position, HEX and
OKLab delta-E. Selection minimizes delta-E **within the source family** independently per theme;
it never searches another family for a visually similar color. `carbon-ibm.tokens.ts` contains
only strict locators, not source HEX values. Physical endpoints and transparent colors use caps.
Other token positions use `exact` with registered `source.tokens` evidence. Family-relative
extensions use `reference` offsets and are documented in component evidence.

Reproduce the mapping with:

```sh
node packages/presets/scripts/generate-carbon-token-map.mjs
```

The manifest, diagnostics, locked source and generated assets are kept in `generated/`.
The original recipe is kept separately so the generator can reproduce that bundle in a fresh
output directory. The parity test checks both manifest hashes and source/runtime asset equality.

## Review status

The seven listed families from generator **0.19.0** were reviewed and promoted during the authorized
Carbon update. Review included the source-to-output mapping, resolved contrast checks and rendered
Carbon compositions in the production Showcase. Detailed coverage and limitations are recorded in
the preset source evidence. This records the implementation review; it does not imply a separate
user approval of each generated swatch. Generator success or diagnostic status alone is not visual
approval. The unpromoted harmony families remain candidates.
