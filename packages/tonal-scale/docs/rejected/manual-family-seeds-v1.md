# Superseded: Manual Family Seeds v1

Status: superseded by the primary-derived Munsell tonal system.

The first tonal-system contract required authors to provide a seed for every
primitive family. The primary supplied only the shared rest fingerprint; it did
not generate companion hues, validate family identity, or require a complete
color circle.

That model was deterministic and remains useful as an internal resolution
stage, but it was rejected as the authoring contract because custom Design
Systems would repeatedly inherit the same manually curated red, yellow, green,
and other supporting colors.

The replacement accepts one exact primary plus optional overrides, derives the
complete Munsell family set, and materializes concrete seeds before composing
the unchanged low-level tonal-scale generator.

There is no automatic artifact migration. Former names such as `orange`,
`teal`, `cyan`, `pink`, and `brown` do not map one-to-one onto the new family
and variant ids.
