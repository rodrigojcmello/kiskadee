# Fluent foreground alternatives

Status: Kiskadee extension, user-approved on 2026-11-05. This is shared text-color authorship,
not an official Fluent appearance or another semantic intent. Button paint is outside this change.

The common foreground profiles Blue, Red and Green publish Alternative only on onVivid in
Light, Dark and Darker, for Microsoft and Teams. Deep and Neutral retain their existing recipes.
All previous profile values are preserved inside the new Standard coordinate.

The source is the existing approved complementary asset set documented in
[tonal evidence](fluent-tonal-scale-evidence.md). No assets or generator parameters change.
The preset resolves the global semantic roles through its strict FRF `referenceColor(role,
'vivid', 0)` on the Light track, including dark themes. Medium, Low and Lowest reuse the existing
onVivid chromatic visibility factors 76%, 58% and 40%. High is opaque. The text recipe now selects the same complementary vivid anchor also available to Button fills.

| Foreground | Global role | Microsoft High | Teams High |
| --- | --- | --- | --- |
| blue-alt | primary.v2 | #40befe | #b5a2f4 |
| red-alt | redLike.v2 | #fe8a80 | #fe8a80 |
| green-alt | greenLike.v2 | #5ecd59 | #5ecd59 |

On 2026-11-06 the user approved testing the full complementary Vivid anchor (L18 in the promoted
assets), following the earlier L4 and L12 candidates. Values remain family-relative FRF lookups,
not literals in the schema. Blue continues the existing segment-primary mapping: Teams selects its indigo
complement through primary.v2. The reference location remains family-relative if assets change.
The four strengths intentionally reduce emphasis; no blanket 4.5:1 claim applies to all strengths
on arbitrary onVivid surfaces. Rendered visual calibration remains user-owned.

Alternative leaves do not import Standard interaction states. High also publishes Pending at
70% visibility of its Rest color for component consumers, added with the Button foreground
integration on 2026-11-07. Standalone Text still projects only Rest. Other components select these
coordinates through fg() or fg.parentState().

The L18 candidate is a colorfulness experiment pending visual acceptance. On the canonical Light Microsoft
surface #0064B4, opaque Blue/Red/Green High measure approximately 2.88:1, 2.63:1 and 2.97:1. More
chroma is not equivalent to greater luminance contrast; this recipe does not claim 4.5:1 for small
body text. Base Standard, Deep, tonal generator profiles and promoted assets are unchanged.
