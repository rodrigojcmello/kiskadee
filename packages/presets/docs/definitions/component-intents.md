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
- Introduce `highest` only when the same component needs an extreme or
  absolute own surface, such as black or a very dark brand surface.
- Introduce `high` only when the same component truly needs a vivid, strong,
  or high-contrast own surface.
- Use `low` only when the same component needs a white/base own surface. In the
  current light-theme presets, `low` should resolve to that same base surface
  across intents unless the component has a documented exception.
- Treat `lowest` as the weakest perceptible presentation supported by the component. For
  own-surface components it can remain a transparent/no-own-surface treatment; components whose
  visual itself carries information may instead use a visible translucent treatment.
- If a component cannot reasonably expose `neutral.medium`, document that as an
  explicit exception in the preset instead of silently choosing another
  baseline.

Short rule: the default public face of a component should be `neutral.medium`,
and stronger or weaker emphases are extensions of that baseline.

## Component Emphasis As Own-Surface Strength

Kiskadee treats `emphasis` as the strength of the component's own visual
surface. It is not a generic importance score, and it is not a local dark-mode
switch.

For Button and Card, the canonical surface mapping is:

| Emphasis | Canonical own surface | Examples |
| --- | --- | --- |
| `highest` | Extreme or absolute surface. | Black neutral Card, very dark primary Card. |
| `high` | Vivid, strong, or high-contrast surface. | Dark primary Button, dark primary Card. |
| `medium` | Light tonal surface. | Light primary Button, light neutral Card. |
| `low` | Solid white/base surface. | White outlined Button, classic white Card. |
| `lowest` | Weakest perceptible presentation; often no own surface. | Text/ghost-like Button cases. |

This rule is intentionally shared by Button and Card so the same emphasis name
means the same kind of surface across components. A white Card may feel like the
"normal" card in common design language, but in Kiskadee it is `low` because it
has less own-surface strength than a light tonal Card and much less than a vivid
Card.

If a component exposes only one emphasis, the component still uses `medium`.
`medium` is the consistency baseline, even when the component could later add
`highest`, `high`, `low`, or `lowest`.

`highest` is not dark mode. It is the strongest own-surface bucket inside the
current intent and theme. For example, `neutral.highest` and `primary.highest`
are equivalent in role, but their literal colors may be black and very dark
primary respectively.

If two semantic combinations resolve to the same own-surface color, consumers
that choose visual backgrounds should avoid exposing duplicate choices. For
example, `neutral.low` and `primary.low` may both be white/base in a light
theme; a surface picker should keep one white option instead of showing two
identical backgrounds just because their semantic paths differ.

### Container And Child Emphasis

Container emphasis and child emphasis are independent component decisions. Card
may suggest a default emphasis for children, but this should start as a
contextual recommendation, not an automatic universal rule.

Current working guidance:

| Container emphasis | Container surface | Child emphasis guidance |
| --- | --- | --- |
| `highest` | Extreme / absolute surface. | Prefer `low`; validate any stronger child emphasis explicitly. |
| `high` | Vivid / strong / high contrast. | Prefer `medium` or `low`; use child `high` only when contrast is intentionally validated. |
| `medium` | Light tonal. | `medium` and `low` are both usually viable; `high` can be reserved for the primary action. |
| `low` | White/base. | Most child emphases can work; children should normally keep their own baseline. |
| `lowest` | No own surface. | Do not infer child emphasis; the external ambient surface is the real context. |

Do not model this as `child emphasis = parent emphasis - 1`. White/base
surfaces are permissive and can host many child emphases, while vivid surfaces
are restrictive and require contrast checks.

### Lowest And Ambient Surface Context

`lowest` remains the no-own-surface emphasis. Because a transparent component does not replace the
surface behind it, its authored `contentSurfaceContext` output should normally be `inherit`.

The orthogonal `surfaceContext` axis now carries the ambient semantic distinction through
`onSubtle` and `onVivid`. This removes the need to encode ambient contrast in emphasis names such as
`high-transparent` or `low-transparent`, and it does not imply automatic light/dark alternation.
Each surface-owning component authors the context it actually produces; a no-own-surface treatment
preserves the value it consumed.

The binary vocabulary intentionally covers uniform semantic regions. Photos, gradients, and mixed
backgrounds require explicit consumer-authored Provider regions for now. A richer vocabulary should
be introduced only after concrete component cases prove that `onSubtle` and `onVivid` cannot express
the required distinctions; runtime luminance or DOM paint detection is not a fallback.

Relevant existing references:

- `activationFeedback` is a shared global effect library plus component-level
  recipe. Profile behavior is resolved from `global.effects.activationFeedback`
  and `components.<name>.effects.activationFeedback`; color/opacity come from
  `themeTokens.effects.activationFeedback.tone`.
- Future activation-feedback or transparent-label decisions should preserve
  these references before choosing between fixed black/white contrast values
  and normalized ambient-aware tokens.

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

Card can expose `primary` as a public component intent because it changes the
whole Card surface from neutral to brand/primary. This is distinct from a binary
control's selected/on state using a primary activation color inside a neutral
presentation.

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

### Switch Intent, Emphasis, And Control State Example

Switch is the canonical example for keeping the axes separate:

```txt
intent  = public semantic presentation
emphasis = visual strength within the same presentation
selected = persistent on/checked control state
```

For `ios-27-apple`, the default official presentation is still `neutral.medium`
even though the selected/on track is green:

```txt
neutral.medium.rest          = off + default iOS neutral treatment
neutral.medium.selected.rest = on + official iOS green activation treatment
```

That green is not the `neutral` intent itself. Keep
`componentIntents.switch.neutral` mapped to `neutral`, and consume Layer 2
`greenLike` directly inside the `selected.*` palette values when the design
system uses green as its on color.

Additional Switch intents should represent user-selectable semantic
presentations:

```txt
neutral.medium  = default preset presentation
primary.medium  = brand/primary on treatment
polarity.medium = negative off pole + positive on pole
```

`polarity` is not `high` emphasis. It changes meaning by making the two control
states semantically opposed. `high` should remain available for stronger visual
presence inside a single intent, without changing the meaning of the colors.

If a composite intent such as `polarity` needs more than one Layer 2 color, the
component palette should compose those colors explicitly in the relevant control
states.

Do not add `components.switch.options.intent` only because a preset exposes more
than one Switch intent. The public default remains `neutral.medium`; consumers
choose another intent through the component API when they need it.

### Switch Low Emphasis On Strong Surfaces

Use `low` when the same Switch presentation must sit on a strong local surface,
such as a primary-colored card in the Showcase. This is not dark mode and does
not introduce a new color mode. The page/theme can remain light while the local
example surface is primary.

For this case, keep the public semantic axis stable and lower the visual
strength inside the current intent:

```txt
neutral.medium = default Switch on the normal surface
neutral.low    = same Switch adapted for a strong primary surface
```

The low treatment should keep the Switch readable on the strong surface, usually
with white, transparent, or very light primary surfaces for the track/thumb/text
and enough contrast for selected/on state cues. Do not create a new
`ComponentEmphasis` value for this; use the existing `low` bucket.

### Binary Control State And Interaction State

Binary controls have two independent axes:

- Control state: unchecked/off versus selected/on.
- Interaction state: `rest`, `hover`, `focus`, `pressed`, `disabled`, and
  related states.

`rest` means the control is not currently being hovered, focused, pressed, or
otherwise interacted with. It does not mean off or disabled.

For Switch, Checkbox, Radio, and similar binary controls, the base branch is the
unchecked/off control state. The nested `selected` branch is the checked/on
control state. Therefore:

```txt
neutral.medium.rest           = off + rest
neutral.medium.hover          = off + hover
neutral.medium.selected.rest  = on + rest
neutral.medium.selected.hover = on + hover
```

When authoring presets, put persistent on/checked visuals under
`selected.<interaction>`, not in the base interaction state. For example, a
Switch track that turns green when on should define the green value in
`selected.rest`; putting it in `rest` would make green the off/rest visual.

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
// Button intents authored by presets
type SystemButtonIntent = 'primary' | 'neutral' | 'destructive' | 'positive';

// External intents are distributed by their own optional artifact domain.
type ExternalButtonIntent = `brand.${string}`;
type ButtonIntent = SystemButtonIntent | ExternalButtonIntent;

// Passive Badge metadata intents
type BadgeIntent = 'neutral' | 'primary' | 'novelty' | 'positive' | 'warning' | 'attention';

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
- Badges: `neutral`, `primary`, `novelty` (`purpleLike`), `positive` (`greenLike`), `warning`
  (`yellowLike`, optionally `v2`), and `attention` (`redLike`). Badge has no destructive intent.
- Inputs: `error` (`redLike`), `success` (`greenLike`).

This is opinion based on real-world usage, not theoretical completeness. If a
specific design system needs a yellow button, it can be added via preset
configuration.
