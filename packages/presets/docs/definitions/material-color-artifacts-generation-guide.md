# Material Color Artifact Generation

`packages/presets/src/tools/generate-material-color-artifacts.ts` generates Material-derived
primitive ramps directly in the canonical Kiskadee tonal contract.

## Contract

- Every generated Light or Dark file exports a complete `KiskadeeHexScale`.
- Values are lowercase six-digit HEX.
- Light runs from white at tone `0` to black at tone `100`.
- Dark runs from black at tone `0` to white at tone `100`.
- The generator writes only positions from `KISKADEE_TONES`.
- `color.layers.ts` wraps each pair as a static primitive asset with `scales.light` and
  `scales.dark`.

The generator does not emit the removed HSLA or `subtle`/`vivid` primitive representation.

## Inputs and output

```ts
generateMaterialColorArtifacts({
  primaryHex,
  secondaryHex,
  tertiaryHex,
  mode,
  outDir
});
```

`primaryHex` is required. Optional secondary and tertiary seeds add supporting primitive variants.
The supported Material modes are `static` and `static-content`.

The command writes:

```text
colors/<family>.<version>.light.ts
colors/<family>.<version>.dark.ts
color.layers.ts
```

Generated family names still follow the current preset taxonomy. Migrating official preset
families to the Munsell-based tonal-system IDs is a separate, source-evidenced preset review.

## Ownership

Material utilities provide source palette samples. The generator projects those samples onto the
Kiskadee grid, while `@kiskadee/core` owns scale shape and validation. The script is preset tooling;
it does not replace the algorithm owned by `@kiskadee/tonal-scale`.
