# interactionLocked

`interactionLocked` is a temporary interaction gate for controls that must stop accepting new
activation attempts without becoming semantically `disabled` or `readOnly`.

This is a shared control contract, not a Switch-specific feature. Any current or future component
that exposes persistent user-controlled state through `controlState`, `defaultControlState`, or
`onControlStateChange` should explicitly decide whether `interactionLocked` belongs in its public
API. If the component can trigger repeated activation while async work is pending, it should usually
support `interactionLocked`.

## Context

Some controls trigger asynchronous work when their state changes. A Switch can start an API request,
persist a setting, or wait for a remote confirmation after the user taps or drags it. A selectable
CardAction can do the same when choosing a plan, activating a preference, or selecting an item.
During that window, accepting more toggles can create duplicate requests, conflicting responses, or
rapid state oscillation.

Kiskadee should not solve that by reusing `disabled` or `readOnly`:

- `disabled` means the control is unavailable.
- `readOnly` is an official interaction state and may have its own visual treatment.
- `interactionLocked` means the control is temporarily ignoring activation attempts while the value
  remains visible and semantically available.

## Contract

- The default is unlocked. Components must not impose a throttle or cooldown unless the consumer opts
  into it.
- A tap emits a single state-change intent.
- A continuous drag may emit more than one state-change intent when the user reaches opposite
  endpoints without releasing the thumb.
- Drag preview can move locally, but it must not emit repeated state-change intents while crossing
  intermediate positions.
- `interactionLocked` blocks new tap, drag, keyboard, or accessibility activation attempts.
- `interactionLocked` must not automatically apply `disabled`, `readOnly`, or their visual states.
- If a product needs a visible pending message, spinner, error, or retry affordance, that belongs to
  the consuming UI or to a separate explicit feature, not to the base lock state.

## Cooldown

A cooldown is an optional interaction gate that enforces a minimum interval between accepted
state-change intents. It is related to the same async-safety problem space as `interactionLocked`,
but it remains a distinct control.

The base component should stay immediate by default. A cooldown should be explicit, either as
consumer-owned state or as an opt-in component API such as `interactionCooldown` on native platforms
or an equivalent web API.

Cooldown should apply to the next separate interaction after the accepted interaction finishes. It
must not lock a drag that is already in progress, because dragging the thumb back to the opposite
endpoint is still part of the same interaction.

## Async Usage

For async work, the consumer should usually control the lock:

1. Accept one user intent.
2. Set the desired value optimistically or wait for the remote confirmation.
3. Set `interactionLocked` while the async work is in flight.
4. Clear `interactionLocked` when the work finishes.
5. Revert or keep the value based on the async result.

This keeps the component responsive, avoids duplicated side effects, and preserves the semantic
difference between temporary locking and unavailable/read-only states.
