# Color Fidelity Rounding

Some presets may show tiny numeric differences when comparing colors between
Figma and Kiskadee. This usually happens after alpha compositing, such as
disabled states, where different rounding strategies in the conversion pipeline
can yield a 1-point RGB delta.

Example: a base tone that matches perfectly, such as `#1C1B20`, can produce
`#E8E8E8` in Kiskadee versus `#E9E9E9` in Figma at 38% opacity over white
(232 vs 233). This is visually indistinguishable and considered acceptable
across all presets.

Decision: Kiskadee treats 1-point RGB deltas caused by rounding as normal and
does not attempt to force-match Figma's internal rounding.
