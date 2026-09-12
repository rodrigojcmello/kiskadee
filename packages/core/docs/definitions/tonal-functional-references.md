# Tonal Functional References

Static tonal assets expose theme-specific `subtle`, `medium`, and `vivid`
positions. `medium` is the ordinal midpoint between subtle and vivid in
`KISKADEE_TONES`, rounding toward subtle. It is not an arithmetic average of
tone labels or a chroma maximum. All references use the same grid-offset resolver.

Legacy assets may omit medium so existing standalone and published assets remain
valid. Resolving an absent medium fails explicitly; Core does not silently derive
or substitute it. Newly exported multifamily preset assets include all three
positions. The validator checks an explicit medium against the midpoint and the
emitted scale. No HEX values are changed by reference resolution.
