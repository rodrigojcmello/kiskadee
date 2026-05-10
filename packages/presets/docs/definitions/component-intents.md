# Component Intents

Component intents describe public semantic alternatives for a component. They
should not be used as names for internal color roles inside a single semantic
presentation.

## Default Public Component Baseline

When a public component exposes a standard, non-specialized presentation,
Kiskadee treats that baseline as:

- `intent: neutral`
- `emphasis: medium`

Preset authoring rules:

- If the preset only defines one emphasis for a component, use `medium`.
- Introduce `high` only when the same component truly needs a more emphatic
  version.
- Use `low` and `lowest` only when there is a recurring, justified use case.
- If a component cannot reasonably expose `neutral.medium`, document that as an
  explicit exception in the preset instead of silently choosing another
  baseline.

Short rule: the default public face of a component should be `neutral.medium`,
and stronger or weaker emphases are extensions of that baseline.

## Component Intent vs. Control State

For binary controls such as Switch, checked/on and unchecked/off are control
states of the same component intent. If the component exposes only one public
semantic presentation, that presentation should remain `neutral.medium`, even
when the selected/on state uses the system `primary` color as the activation
color.

Authoring rule:

- Keep `componentIntents.<component>.neutral` mapped to `neutral` for the
  default public face.
- Do not add `primary` as a component intent only because a selected/on state
  uses the global `primary` semantic color.
- Use Layer 2 `primary` directly in the selected/on palette when it is the
  global activation color inside the same `neutral.medium` presentation.
- Add another component intent only when users can choose a genuinely different
  semantic variant of the whole component, not just because one state within the
  component needs a different color.

Example:

```ts
componentIntents: {
  switch: {
    neutral: 'neutral'
  }
}

// In the Switch neutral.medium palette:
// - off/rest/disabled neutral surfaces use switch.neutral
// - selected/on activation can use primary from Layer 2
```

If a component repeatedly needs named internal color roles, model that as a
dedicated component contract later. Do not overload Layer 3 component intents to
mean internal state color roles.

## Layer 3: Component Intents

The intent layer provides context-specific meaning for each component. This is
where the same semantic color can have different purposes depending on the
component.

Layer 3 names public component intents, not every color role that can appear
inside the component. A component may compose Layer 2 global semantics inside
one intent when the color represents a control state, activation treatment,
surface role, or structural role rather than a user-selectable semantic variant.

```typescript
// Button intents
type ButtonIntent = 'primary' | 'neutral' | 'destructive' | 'positive';

// Badge intents
type BadgeIntent = 'primary' | 'neutral' | 'attention' | 'new';

// Avatar status
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
```

## Why Different Intents Per Component?

The same color means different things in different contexts:

| Color | Button | Badge | Avatar | Bank Statement |
|-------|--------|-------|--------|----------------|
| Red-like | Destructive action | New notification | Offline/Busy | Withdrawal |
| Green-like | Positive action | Verified | Online | Deposit |
| Purple-like | - | New feature | - | - |

Calling everything danger would be semantically incorrect.

## Not All Combinations Are Required

An important design decision: not every component needs every semantic color.

Based on research of major design systems (iOS, Material Design, Fluent,
Carbon):

- Buttons: `primary`, `neutral`, `destructive` (`redLike`), `positive`
  (`greenLike`).
- Buttons: no yellow buttons, no purple buttons, because they are not used in
  practice.
- Badges: `primary`, `neutral`, `attention` (`redLike` or `purpleLike`).
- Inputs: `error` (`redLike`), `success` (`greenLike`).

This is opinion based on real-world usage, not theoretical completeness. If a
specific design system needs a yellow button, it can be added via preset
configuration.
