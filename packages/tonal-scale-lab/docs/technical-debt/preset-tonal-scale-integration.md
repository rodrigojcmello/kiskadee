# Preset Tonal Scale Integration

This proposal tracks how tonal-scale-lab output should eventually feed official
presets.

## Direction

`packages/tonal-scale-lab` should own experimental and generated tonal-scale
recipes. Presets should consume frozen generated color artifacts rather than
manually maintained scale fragments.

The stable preset contract should be:

- a named tonal profile;
- a scale distribution;
- named tonal anchors;
- state mappings derived from those anchors;
- explicit overrides only where a design system requires exceptions.

## Kiskadee Slots

`K<n>` names a Kiskadee tonal slot, not a color family.

The current official distribution is:

```txt
0..10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100
```

`K0` and `K100` are absolute caps. Intermediate `K<n>` slots are generated
chromatic positions.

## Anchors And State Mapping

Prefer role-based anchors such as `vividRest` instead of family-specific names
such as `primaryVivid`.

The current working vivid rest anchor is:

```txt
vividRest = K55
```

That is a state-mapping default, not a universal generation pivot. A tonal
profile can prove another slot is a better vivid rest point and then update the
anchor once.

The current vivid state recipe is:

```txt
rest    = vividRest
hover   = vividRest + 5
focus   = vividRest
pressed = vividRest + 10
```

Subtle state mapping should stay explicit because the first light slots are
visually sensitive:

```txt
rest    = K1
hover   = K2
focus   = K2
pressed = K3
```

## Open Decisions

- Whether the lab remains an internal app or also exposes a reusable generation
  package/script for presets.
- Whether generated output metadata should include HSLA only or also source
  color, anchors, contrast status, and profile metadata.
- Whether anchors belong in core schema types or remain local preset/lab helper
  definitions first.
- What override scope should be allowed for a preset: family-level,
  component-level, or state-level.
- Whether Material Google should preserve its official generator or adopt the
  Kiskadee anchor model.
