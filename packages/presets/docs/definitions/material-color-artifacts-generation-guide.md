# Material Color Artifact Generation

This script is the source of truth for generating material-based color files used by
presets in this package. It builds Material tonal ramps, converts them into the
`HSLA` shape expected by the runtime, and writes the artifacts consumed by the
generated schemas.

The generator in use is:

- [`packages/presets/src/tools/generate-material-color-artifacts.ts`](../../src/tools/generate-material-color-artifacts.ts)

## Inputs

The public entry point is:

```ts
generateMaterialColorArtifacts({
  primaryHex,              // required
  mode,                    // optional
  secondaryHex,            // optional
  tertiaryHex              // optional
});
```

- `primaryHex` is the seed.
- `secondaryHex` and `tertiaryHex` optionally provide different source seeds for
  the secondary and tertiary palettes.
- `mode` chooses the algorithm family (`static`, `dynamic`, `dynamic-content`,
  `dynamic-vibrant`, etc.).
- By default, if `secondaryHex` is not provided, the generator emits single-version
  output (keeps only `a1`, `a3`, `n1`, and `error`).
- When `secondaryHex` is provided, the generator emits additional accent and neutral
  slots as part of the multi-version output.

## How the generator resolves palettes

1. The input seeds are normalized (`normalizeHex`).
2. A `MaterialPaletteSet` is built:
   - `static` and `static-content` use `CorePalette` (`of` / `contentOf`);
   - dynamic modes use one of the Material `Scheme*` classes.
3. The destination `colors` directory is removed and recreated.
4. Accent palettes (`a1`, `a2`, `a3`) are processed first.
   - The hue for each palette is inferred from tone `60` (`resolveHueNameFromPalette`).
   - A version (`v1`, `v2`, `v3`, `v4`) is assigned per hue.
   - The same hue can therefore become `v1`, `v2`, etc. as needed.
   - In single-version mode, accent palettes stay on `v1` for the same hue and
     duplicate writes are skipped.
   - In multi-version mode (`secondaryHex` provided), all accent palettes are emitted.
5. Neutral and error palettes are written:
   - `n1` → `black.v1`
   - `n2` → `black.v2` when multi-version output is enabled
   - `error` → `red.v1`
6. `color.layers.ts` is emitted to map global semantics to imported primitive
   ramps.

## Tones and file output

For each palette+version, two files are written:

- `.../<hue>.<version>.light.ts`
- `.../<hue>.<version>.dark.ts`

Each file exports an `EmphasisLevel` with:

- `subtle`: tones `0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,20,25,30` plus explicit
  endpoints
- `vivid`: tones `35,40,45,50,55,60,65,70,75,80,85,90,95,100` plus explicit
  endpoints

In light files, tones are emitted as inverted material tones (higher source tone =
lighter visual value); dark files keep direct tone mapping through the same palette
function.

## Files written by the run

- `colors/<hue>.<version>.light.ts`
- `colors/<hue>.<version>.dark.ts`
- `color.layers.ts`

`color.layers.ts` contains:

- imports for every emitted hue/version pair
- `primitiveColors` object
- `globalSemantics` with `primary`, `neutral`, `purpleLike`, and `redLike` mappings

When single-version behavior is enabled, primary and neutral keep only `v1`; in
multi-version behavior they expose both `v1`/`v2` where applicable.

## Practical usage

The script is executed as a direct generation script in the repository workflow:

1. Edit the invocation block near the end of the file.
2. Run the script with your TypeScript execution setup.
3. Check the `colors` directory + `color.layers.ts` under the preset package after
   each run.

Tip: because the generator clears `colors`, run from a clean git state so you can
inspect only the generated diff for that preset seed/mode combination.

## Why this matters for preset cleanup work

When a preset has direct `hex` references that should be replaced by tone tokens,
this script is the reference point to identify valid generated ramps:
- pick the palette roles expected by the preset (`primary`, `neutral`, `error`, etc.),
- confirm which `hue.version` entries were emitted for that preset seed/mode,
- use those tokens (`primitive.<hue>.<version>`) instead of loose hex literals.
