# Control State Effects

Kiskadee treats `controlState`, for example `selected`, and interaction effects, for example
stateful `borderRadius`, as separate opt-in concerns.

- `controlState` is a semantic toggle state that is activated by the runtime, such as
  `controlState={true}` on React components.
- `controlState` is the cross-platform Kiskadee API name for persistent binary control state, even
  when a specific platform adapter maps it to terms such as web `checked` or native `isOn`.
- Effects are optional, component-level features and must only be applied when the consumer
  explicitly opts in, such as `radiusEffect={true}` or `shadow={true}`.

This distinction matters because some Design Systems, such as Material Design 3, author
selected-specific interaction effects like animated corners under `effects.borderRadius.selected`.
Those effects must not automatically activate just because `controlState` is on.

Rule: interaction keys under `selected:*` remain effects and stay inside the element `e` buckets in
`core.kiskadee.json`. They must never be moved into the control-state field (`l`).

Practical implication for consumers: if a DS wants selected + animated corners, the component must be
rendered with both `controlState={true}` and `radiusEffect={true}`.

## Switch Thumb Shrink Effect Direction

The Switch thumb-shrink effect is a state-based geometry effect, not a replacement for the normal
thumb scale contract.

Preset schema authoring rules for this effect live in
`packages/presets/docs/definitions/schema-rules/switch.schema-rules.md`. In particular, per-scale
thumb-shrink intent should be expressed by schema values, not by adding runtime availability gates.

Normal Switch thumb geometry stays owned by `scales` on `switch.e3`:

- `scales.boxWidth` and `scales.boxHeight` define the base thumb size.
- The base thumb size is also the selected/on size.
- The effect must not restate selected/on geometry just to preserve the base size.

The effect exists only to describe an off/rest visual reduction. It should use the same responsive
numeric contract shape as `scales`, not percentages or ratios:

```ts
effects: {
  thumbShrink: {
    rest: {
      boxWidth: {
        's:md:1': 16
      },
      boxHeight: {
        's:md:1': 16
      }
    }
  }
}
```

Rules:

- `effects.thumbShrink.rest` means the thumb is visually smaller while the Switch is off/resting.
- `selected.rest` is intentionally absent because selected/on uses the normal `scales` size.
- `rest` here means off/rest, not disabled. `disabled` still means unavailable and is a separate
  interaction state.
- Missing `boxWidth` means the effect does not change width.
- Missing `boxHeight` means the effect does not change height.
- Width and height must be independently expressible because some design systems shrink only one
  axis.
- The effect must support the same size-aware authoring model as scales, so values can vary by
  `s:*` size tokens.
- The effect must work for `Switch` with runtime motion enabled or disabled.
- Generated artifacts store the Switch thumb-shrink effect in the `e.ts` bucket. The bucket is
  size-aware, so consumers should resolve `all` plus the current size key when present.
- Web CSS emits the effect as an off/rest selector, for example:

```css
.k-swt:not(.-s) .<thumb-shrink-class> {
  width: 16px;
}
```

The selector intentionally uses the root selected activator as the gate. Selected/on uses the normal
thumb size from `scales`, so no selected effect class is needed.

This effect is primarily intended for Switch designs with circular thumbs. It can technically be
enabled for designs such as iOS 26, where the on/default thumb may be a rounded rectangle instead
of a circle, but the result can look intentionally odd. For example, a height-only off/rest effect
on a rounded-rectangle thumb should keep the selected/on width intact while reducing height and
preserving vertical alignment:

```ts
effects: {
  thumbShrink: {
    rest: {
      boxHeight: {
        's:md:1': 16
      }
    }
  }
}
```

That behavior is expected. The effect should not infer a width change from a height change, and it
should not reinterpret a rectangular thumb as a circular one.
