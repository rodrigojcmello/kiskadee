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
behaves like shared infrastructure: global schema owns reusable tokens, profiles,
runtime defaults, and base CSS behavior; component schema owns the component's
default profile, origin, paint, layer, and tone mapping.

Global effect schema defines the library:

```ts
global: {
  effects: {
    activationFeedback: {
      profile: 'ripple',
      origin: 'pointer',
      visual: {
        layer: 'overlay',
        paint: 'halo',
        tone: { default: 'subtle' }
      },
      profiles: {
        ripple: { size: 'auto', animateSize: true },
        rippleOverflow: { size: 80, animateSize: true },
        halo: { size: 80, animateSize: false },
        pressed: { size: 'auto', animateSize: false }
      }
    }
  }
}
```

Component effect schema chooses the recipe:

```ts
components: {
  switch: {
    effects: {
      activationFeedback: {
        profile: 'halo',
        origin: 'center',
        visual: {
          layer: 'underlay',
          paint: 'halo',
          tone: {
            default: 'subtle',
            byEmphasis: { low: 'vivid' }
          }
        },
        profiles: {
          halo: { size: 8 }
        }
      }
    }
  }
}
```

`activationFeedback` settings inherit by merge:

- `undefined`: inherit the previous level.
- `false`: disable the effect for that component or element.
- object: merge with the previous level.
- `true`: compatibility alias for an empty object; new presets should not use it.

`profiles` use deep merge by profile. A component can override only
`profiles.halo.size`, and the other profiles remain inherited from global.

Activation feedback tokens are resolved through tone:

```ts
activationFeedback: {
  tone: {
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
on strong, vivid, or dark surfaces. These are feedback contrast buckets, not
component emphasis values. Components may map their own visual recipe to a tone
through `visual.tone.byEmphasis` when that recipe changes the surface where the
feedback appears.

Single-tone `activationFeedback.color`, `activationFeedback.opacity`, and
`surfaceTone` are not part of the modern contract. Presets must declare
feedback colors through `tone.subtle` and `tone.vivid`.

Layer opacity is applied once by the effect layer itself. Generated border and
fill colors should stay opaque unless a profile intentionally uses
`visual.paint` to suppress the fill; otherwise outline feedback becomes
effectively transparent after alpha is multiplied twice.

When profiles are declared, generated class maps may expose compact effect
buckets in addition to the base `af` bucket:

- `af`: base activation feedback class.
- `afs`: `ripple` profile.
- `afo`: `ripple-overflow` profile.
- `afx`: `halo` profile.
- `afp`: `pressed` profile.

Supported profile intent:

- `ripple`: feedback contained inside the host bounds.
- `ripple-overflow`: feedback may escape host bounds and may use pointer/radial
  geometry.
- `halo`: feedback may escape host bounds but uses fixed geometry.
- `pressed`: feedback profile for pressed/overlay state.

For `visual.paint`, `size` has paint-specific meaning:

- `paint: 'halo'`: `size` is the halo expansion/area.
- `paint: 'outline'`: `size` is the outline stroke width.

## Switch Activation Feedback

Switch defaults should normally use `profile: 'halo'` and `origin: 'center'`,
because the feedback is anchored on the thumb and may escape the track clipping
area. This is a preset default, not a runtime limitation. If a preset chooses
`ripple` or `ripple-overflow`, React Switch should consume that resolved profile
instead of hardcoding `halo`.

Material Switch maps `visual.tone.byEmphasis.low` to `vivid` because its low
recipe is intended for strong local surfaces. This is a Switch preset decision,
not a global rule that low emphasis always uses vivid feedback.

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

Button defaults should normally use `profile: 'ripple'` and `origin: 'pointer'`.
Unlike Switch, Button does not need a `byEmphasis` tone mapping by default; if a
preset wants one, it must declare it in component schema.

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
