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
