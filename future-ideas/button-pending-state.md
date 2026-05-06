# Button Pending State

Status: future idea.

## Context

While discussing TextField placeholder semantics, we revisited the broader interaction-state
vocabulary used by Kiskadee. The existing state set includes concepts such as `rest`, `hover`,
`focus`, `disabled`, `selected`, and `readOnly`.

That discussion raised a separate Button use case: a submitted form often needs to make its submit
button temporarily non-interactive while the request is in progress. Today that usually falls into a
disabled-like visual treatment, but disabled can communicate that the action is unavailable or not
allowed. A pending submit button means something different: the action was valid, was triggered by
the user, and is now processing.

## Example

A primary blue submit button is clicked. While the form is submitting, the button should no longer
accept interaction, but it may still want to preserve its primary identity.

Possible visual distinction:

- `disabled`: neutral or gray treatment, communicating that the action is not available.
- `pending`: primary treatment with reduced emphasis or opacity, communicating that the action is
  already in progress.

This avoids making a successful user-triggered action look like a permanently unavailable action.

## Naming Tension

`readOnly` came up as a possible analogy because it suggests "visible but not editable/actionable".
However, `readOnly` maps naturally to fields with readable values, not to buttons. A button does not
have editable text/value semantics in the same way a TextField does.

For Button, `pending` may be a better semantic name than `readOnly`:

- `pending`: the action is in progress.
- `busy`: the control is occupied, but the word is less action-specific.
- `loading`: useful visually, but may over-couple the semantic state to a spinner/loading treatment.
- `readOnly`: useful analogy, but likely too field-oriented for Button.

## Motivation

The goal is to separate two states that are currently easy to collapse:

- "This action cannot be performed."
- "This action was performed and is temporarily locked while processing."

That distinction could let presets keep semantic color in the pending state while still preventing
extra clicks, duplicate submissions, hover effects, and pressed feedback.

## Open Questions

- Should `pending` become a global interaction state or only a Button status?
- Should `pending` imply native `disabled`, `aria-disabled`, `aria-busy`, or a combination?
- Should focus remain possible while pending?
- Should hover/focus visual styles be suppressed, or should pending have its own hover/focus subset?
- Should Button show pending content through a slot, icon, spinner, or purely through style?
- How should generated CSS order `pending` relative to `disabled`, `focus`, `hover`, and `pressed`?

## Relationship To TextField Placeholder Discussion

This idea was captured while exploring whether `readOnly` could be reused for TextField placeholder
color semantics. That reuse was not favored because TextField already has real read-only behavior,
and placeholder content is about empty/value state rather than editability.

The Button case remains interesting as its own future idea because it represents a different problem:
a temporarily locked action that should not necessarily look like a disabled unavailable action.
