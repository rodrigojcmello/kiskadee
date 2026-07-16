---
name: kiskadee-author-interaction-states
description: Author and review Kiskadee component interaction states as sparse visual deltas over Rest. Use whenever editing or reviewing preset component palettes, stateful effects, or schema maps containing rest, hover, pressed, focus, selected, disabled, readOnly, or filled; translating Figma or official design-system state matrices; or diagnosing duplicate state values, focus-ring ownership, and overlapping state precedence.
---

# Author Kiskadee Interaction States

Keep component state schemas semantically sparse. Declare a state only when the affected property
changes from Rest or when an intentional compound-state precedence rule requires an override.

## Sources Of Truth

Read before editing:

- `packages/web-builder/docs/definitions/interaction-state-model.md` for state ownership,
  projection, inline keys, and reference keys;
- `CROSS-COMPONENT-RULES.md` for shared focus language;
- the relevant component contract and generated class-map path;
- `skills/kiskadee-preset-evidence/SKILL.md` for official presets;
- `skills/kiskadee-resolve-preset-colors/SKILL.md` when the state changes color.

## Core Rules

- Treat Rest as the base visual rule carried by the element.
- Treat omitted states as no visual delta for that property. The Web Builder skips undefined state
  values and the Rest CSS remains active.
- Do not equate an omitted visual delta with an unavailable interaction. In Button Showcase
  capability views, only `hover`, `pressed`, and `selected` may show the unavailable-state
  indicator; Rest-derived or required states such as `focus` and `disabled` still render.
- Do not write `focus: restValue`, `hover: restValue`, or another duplicate merely to complete a
  state matrix.
- Keep an explicit state when its resolved value differs from Rest.
- Keep an explicit Rest-equal state only when it intentionally resets another simultaneously active
  state. Document the compound-state precedence and verify the generated selector order.
- Treat `focus` in palettes and effects as a component-owned visual delta. Focus existence,
  accessibility, and an external focus ring are separate contracts.
- Do not remove `focus` from Core state types or component status APIs just because one preset has
  no focus-specific surface.
- Use `{ ref: ... }` when a child reacts to state owned by its component scope ancestor. Omission
  still means the child keeps its Rest property.

## Workflow

1. Inspect the official source and the existing component evidence.
2. Identify the state scope owner and every affected element/property.
3. Compare resolved values per segment, theme, intent, emphasis, and selected substate.
4. Remove a state entry when its final value equals Rest and no documented precedence reset exists.
5. Check compound states explicitly:
   - Hover plus Pressed: Hover must not compete with active.
   - Hover plus focus-visible: prefer Hover plus focus ring unless the source documents a surface
     reset.
   - Selected plus Hover, Pressed, or Focus: author only documented selected substates.
   - Disabled: prevent native or projected interactions from leaking through.
6. Keep the focus ring or component-owned focus indicator in its proper global/structural contract.
7. Update component evidence with every retained exception and its source or Kiskadee adaptation.

## Helper Authoring

Do not materialize fallback states in factories:

```ts
// Avoid: emits a redundant Focus rule when focus is absent.
focus: colors.focus ?? colors.rest

// Prefer: omit Focus unless the caller authored a delta.
...(colors.focus !== undefined ? { focus: colors.focus } : {})
```

Apply the same rule to transparent colors, borders, shadows, radius, and other stateful properties.
Equality means the final resolved value, not merely different variable names that produce the same
output.

## Validation

1. Search the touched schema for state declarations and justify every Rest-equal exception:

```sh
rg -n "rest:|hover:|pressed:|focus:|disabled:|readOnly:|filled:" <schema-path>
```

2. After generating the preset, audit resolved palette values. The command fails when the requested
   state resolves to the same value as Rest:

```sh
node skills/kiskadee-author-interaction-states/scripts/audit-palette-state-deltas.mjs \
  packages/web-builder/build/<preset>/schema.json <component> <state>
```

   A reported Rest-equal state may remain only as a documented compound-state precedence reset.
3. Inspect the generated component class map and CSS. Confirm omitted states do not emit duplicate
   classes and Rest remains present.
4. Validate isolated and compound visual states, including focus ring on/off and Hover plus Focus.
5. Run `git diff --check` and the narrowest relevant build. For preset schema changes, normally run:

```sh
pnpm --filter @kiskadee/web-builder build
```

Do not add or modify unit tests unless the user explicitly requests them.

## Handoff

Report which redundant states were removed, which explicit states remain, why each exception exists,
the chosen compound-state behavior, the evidence document updated, and the validation performed.
