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

## Keyboard Versus Pointer Feedback

Keyboard activation must use the ordinary pressed/control-state path and the
focus ring. A focused control already has a clear location affordance, and Space
or Enter should still activate the native control behavior without starting the
activation-feedback visual effect.

Activation feedback is the extra touch/cursor affordance for direct pointer
interaction: mouse click, trackpad click, pen, and touch. The schema does not
expose an input-policy field for this decision. Component runtimes should keep
keyboard handling accessible and native, while restricting activation-feedback
animation to pointer-originated interaction.

## Activation Feedback Direction

`activationFeedback` is the cross-component activation feedback effect. It
behaves like plug-and-play infrastructure: a component opts an element into the
effect and the shared effect owns tokens, profiles, runtime, and base CSS
behavior.

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

The schema supports profile configuration on `global.effects.activationFeedback`.
Presets may declare a default `profile`, pointer `origin`, pressed visual policy,
and reusable `profiles`. Element schemas still opt in with
`activationFeedback: true`; they do not own profile definitions.

When profiles are declared, generated class maps may expose compact effect
buckets in addition to the base `af` bucket:

- `af`: base activation feedback class.
- `afs`: `surface` profile.
- `afo`: `overflow` profile.
- `afx`: `overflow-static` profile.
- `afp`: `pressed` profile.

Consumers should keep reading `af` until they explicitly migrate to a
profile-aware host. New profile-aware consumers should pick the supported
profile bucket rather than infer behavior from component names.

Supported profile intent:

- `surface`: feedback contained inside the host bounds.
- `overflow`: feedback may escape host bounds and may use pointer/radial
  geometry.
- `overflow-static`: feedback may escape host bounds but uses fixed geometry.
- `pressed`: feedback profile for pressed/overlay state.

## Switch Activation Feedback

The Switch uses only `overflow-static`: the feedback is anchored on the thumb,
escapes the track clipping area, and does not need pointer-origin radial
geometry. React Switch binds the base `af` class plus the `afx` profile bucket
when the artifact exposes it. This is profile-aware consumption, not a public
profile choice for Switch.

React Switch exposes a small local control:

```ts
activationFeedback?: false | 'active'
```

- `undefined`: automatic behavior from the artifact.
- `false`: disables activation feedback for that Switch instance.
- `'active'`: forces the visual preview active for Showcase and documentation
  examples.

`activationFeedback="active"` is a preview state only. It should not be used as
a replacement for semantic `controlState`.

## Button Activation Feedback

Button is profile-aware and consumes the shared activation-feedback buckets.
The local override is `activationFeedback`; passing
`activationFeedback={false}` disables the activation-feedback path.

Button remains a separate validation surface from Switch. Fixes to a
Switch-specific profile should not couple Switch to Button runtime details.

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
