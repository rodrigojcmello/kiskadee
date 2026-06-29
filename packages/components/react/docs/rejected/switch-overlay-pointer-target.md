# Rejected: Switch `overlayPointerTarget`

Status: rejected

Date: 2026-06-28

Follow-up: KIS-55

## Context

The `/switch` showcase composes an actionable `CardAction` surface with a
visual `Switch` rendered above it. The overlay wrapper is pass-through so the
card can keep hover and pressed surface feedback, but the Switch must still own
its own pointer input, activation feedback, click, and drag behavior.

One attempted fix added a Switch-only `overlayPointerTarget` prop. The prop
opted the Switch root back into hit testing only when the consumer explicitly
used a pass-through overlay composition.

## Rejected Approach

Do not add a Switch-specific `overlayPointerTarget` public prop.

Although the prop made the pointer contract explicit, the behavior is not
Switch-specific. Any interactive component can appear inside a pass-through
overlay or a larger actionable surface. A Switch-only prop would solve the
current case while creating an uneven framework contract for Button, Checkbox,
Radio, Slider, and future interactive components.

## Decision

The Switch root keeps `pointer-events: auto` as its structural default. This
preserves the current component behavior and keeps the `/switch` CardAction
composition working without adding a narrow public prop.

Future work should evaluate a shared overlay hit-test contract across
interactive components if Kiskadee needs opt-in reentry for pass-through
overlays as a framework-level capability.
