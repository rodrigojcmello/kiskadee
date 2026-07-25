# Rejected: Achromatic Whole-Curve Surface-Distance Alignment

Status: rejected after visual evaluation in generator `0.3.2`.

## Proposal

`kiskadee-achromatic-surface-distance-v1` moved non-protected Black positions
away from the physical theme surface until their Delta E OK approximated the
median distance of the canonical chromatic families at the same public tone.
It changed only lightness, preserved hue/chroma, caps, and the generated seed
anchor, and revalidated all low-level scale invariants.

## Why It Was Rejected

The transform addressed a real observation with the wrong abstraction. A
low-chroma Black can appear less prominent than chromatic colors at a shared
functional position because chroma contributes visual salience while Black
expresses its identity mostly through low lightness. Moving the complete Black
curve produced a measurable change, but the evaluated component state remained
visually too weak. Increasing the transform further would distort a canonical,
otherwise valid achromatic scale to solve one semantic usage.

The harmony-rest checkpoint is evidence for comparing families; it is not a
requirement that every family use the same slot for a component's Rest state.
Yellow already demonstrates the inverse case: its useful functional anchor can
be physically lighter than the shared harmony rest. Black may likewise require
a physically darker state anchor without requiring a different curve.

## Adopted Direction

Generator `0.3.3` removed this transform completely. Under formats V3 and V4,
`n.black.*` once again matched `generateKiskadeeScale()` byte for byte. The
authoring recipe instead supported sparse state-anchor rules per family and
theme:

- `auto`;
- `generated-anchor`;
- `harmony-rest`;
- `locked` to a non-cap public tone.

These rules choose an existing color from the emitted scale. They never alter
scale generation, harmony, gamut, monotonicity, contrast, continuity, or the
low-level goldens. This keeps tonal mathematics canonical while allowing a
Design System to state explicitly that Black Rest is darker, Yellow Rest is
lighter, or Light and Dark use different functional positions.

Format V4 preserves this decision but replaces the ambiguous state-anchor name
with the explicit vivid reference and adds a separate surface-relative subtle
reference. Both remain pointers into the unchanged emitted scale.

## Why The V5 Neutral Trajectory Is Different

Format V5 does not restore surface-distance alignment.

The rejected transform inferred a lightness correction from other chromatic
families at the same public tone. Its purpose was to make Black appear equally
prominent in one semantic/component use. It moved many scale lightnesses even
though the authored Black identity was already valid.

The V5 contract instead separates two primitive identities:

- `n.black.v1` is an immutable zero-chroma gray scale;
- `n.black.v2` through `n.black.v4` are optional authored neutral variants,
  each with its own explicit seed.

A seeded neutral trajectory uses the effective seed only to preserve that
variant's low-chroma identity. It shapes chroma around a seed-derived plateau
while preserving the canonical lightness inputs and hue, exact caps, and exact
seed anchor. Gamut fitting may reduce chroma, and deterministic revalidation
may restore only the minimum needed for caps, anchor, monotonicity, uniqueness,
contrast, gamut, and continuity. It does not compare the family with chromatic
surface distance and does not move lightness to fix component salience.

Functional vivid and subtle references remain the mechanism for choosing which
existing neutral position a component starts from. Primitive neutral identity
and semantic state prominence therefore stay separate concerns.
