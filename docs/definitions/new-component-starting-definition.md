# New Component Starting Definition

Status: living definition.

Use this document before starting a new Kiskadee component. Its purpose is to keep the first
implementation focused, reviewable, and easy to tune. Add to this definition whenever a new
component teaches us a durable rule.

## Goal

A new component should start with the smallest honest contract that can represent the intended
component well. Early implementation work should favor visual fidelity, artifact correctness, and
clear schema shape over broad option coverage.

## Required Starting Decisions

Before implementation starts, decide and record:

- whether the component is truly new or should be a variant of an existing component;
- the canonical component name;
- the initial variant and mode names;
- the element map and each element's meaning;
- which themes are in scope;
- which sizes are in scope;
- whether radius modes are in scope;
- which interaction and control states are required for the first usable version;
- which preset is the visual reference for the first implementation;
- which showcase scenarios are required for validation.

## Theme Scope

Start new components with light theme only unless the task explicitly requires dark theme.

Rationale:

- A brand-new component usually needs fine visual tuning more than broad theme coverage.
- Light-only schema keeps the first preset less noisy and easier to review.
- Dark theme can be added later once the component's structure, state model, and generated artifacts
  are stable.

Do not add dark palettes mechanically. Add dark theme only when there is a clear reference, a real
consumer need, and enough confidence that the component's element map will not immediately change.

## Size Scope

Do not assume every new component needs small, medium, and large sizes.

Before adding size scales, decide whether:

- medium alone is enough for the first implementation;
- small is required by the design-system reference or by a real compact UI use case;
- large is required by the reference or by a real prominent UI use case;
- adding multiple sizes would create useful coverage or just multiply tuning work.

If the answer is unclear, start with medium and document the deferred size question.

## Radius Scope

Do not assume every new component needs `rounded`, `pill`, and `square`.

Before adding radius modes, decide whether:

- the design-system reference actually supports radius variation;
- the component can change radius without breaking its meaning or geometry;
- square mode is visually and structurally valid;
- pill mode is a meaningful option or simply identical to rounded for that component.

If radius variation is not an intentional part of the component, keep a single radius behavior and
document why the extra modes were deferred.

## Variant Scope

Define variant names before implementation, not after the DOM and schema already exist.

For each variant, document:

- the variant name;
- the mode name or names under that variant;
- which elements exist;
- what each element means;
- how those element names stay coherent with other variants;
- whether the variant changes only visuals or also changes structure.

Element names should remain semantically coherent across variants. For example, if `e3` is the
track in one Switch variant, another Switch variant should not use `e3` for unrelated content.

If a proposed variant needs a very different structure or a different element vocabulary, consider a
new component instead of a variant. Examples:

- `checkbox` should not be forced into `switch`;
- `navbar` should not be forced into `tabs`.

Variants should share enough component identity that a user can understand them as the same public
component with different presentations.

## Element Map

Every new component must define a canonical element map before schema authoring starts.

For each element, document:

- its short key, such as `e1`, `e2`, or `e3`;
- its semantic role;
- whether it is required or optional;
- whether it owns layout, generated visuals, text, native semantics, or state projection;
- which generated properties it is allowed to consume.

Avoid adding placeholder elements just because a future design might need them. Optional elements
are useful only when their expected purpose is already clear.

## State Model

Define the state model explicitly.

At minimum, decide which of these states are required:

- `rest`;
- `hover`;
- `pressed`;
- `focus`;
- `disabled`;
- `readOnly`;
- `selected`;
- `filled`.

For persistent binary controls, prefer the existing `selected` control state for checked/on visuals.
Do not encode persistent state as `pressed`; pressed is an interaction state.

## Preset Scope

Use one reference preset as the first fidelity target.

The first preset should establish:

- the element map;
- the state coverage;
- the minimum scale/radius scope;
- the generated artifact shape;
- the showcase scenarios.

Additional presets should be added after the first preset has been validated end to end.

## Showcase Validation

A new component is not ready just because schema and runtime compile.

The first showcase pass should include the smallest set of scenarios needed to verify the contract:

- default interactive state;
- core visual states;
- disabled state;
- selected/checked state when relevant;
- selected-disabled state when relevant;
- label or text cases when the component supports visible text;
- no-visible-label or accessibility-only cases when relevant;
- size and radius controls only if those options are intentionally supported.

If a scenario reveals a schema or builder limitation, fix the actual contract or record a technical
debt item. Avoid hiding the limitation with local showcase CSS.

## Documentation Updates

When a new component changes a durable rule, update this document.

Use component-specific docs for local details, but promote repeated lessons here so the next
component starts from a clearer recipe.
