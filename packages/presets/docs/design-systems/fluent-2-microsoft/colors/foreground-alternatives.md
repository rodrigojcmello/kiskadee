# Fluent foreground alternatives

Status: Kiskadee extension, user-approved on 2026-11-05. This is shared text-color authorship,
not an official Fluent appearance or another semantic intent. Button paint is outside this change.

The common foreground profiles Blue, Red and Green publish Alternative only on onVivid in
Light, Dark and Darker, for Microsoft and Teams. Deep and Neutral retain their existing recipes.
All previous profile values are preserved inside the new Standard coordinate.

The source is the existing approved complementary asset set documented in
[tonal evidence](fluent-tonal-scale-evidence.md). No assets or generator parameters change.
The preset resolves the global semantic roles through its strict FRF `referenceColor(role,
'subtle')` on the Light track, including dark themes. Medium, Low and Lowest reuse the existing
onVivid chromatic visibility factors 76%, 58% and 40%. High is opaque. The selected light anchor
is authored for foreground use independently of the complementary vivid anchor used by Button fills.

| Foreground | Global role | Microsoft High | Teams High |
| --- | --- | --- | --- |
| blue-alt | primary.v2 | #dbf1ff | #eeeaff |
| red-alt | redLike.v2 | #ffe7e4 | #ffe7e4 |
| green-alt | greenLike.v2 | #e2f3e0 | #e2f3e0 |

These are resolved complementary Light Subtle anchors (L4 in the promoted assets), not literals
in the schema. Blue continues the existing segment-primary mapping: Teams selects its indigo
complement through primary.v2. The reference location remains family-relative if assets change.
The four strengths intentionally reduce emphasis; no blanket 4.5:1 claim applies to all strengths
on arbitrary onVivid surfaces. Rendered visual calibration remains user-owned.

Authored Alternative leaves currently contain Rest only. They do not import Standard interaction
states. Standalone Text projects Rest; other components may select explicit coordinates via fg().
