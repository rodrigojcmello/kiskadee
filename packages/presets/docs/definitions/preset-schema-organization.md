# Preset Schema Organization

Preset root schema files should describe the design system as a whole and compose component-specific
schema factories.

Use this layout once a preset has more than a trivial single-component definition:

```text
src/presets/<preset>/
  <preset>.schema.ts
  components/
    button.schema.ts
    switch.schema.ts
    text-field.schema.ts
```

The root `<preset>.schema.ts` owns:

- preset metadata such as `name`, `prefix`, `version`, and `author`;
- global schema values such as fonts, radius, focus, and theme tokens;
- shared preset helpers such as segment names, color getters, and transparent/white constants;
- the `components` map that calls `create<Preset><Component>Schema(...)` factories.

Each `components/<component>.schema.ts` owns:

- the full schema for that component;
- local component helpers and constants;
- component-specific adaptation notes that are too narrow for the root preset file.

Keep cross-component preset decisions in the root file or a package-local docs definition. Keep
component geometry, palettes, and element maps near the component factory that owns them.

Material Design 3 is the reference implementation for this pattern. Smaller or legacy presets may
still be monolithic, but new work should prefer the split before the root schema becomes difficult to
review.

## Numeric Values

Use the simplest schema shape that preserves meaning:

- If a value is identical for every scale or mode, use the scalar value directly.
- If a value changes by scale, use the scale map.
- Do not repeat the same value across every size just to match nearby scale-mapped properties.

Example:

```ts
borderWidth: 0
```

Prefer exact cross-platform geometry over web-only shortcuts. A large radius such as `999` is a CSS
pill hack, not a portable schema value. When a component has known dimensions, express pill radius as
the exact half-height for each size. Reserve `rounded` for a modest fixed rounding when there is no
official platform value, and choose the smallest value that preserves a visibly rounded but
non-pill shape for that preset's geometry.
