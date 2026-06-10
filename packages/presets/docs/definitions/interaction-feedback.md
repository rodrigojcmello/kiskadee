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

## Activation Feedback Direction

`activationFeedback` is the target cross-component activation feedback effect.
It should behave like plug-and-play infrastructure: a component opts an element
into the effect and the shared effect owns tokens, profiles, runtime, and base
CSS behavior.

Element schemas keep the opt-in small:

```ts
effects: {
  activationFeedback: true
}
```

The element that declares the effect is the effect host. Component structural
CSS may handle local hosting requirements such as clipping, stacking, and
anchoring, but it must not hardcode semantic feedback colors or opacities.

Activation feedback tokens are resolved through surface tone:

```ts
activationFeedback: {
  surfaceTone: {
    subtle: {
      color: '#1D1B20',
      opacity: 0.1
    },
    vivid: {
      color: '#FFFFFF',
      opacity: 0.2
    }
  }
}
```

Use `subtle` for feedback on light/subtle/base surfaces and `vivid` for feedback
on strong, vivid, or dark surfaces. Do not model these tokens directly by
component `emphasis`; components or surface containers should map their visual
context to the current surface tone.

The existing single-tone `activationFeedback.color` and
`activationFeedback.opacity` fields are legacy-compatible and map to
`surfaceTone.subtle`.

Long-term, `activationFeedback` should absorb the reusable behavior currently
implemented by the Button ripple effect. This does not mean duplicating
component-specific runtimes; the ripple runtime should be modularized into
shared activation-feedback profiles that many components can reuse.

The first shared runtime extracted from Button is the radial activation-feedback
state machine. Button may keep a ripple-named compatibility wrapper while its
public API is being migrated, but the runtime ownership belongs to the shared
activation-feedback layer.
The shared runtime uses activation-feedback naming internally and only exposes
`buttonRef` / `isRipple*` aliases for the temporary Button ripple wrapper.
Profile availability and radial runtime-config resolution also live in the
shared activation-feedback layer; component hosts should reuse those utilities
instead of duplicating bucket or timing resolution locally.

The schema supports profile configuration on `global.effects.activationFeedback`.
Presets may declare a default `profile`, pointer `origin`, pressed visual policy,
and reusable `profiles`. Element schemas still opt in with
`activationFeedback: true`; they do not own profile definitions.
Keyboard activation uses the ordinary `pressed` state and focus ring. It must not
start the modern activation-feedback visual effect; keyboard-specific feedback
policy belongs only to the deprecated `ripple` compatibility schema.

When profiles are declared, generated class maps may expose compact effect
buckets in addition to the legacy `af` bucket:

- `af`: legacy/base activation feedback class.
- `afs`: `surface` profile.
- `afo`: `overflow` profile.
- `afx`: `overflow-static` profile.
- `afp`: `pressed` profile.

Consumers should keep reading `af` until they explicitly migrate to a
profile-aware host. New profile-aware consumers should pick the supported
profile bucket rather than infer behavior from component names.

Button is the first profile-aware React consumer. It prefers activation-feedback
profile buckets when the current artifact exposes them and falls back to the
legacy ripple path otherwise. The public `rippleEffect` prop remains supported
during migration and is treated as a compatibility alias for the shared radial
feedback runtime. The `activationFeedback` prop is the forward-compatible local
override for Button instances; passing `activationFeedback={false}` disables the
activation-feedback path.

The legacy Button ripple CSS is also an alias layer: it maps `--k-ripple-*`
variables onto the Button activation-feedback host variables instead of owning a
separate pseudo-element implementation. This keeps old generated ripple classes
working while making the activation-feedback host the structural source of truth
for Button radial feedback.
Button loads the activation-feedback host CSS from the Button entrypoint so the
profile-aware path and legacy ripple fallback do not each ship a separate host
implementation.

The Button Showcase exposes `Activation Feedback Profiles` with examples for
`surface`, `overflow`, `overflow-static`, origin override, and the legacy
`rippleEffect` alias. Use that section as the first visual validation surface
for Button activation-feedback migration.

Supported profile intent:

- `surface`: feedback contained inside the host bounds.
- `overflow`: feedback may escape host bounds and may use pointer/radial
  geometry.
- `overflow-static`: feedback may escape host bounds but uses fixed geometry.
- `pressed`: feedback profile for pressed/overlay state.

The Switch uses only `overflow-static`: the feedback is anchored on the thumb,
escapes the track clipping area, and does not need pointer-origin radial
geometry. Button may use multiple profiles, but those profiles should come from
the shared activation-feedback effect rather than a Button-only runtime.
React Switch binds the base `af` class plus the `afx` profile bucket when the
artifact exposes it. This is profile-aware consumption, not a public profile
choice for Switch.

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

`activationMotion` is not intended as a per-instance React component override.
It captures preset fidelity for the selected design system.

Prefer `standard` when the thumb is wider or visually heavier, as in the iOS 26
Apple Switch. Prefer `slow` when a compact circular thumb makes the same
distance feel too abrupt, as in Fluent 2 Microsoft.

## Switch Control Text Visibility

Switch control text is the optional visual `On` / `Off` style text that
represents `controlState`. It is separate from the control `label`, which names
the field or setting.

Presets control the default display policy through
`components.switch.options.controlTextVisibility`.

Supported values:

- `none`: hide control text even when the React component receives
  `controlText`.
- `largeOnly`: show control text only on large web viewports, matching desktop
  settings patterns.
- `always`: show control text whenever the component receives `controlText`.

The default is `none`. Use `largeOnly` for design systems where explicit
on/off text is appropriate on desktop surfaces but noisy on compact surfaces.
