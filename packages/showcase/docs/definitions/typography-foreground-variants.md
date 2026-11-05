# Typography foreground variants

The Chromatic foregrounds section keeps independent Alt switches inside the On subtle and On vivid
cards. They start off and consume the context produced by the actual Card. Availability comes from
Text's published `capabilities.colorVariants`, scoped to segment/theme/context and local foreground.
No preset identifier or color values are embedded in the example.

When enabled, each supported row uses the public qualified foreground name (for example blue-alt)
and labels the family Blue alt. Unsupported rows retain their normal foreground with an explicit
Alt unavailable annotation. If no displayed row has Alternative, the switch remains visible,
disabled and off. Requested selection survives a temporarily unsupported theme/preset.
Standard and Deep remain independent profile groups; the Alt choice never substitutes one profile
for another. All four emphasis columns continue to use preset Text profiles and foreground recipes.
