# Fluent 2 Kiskadee Source Evidence

This preset is a Kiskadee-owned extension of Fluent 2. Source evidence for the upstream design
system is maintained in
[`../fluent-2-microsoft/source-evidence.md`](../fluent-2-microsoft/source-evidence.md).

## Interface Icon Decision

The preset recommends `fluent-system.regular`, matching the upstream Fluent family and variant
used by the Microsoft preset. This is a **Kiskadee extension** because the preset itself is not an
official Microsoft distribution, while the selected icon family remains Microsoft's official
open-source Fluent UI System Icons collection.

## Typography Decision

The preset keeps its existing 12/16, 14/20, and 16/22 weight-500 Button recipes, normalized as
`label-small`, `label-medium`, and `label-large`. This is a **Kiskadee extension**, not a claim that
the Kiskadee-owned preset reproduces the complete official Fluent Web ramp. Its typography review
remains separate from the source-backed Fluent 2 Microsoft catalog.

## Kiskadee density adaptation

Density selection is a **Kiskadee extension**, not an upstream operating-system rule. The preset
reuses its existing fixed recipes through a global compact/spacious mapping and explicit component
exceptions. A single-density component keeps its medium reference; no unsupported recipe is
synthesized. Explicit public `size` selections remain independent of viewport width. See the
[adaptive density contract](../../../../../docs/definitions/adaptive-density.md).

## Optional Button shadow (2026-10-03)

Status: **Kiskadee extension**. The preset now publishes the inspected Fluent Shadow 02 and
Shadow 04 geometries as global outer `s:sm:1` and `s:md:1`, preserving both layers. Source geometry
and alpha are recorded in the [upstream catalog evidence](../fluent-2-microsoft/source-evidence.md#shadow-scale).
Paint uses the preset's existing `primitive.black.v1` physical dark endpoint, resolved by its
legacy getter at L100. No new literal color or primitive asset is introduced.

Button selects small at Rest and medium at Hover, and explicitly removes elevation for Pressed,
Pending and Disabled. This compact action recipe replaces the previous local single-layer
geometry; it is not claimed as an official Fluent Button appearance. Focus and Selected add no
shadow delta. Focus indication stays independent, allowing Hover elevation and the external ring
to coexist. Pending removal is an intentional Kiskadee terminal-state adaptation. The recipe is
shared across all published Button segments, themes and appearances.
