# Tonal Anchors And State Mapping

This document defines how Kiskadee should connect generated tonal scales to component state colors.

The goal is to keep component schemas stable when a color family changes. A preset should be able to
replace blue with red, orange, green, or another generated scale without rewriting every `rest`,
`hover`, `focus`, and `pressed` token reference.

## K Slots

`K<n>` names a Kiskadee tonal slot.

- `K0` is the absolute light cap of the scale.
- `K100` is the absolute dark cap of the scale.
- Intermediate values such as `K1`, `K30`, `K55`, and `K95` are normalized public positions in the
  generated chromatic family.

The `K` prefix is only slot language. It does not mean primary, green, red, brand, or any other
semantic color family by itself.

## Tonal Anchors

A tonal anchor is a named tonal role, not a named color family.

Prefer role-based anchors such as:

```ts
tonalAnchors: {
  vividRest: 55,
  subtleRest: 1
}
```

Avoid layer- or hue-specific anchors such as:

```ts
tonalAnchors: {
  primaryVivid: 55,
  greenLikeVivid: 55,
  redLikeVivid: 55
}
```

The second shape ties the tonal contract to semantic color names. That is fragile because a semantic
color family can be remapped to a different hue. For example, a `greenLike` semantic could receive an
orange source color. The tonal role should still be `vividRest`; the hue family is a separate
decision.

## Default Vivid Anchor

The current working default is:

```ts
vividRest = K55
```

`K55` is a default rest anchor for vivid color usage. It should not be treated as a universal law.
If a tonal profile or design-system reference proves that `K45`, `K50`, or another slot is the
better vivid rest point, the preset can change the default anchor once and let the state recipe move
with it.

This is different from hardcoding every component state to fixed slots throughout the schema.

## State Mapping

State mapping is the recipe that turns a tonal anchor into interaction-state slots.

For vivid colors, the preferred model is a small fixed delta recipe:

```ts
vividStateMapping: {
  rest: 0,
  hover: 5,
  focus: 0,
  pressed: 10
}
```

With `vividRest = K55`, this resolves to:

```ts
vivid: {
  rest: K55,
  hover: K60,
  focus: K55,
  pressed: K65
}
```

The recipe should stay deliberately small. The lab can expose flexible controls while exploring, but
a production preset should not make state colors depend on open-ended per-color tuning. Use `+5` and
`+10` style deltas before inventing a more configurable model.

## Subtle State Slots

Subtle colors should usually use explicit slots instead of arithmetic deltas.

The subtle range is visually sensitive and the first slots are close together. It is more useful to
declare the intended states directly:

```ts
subtle: {
  rest: K1,
  hover: K2,
  focus: K2,
  pressed: K3
}
```

This keeps subtle surfaces predictable and avoids hiding weak tonal separation behind a formula.
Tonal profiles must still make the first subtle slots visually distinguishable; otherwise the schema
can be stable while the generated scale still feels like a vague light gradient.

## Overrides

The default rule is role-based and global:

- every vivid color family uses the same vivid anchor;
- every vivid interaction recipe derives from that anchor;
- every subtle color family uses the same explicit subtle slots.

Overrides are allowed, but they should be explicit exceptions.

Use an inline or per-color override when a specific generated family cannot preserve the intended
visual behavior through the default anchor. For example, a luminous color may need its vivid rest
anchor moved from `K55` to `K45` or `K40`.

Do not create one default anchor per Layer 1, Layer 2, or Layer 3 color name. That makes the system
look more precise while weakening the real guarantee: replacing a color family should keep the same
tonal state contract unless the author intentionally opts out.

## Relationship To Tonal Profiles

Tonal profiles generate the colors that live at each `K<n>` slot. Tonal anchors and state mapping
decide which slots component states use.

This means:

- changing the input color should not require rewriting component state mappings;
- changing a tonal profile is more serious because it can change what each `K<n>` visually means;
- if a tonal profile changes the visual meaning of vivid rest, update the global vivid anchor instead
  of manually updating every component state;
- lab-only controls such as saturation or gamma sliders are discovery tools, not a stable schema
  contract by themselves.

The stable preset contract should be a named tonal profile plus named tonal anchors and state
mappings. The lab can remain flexible; shipped presets should be explicit.
