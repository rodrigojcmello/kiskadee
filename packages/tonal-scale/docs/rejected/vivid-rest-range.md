# Rejected: Restricting Rest To The Vivid Contrast Range

Status: rejected by the canonical tonal-system contract.

## Previous Rule

The first tonal-system draft named its shared functional checkpoint
`vividRest` and limited it to public positions 35 through 95. This reused the
low-level ranges whose colors satisfy the 3:1 expressive contrast guard:

- L35-L95 against white;
- D35-D95 against black.

An exact primary whose natural anchor fell outside that interval was rejected,
even when its low-level scale was otherwise valid.

## Why It Was Rejected

The rule conflated three independent properties:

- chromatic vividness;
- physical lightness;
- contrast against one predetermined cap color.

Twitter Blue `#1da1f2` demonstrates the problem. It is a highly chromatic,
recognizable primary used on buttons and bars, but its exact Light anchor is
L24. The generated Light and Dark scales are valid, monotonic, unique, and
preserve the source at L24 and D70. Rejecting L24 therefore constrained brand
identity without protecting a low-level scale invariant.

Contrast also belongs to a foreground/background pair. `#1da1f2` has about
2.83:1 contrast against white and 7.43:1 against black. That information should
guide semantic foreground selection; it should not decide whether the color is
allowed to define the primitive system's shared rest position.

## Canonical Replacement

The shared checkpoint is named `rest` and accepts every chromatic public
position from 1 through 99. Positions 0 and 100 remain absolute caps and cannot
be selected as rest.

The low-level 3:1 guards and their diagnostics remain unchanged. Primary
reference diagnostics expose contrast against white and black. No Balanced
scale output, public grid position, or low-level contrast invariant changes as
part of this decision.
