# Surface Builder

Generate the portable Surface Context data with:

```sh
pnpm --filter @kiskadee/surface-builder build
```

The build command runs the first-party preset tonal origin check before writing. To run that check alone, use `pnpm check:preset-colors`.

The Node pre-build writes `generated/surface-contexts.json` in the directory of each authored
preset. For example, the [Fluent companion](../presets/src/presets/fluent-2-microsoft/generated/surface-contexts.json)
is checked in alongside the Fluent schema and distributed with it. After updating a preset or
its derivation, run the command above and include the generated changes in the same commit.
To compare all companions byte for byte with fresh derivations without rewriting them, run:

```sh
pnpm --filter @kiskadee/surface-builder check
```

Each file contains `formatVersion: 2`, the preset key and version, and a deterministic SHA-256
revision of its authored Schema. Its readable element maps are a platform-independent build
input. Readers check identity, format, region coverage and exact regeneration before publishing.

## Derivation

The component's existing anatomy identifies which elements paint behind independent descendants.
The compiler walks the available segments, themes, variants, modes, color variants, intents,
emphases and stable states. Rest is required; changed Selected, Pending and Disabled outputs
are sparse. The runtime selects the effective painted coordinate (including component-specific
selection projections). Hover, Focus and Pressed do not select another descendant map.

- Missing paint and fully transparent paint produce `inherit`.
- An opaque fill is classified immediately. Partial alpha uses the known local parent paint,
  then the opaque Container catalog reference for its input context. The root neutral canvas in
  presets without Container may come from the explicit same-segment/theme background token.
- The reference for contrast is white in Light and black in Dark/Darker. A ratio of at least
  3:1 produces `onVivid`. Lower ratios produce `onSubtle`. This threshold classifies surfaces;
  glyph and text legibility require their own checks.
- Absent backdrops, runtime colors and gradients without a provable uniform classification
  generate diagnostics with the recipe coordinate. These coordinates retain the legacy output
  or inheritance. A uniform fill or an opaque achromatic gradient entirely on one side of the
  cutoff can be classified. A gradient with varying RGB never supplies a fabricated RGB to a
  translucent child.
- Container publishes its calculated Rest to its catalog and linked Card. CardAction classifies
  its effective stable states after resolving the Container contribution. Older authoring maps
  are accepted as fallback for indeterminate paints.

## Region handoff

At the component root, variant or variant/mode branch, `regions.<element>.output` contains the
standard semantic map. For example, Chip `e2` and `e5` each publish their own result to the
primary action and Remove. Materialization for existing build consumers exposes their compatible
primary and TextField mode maps without duplicating those fields in the portable file.

Nested layers can have the same parent semantic category but different underlying RGB. The base
map assumes the canonical host. When a real local composition gives a different result, the
region also publishes `against[parentCoordinate]`. The key is the JSON tuple of the parent's
consumed context, color variant, effective intent, effective emphasis and stable state. For each
child coordinate present in this override, use its entire state leaf; otherwise use `output`.
The active segment, theme and branch are supplied by the enclosing component. TextField Start
and End select their emphases independently against their control. Select and thumb layers
retain their host-relative paint recipes while compositing over the local painted parent.

The [Web resource publisher](../web-builder/docs/definitions/component-resources.md#palette-surface-configuration)
reads this file with the preset and emits the selected portions in compact palette descriptors.
Native exporters can use the same portable data. The file is a build input for platform publishers.
