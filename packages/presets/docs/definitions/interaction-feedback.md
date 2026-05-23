# Interaction Feedback

## Pressed State Rule

The pressed interaction state (`:active`) is intentionally the highest-contrast
step among interaction states. It is also the only state that does not
transition: the click itself should immediately trigger the color change. This
makes the feedback unmistakable and confirms to the user that the control was
actually pressed.

This behavior applies to every design system registered in Kiskadee (Material,
Fluent, iOS, Carbon, etc.). It is treated as a UX micro-interaction, not a brand
choice, so we keep it consistent across all presets.

## Recommendation When Ripple Is Enabled

When ripple is enabled, keep `focus`, `hover`, and `pressed` background colors
equal for the same button emphasis and intent.

Rationale:

- `hover` is primarily pointer/mouse feedback.
- `focus` is primarily keyboard feedback, plus focus ring for location.
- `pressed` must preserve visual continuity for real click/tap confirmation,
  including long/deep presses such as trackpads.

If `pressed` differs too much from `hover`/`focus`, quick taps and long presses
can look inconsistent, especially on low-emphasis buttons whose `rest` color is
transparent or very light.

This is a recommended authoring guideline in schema design, not a technical
engine constraint.

## Switch Activation Motion

Switch activation motion is a component-level preset decision expressed through
`components.switch.options.activationMotion`.

Supported values:

- `standard`: the default interaction duration for Switch activation.
- `slow`: a slightly slower activation profile for Switch geometries that feel
  too fast with the standard duration.

Use this option as semantic preset intent, not as a direct CSS duration. Web
currently maps `standard` to the default Switch interaction duration and `slow`
to the slow interaction token. Other platforms should translate the same intent
to their native motion system.

Prefer `standard` when the thumb is wider or visually heavier, as in the iOS 26
Apple Switch. Prefer `slow` when a compact circular thumb makes the same
distance feel too abrupt, as in Fluent 2 Microsoft.
