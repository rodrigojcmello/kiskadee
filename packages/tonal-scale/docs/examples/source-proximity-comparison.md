# Source-proximity selection comparison

Generator 0.12.0 versus 0.13.0. Same recipes and profiles; no preset promotion.

All twelve corrected-recipe runs are valid with no blocking errors. The stress recipe uses primary #27AE60 and removes the conflicting green override. It is a post-change validation, not a before/after baseline.

| Recipe / profile | Changed family: changed Light + Dark HEX positions |
| --- | --- |
| material-design-3-google/balanced | bg.teal.v1: 34, gy.lime.v1: 11, p.purple.v1: 34, pb.indigo.v1: 5, rp.magenta.v1: 10, y.yellow.v1: 24, yr.orange.v1: 26 |
| material-design-3-google/muted-darks | bg.teal.v1: 61, gy.lime.v1: 19, p.purple.v1: 24, pb.indigo.v1: 10, rp.magenta.v1: 45 |
| material-design-3-google/vivid-lights | bg.teal.v1: 52, gy.lime.v1: 23, p.purple.v1: 23, pb.indigo.v1: 24, rp.magenta.v1: 49, yr.brown.v1: 59, yr.orange.v1: 12 |
| fluent-2-microsoft/balanced | bg.teal.v1: 51, gy.lime.v1: 21, pb.indigo.v1: 9, rp.magenta.v1: 36, yr.brown.v1: 23 |
| fluent-2-microsoft/muted-darks | bg.teal.v1: 59, pb.indigo.v1: 12, rp.magenta.v1: 47, yr.brown.v1: 40 |
| fluent-2-microsoft/vivid-lights | gy.lime.v1: 13, pb.indigo.v1: 14, rp.magenta.v1: 44, yr.brown.v1: 63 |
| ios-27-apple/balanced | gy.lime.v1: 29, rp.magenta.v1: 23 |
| ios-27-apple/muted-darks | gy.lime.v1: 50, rp.magenta.v1: 45 |
| ios-27-apple/vivid-lights | gy.lime.v1: 52, rp.magenta.v1: 51 |

The four authored Material families (primary, red, green, neutral V2) and canonical grayscale retain their emitted scale HEX values across this comparison. Changes are in automatically harmonized companion families. Source-exact seed policies remain intact.

For Material Light teal, the effective seeds change from #8EEDF0 to #00AAAF (Balanced), #1BF7FE to #00AAAF (Muted Darks), and #038387 to #009095 (Muted Darks + Vivid Lights). At medium L18, the corresponding changes are #28CACF to #56C7CB, #00CBD1 to #56C7CB, and #51C7CC to #41C9CE. The vivid-lights increase is intentional: a source-near candidate now satisfies the existing peak tolerance instead of retaining a below-target fallback.

Ranking still evaluates emitted peak, rest balance, hard score and hue constraints, plus applicable isolated-midtrack and dark-support moderation. This change does not introduce a per-family chroma-equality rule.
