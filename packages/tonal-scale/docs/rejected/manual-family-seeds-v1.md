# Superseded: Manual Family Seeds v1

Status: rejected as an authoring contract; fixed references remain useful as an
internal harmony baseline.

The first tonal-system contract required authors to provide a seed for every
primitive family. The primary supplied only the shared rest fingerprint; it did
not generate companion hues, validate family identity, or require a complete
color circle.

That model was deterministic and remains useful as an internal resolution
stage, but it was rejected as the authoring contract because custom Design
Systems would repeatedly inherit the same manually curated red, yellow, green,
and other supporting colors.

The current authoring contract accepts one exact primary plus optional
overrides. During harmony calibration, the runtime materializes the complete
Munsell set from controlled fixed references instead of asking authors for all
twelve seeds. Primary-derived companion generation is deferred separately in
[`primary-derived-family-seeds.md`](../proposals/primary-derived-family-seeds.md).

There is no automatic artifact migration. Former names such as `orange`,
`teal`, `cyan`, `pink`, and `brown` do not map one-to-one onto the new family
and variant ids.
