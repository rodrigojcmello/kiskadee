# Progress

`Progress` represents measurable completion. It is an independent component, not an interaction
state, effect, spinner, or synonym for pending.

## Contract

`Progress` supports two explicit modes:

- `mode="determinate"` (the default) requires `value`;
- `mode="indeterminate"` forbids `value`, `min`, and `max`.

Determinate values default to `min=0` and `max=100`. Finite values are clamped to the normalized
interval. Non-finite bounds fall back to their defaults; an invalid interval falls back to `0–100`;
and a non-finite value starts from `0`. Invalid inputs emit development warnings. Indeterminate
mode is never inferred from a missing or invalid value.

Applications and inspection tools may simulate changing determinate values, but simulation is a
value source outside the Progress contract. It does not create a third mode.

The normalized percentage is runtime geometry. Web exposes it through an internal CSS custom
property so the indicator can fill from logical start in both LTR and RTL. It is not a design token
and must not enter preset schemas or generated metadata.

## Accessibility

Standalone Progress renders `role="progressbar"` and requires a non-empty accessible name through
`aria-label` or `aria-labelledby`. Determinate mode publishes `aria-valuemin`, `aria-valuemax`, and
`aria-valuenow`; indeterminate mode omits them. `aria-valuetext` remains optional.

A Progress composed inside a Button is decorative. It omits the progressbar role and value
attributes and renders `aria-hidden="true"`, because a nested semantic progressbar is not a reliable
descendant of a native button. Products that need to announce percentage changes should render an
external Progress or status and associate that information with the action.

## Visual Axes

Progress owns five intents: `neutral`, `primary`, `positive`, `warning`, and `destructive`.

Progress has one canonical emphasis: `medium`. It does not expose an `emphasis` prop, and every
published surface context must provide exactly one medium Rest profile for each supported intent.
Theme and surface-context adaptations remain preset responsibilities rather than consumer-selected
strength variants.

Two scales are published: `s:md:1` (2px) and `s:lg:1` (4px). The track and indicator are always
pill-shaped; shape and radius are not public axes in this contract. `surfaceContext` follows the
normal component contract and is never inferred from a surrounding Button.

## State And Structure

Progress has only Rest. It rejects hover, pressed, focus, selected, pending, disabled, read-only,
and filled color states. `mode` is a rendering mode, not an interaction state. Determinate progress
transitions its inline size over 300ms; indeterminate mode uses a 33% logical segment. Reduced
motion replaces movement with a full-width opacity pulse, and forced-colors uses system colors.

The canonical topology is:

- `e1`: semantic root and no visual token ownership;
- `e2`: track, including scale geometry and neutral/medium Rest color;
- `e3`: indicator, including pill geometry and one medium Rest profile per intent.

The styled component renders this complete topology. The headless component may expose Root, Track,
and Indicator for advanced composition, but consumers do not assemble the standard Progress.

## Button Composition

`Button.Progress` reuses Progress rather than duplicating its color matrix inside Button:

- it accepts `value`, `min`, `max`, `intent`, `surfaceContext`, and `className`;
- it never activates pending and is determinate-only;
- it renders only for operational `pending` or forced `status="pending"`;
- disabled wins over pending and suppresses the composed fill;
- a Button may be pending without Progress;
- Progress may exist without a pending Button.

The Button surface itself is the track. The composed Progress fills the Button surface without a
gap, inset, or spacing token, starts at logical inline-start, works in RTL, and remains decorative.
Content stays above the fill and activation feedback stays above both. The viewport clips only its
own paint so focus outlines and feedback are not clipped by the Button root.

Indeterminate Progress is a standalone capability in this rollout. A dedicated Spinner component,
automatic pending from Promises, and a second Button progress mode remain deferred.
