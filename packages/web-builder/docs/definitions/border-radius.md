# Border Radius

Kiskadee separates radius mode, the base shape, from radius effect, stateful animated corners. This
keeps the base geometry cross-platform and allows effects to be opt-in.

## Radius modes

`radius` is a component prop that accepts:

- `rounded` (default): uses `scales.borderRadius.rounded`.
- `square`: uses `scales.borderRadius.square`.
- `pill`: uses `scales.borderRadius.pill`.

The default mode comes from `schema.global.radius` and is exported in the build artifact
`global.kiskadee.json`.

Components may define an intrinsic default radius when their official shape should not follow
`schema.global.radius`. In that case, the component default is exported through the component
metadata artifact, such as `components/switch.kiskadee.json`.

Runtime resolution order is:

1. the component instance `radius` prop;
2. the component default radius, when present;
3. `schema.global.radius`;
4. the renderer fallback.

Do not add a public `global` radius value. Omitting the prop is the canonical way to use the
resolved default.

All three modes are explicit in the schema, so the web-builder emits concrete classes for each mode
with no runtime hacks like `9999px`.

## Radius effects

`radiusEffect` is a boolean prop that enables the effects bucket generated from
`effects.borderRadius`:

- `rounded` uses `effects.borderRadius.rounded`.
- `pill` uses `effects.borderRadius.pill`.
- `square` ignores the radius effect.

This is intentional: effects are opt-in and never applied by default, even if the mode is `rounded`
or `pill`.

## Cross-platform rule

- Base geometry is resolved by the renderer per platform using the schema values for each mode.
- Effects are always opt-in via `radiusEffect`, regardless of platform.
