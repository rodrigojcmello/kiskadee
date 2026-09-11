# Fluent Input Preview: Muted Darks + Vivid Lights

Candidate generator: `@kiskadee/tonal-scale@0.9.0`.
Status: experimental preview; no preset promotion or visual approval.

[Open the candidate locally](http://localhost:3001/?recipe=%7B%22formatVersion%22%3A5%2C%22gridContract%22%3A%22kiskadee-tonal-v1%22%2C%22harmonyContract%22%3A%22kiskadee-munsell-rest-v1%22%2C%22tonalProfile%22%3A%22vivid-lights%22%2C%22primary%22%3A%7B%22seedHex%22%3A%22%230064b4%22%2C%22appearance%22%3A%22auto%22%2C%22variant%22%3A%22v1%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%22tonalAnchors%22%3A%7B%22rest%22%3A%7B%22mode%22%3A%22auto%22%7D%7D%2C%22functionalReferences%22%3A%5B%5D%2C%22overrides%22%3A%5B%7B%22id%22%3A%22r.red.v1%22%2C%22seedHex%22%3A%22%23c50f1f%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22yr.orange.v1%22%2C%22seedHex%22%3A%22%23f7630c%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22y.yellow.v1%22%2C%22seedHex%22%3A%22%23eaa300%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22g.green.v1%22%2C%22seedHex%22%3A%22%23107c10%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22p.purple.v1%22%2C%22seedHex%22%3A%22%23c239b3%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22n.black.v2%22%2C%22seedHex%22%3A%22%2321242d%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22source-exact%22%7D%7D%5D%7D). Start the generator with
`pnpm --filter @kiskadee/tonal-scale dev` if port 3001 is not running.
Choose Muted Darks in the profile selector to compare the same inputs.

The [reproducible recipe](./fluent-vivid-lights.recipe.json) copies the inputs
from the existing Fluent candidate, changing only the tonal profile. It includes
primary `#0064b4`, red `#c50f1f`, orange `#f7630c`, yellow `#eaa300`, green
`#107c10`, purple `#c239b3`, and tinted neutral `#21242d`, plus the immutable
pure gray and the remaining fixed-reference families. The viewer therefore
resolves 13 families; fixed-reference companions are not claimed as official
Fluent source colors. See the preserved
[Fluent source evidence](../../../presets/docs/design-systems/fluent-2-microsoft/colors/fluent-tonal-scale-evidence.md).

## Historical 0.8.0 Comparison

Primary Light examples at the same target lightness:

| Slot | Muted Darks | Muted Darks + Vivid Lights | OKL chroma before / after |
| --- | --- | --- | --- |
| L20 | `#6baff9` | `#65afff` | 0.1283 / 0.1383 |
| L24 | `#569fec` | `#3d9eff` | 0.1357 / 0.1687 |
| L26 | `#4c97e5` | `#2195ff` | 0.1385 / 0.1843 |
| L65 | `#0d477e` | `#0d477e` | 0.1086 / 0.1086 |
| L85 | `#12263b` | `#12263b` | 0.0475 / 0.0475 |

The candidate resolves validly with review diagnostics, not a clean visual
approval. The initial run has 15 review issues versus 17 with Muted Darks.
In particular, Light Red and Purple acquire source-exact continuity review
conditions; the reduced total must not be interpreted as proof of better
visual quality. Existing neutral Dark trajectory and hue-boundary reviews
remain visible. Both black-family tone maps are unchanged versus Muted Darks.

Preset schemas, assets, manifests and evidence remain untouched in this
isolated generator delivery. The preset version audit consequently reports
that its candidate labels still reference 0.7.0; synchronizing those labels is
intentionally deferred under the requested preset boundary. Approved asset
provenance must not be relabeled as 0.8.0.

## 0.8.1 Hue Refinement

The same recipe now uses a bounded hue trajectory as well as chroma gain.
For primary Light L18, Muted Darks and the initial 0.8.0 candidate both emitted
`#76b7ff`; 0.8.1 emits `#56bdff`. The requested hue shift is about -11.89
degrees at this position. This is not a calibration to a particular Switch
HEX. The earlier table and issue counts are historical, not current results.

## 0.8.2 Expanded Chroma Gain

The display name is Muted Darks + Vivid Lights; recipe ID `vivid-lights`
remains compatible with existing links. The fixed gain ceiling and hue-travel
penalty are removed. Available gamut headroom can increase the requested gain
beyond 45%. The 12-degree hue bound, HEX gamut mapping, seed, dark treatment,
neutrals and contrast/lightness guards remain.

Standalone Light comparison with 0.8.1:

| Seed | Slot | 0.8.1 | 0.8.2 |
| --- | --- | --- | --- |
| Blue #0064b4 | L18 | #56bdff | #56bdff |
| Red #c50f1f | L18 | #ff8d84 | #ff906e |
| Green #107c10 | L18 | #58d153 | #03d80d |

Red shifts toward orange; this is an intentional candidate for visual review,
not evidence of approved identity fidelity. No preset assets are changed.

## 0.9.0 Medium Reference

Color values are unchanged from 0.8.2. Medium is derived halfway by public slot
count between subtle and vivid, ties toward subtle. Blue Light S4/V50 yields
M18; Dark S4/V40 yields M16. Overview and full strips use identical diamonds
for all functional anchors, alongside restored seed triangles and harmony-rest
upward triangles. Seed/harmony metadata also remains in detailed reports.
Validation compared all 936 emitted HEX values of this recipe with the 0.8.2
candidate and found no changes.
