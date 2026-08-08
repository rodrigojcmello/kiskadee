# Component Style Emission Overrides

This document records component/element style-emission policies that intentionally differ from the
default CSS shape. It is scoped to component contracts, not preset values.

The implementation source of truth is
`packages/web-builder/src/style-emission/web-build-policy.ts`.

For the general emission model, see
[`style-emission-policy.md`](./style-emission-policy.md).

## Reading This Document

An emission override changes how a schema property is written to CSS for a concrete
component/element. Examples:

- `direct`: writes only the CSS property.
- `mirrored`: writes a CSS custom property and the CSS property.
- `token`: writes only the CSS custom property.
- `compensated`: writes a base CSS custom property and a derived CSS property.

Some non-direct emission is default behavior, not an override. In the current builder,
`borderRadiusEmission` defaults to `mirrored`, so a component only needs an entry here when it
changes that default or when local runtime/structural behavior depends on the emitted variable in a
component-specific way.

## Slider

Current scope:

- `slider.variants.standard.elements.e8`, the visual track.
- `slider.variants.standard.elements.e12`, the visual mark.
- `slider.variants.standard.elements.e14`, the value indicator.

The policy applies at the `standard` variant level. The current Slider mode is `base`, but emission
policy resolution is variant-level here, so future `standard` modes should inherit the same mark
geometry contract unless a new policy is added.

### Track `e8`

| Property family | Policy | Default | CSS shape | Reason |
| --- | --- | --- | --- | --- |
| `boxHeight` | `mirrored` | `direct` | `--k-bxh: <value>; height: <value>` | Slider structural CSS needs the rendered track thickness to clamp edge marks into the track geometry. |

### Mark `e12`

| Property family | Policy | Default | CSS shape | Reason |
| --- | --- | --- | --- | --- |
| `boxWidth` | `mirrored` | `direct` | `--k-bxw: <value>; width: <value>` | Slider structural CSS needs the rendered mark width to clamp the first and last marks without hardcoding preset geometry. |

### Value indicator `e14`

| Property family | Policy | Default | CSS shape | Reason |
| --- | --- | --- | --- | --- |
| `boxHeight` | `token` | `direct` | `--k-bxh: <value>` | The authored tooltip height is a minimum. Structural CSS lets enlarged text grow beyond it, while runtime uses the same token to reserve only that excess above the nominal lane. |

## Switch

Current scope:

- `switch.variants.standard.elements.e2`, the visual track.
- `switch.variants.standard.elements.e3`, the visual thumb.

The policy applies at the `standard` variant level. The current Switch mode is `base`, but emission
policy resolution is variant-level here, so future `standard` modes should inherit the same track
emission contract unless a new policy is added.

### Track `e2`

| Property family | Policy | Default | CSS shape | Reason |
| --- | --- | --- | --- | --- |
| `borderWidth` | `mirrored` | `direct` | `--k-bdw: <value>; border-width: <value>` | The track can have a web border while the schema still describes cross-platform geometry. The generated padding compensation also needs a border-width variable. |
| `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` | `compensated` | `direct` | `--k-pd*: <value>; padding-*: max(0px, calc(var(--k-pd*) - var(--k-bdw, 0px)))` | Schema padding represents the visual inset. On the web, border width would otherwise reduce the usable inner space or inflate rendered geometry differently from platforms that draw stroke inside the bounds. |

This pairing matters: compensated padding should be used with a mirrored border width on the same
element, so the generated padding rule has access to `--k-bdw`.

### Thumb `e3`

| Property family | Policy | Default | CSS shape | Reason |
| --- | --- | --- | --- | --- |
| `boxWidth` | `mirrored` | `direct` | `--k-bxw: <value>; width: <value>` | The static Switch structure anchors the unselected thumb by its normal visual center so `thumbShrink` can animate `width` without sliding the thumb before or after the size transition. |

Why Switch needs it:

- Fluent 2 Microsoft uses a visible `1px` track border and still needs the thumb to sit on the
  intended inner geometry.
- iOS 27 Apple uses `borderWidth: 0`, but the same track contract keeps the generated artifacts
  structurally consistent across presets.
- The React Switch measures the rendered track padding and thumb size to compute travel distance, so
  the generated web padding must reflect the final visual inset, not a schema value inflated by web
  border-box behavior.

### Border Radius

`borderRadius` is not a Switch-specific emission override today.

The builder default is:

| Property family | Policy | CSS shape |
| --- | --- | --- |
| `borderRadius` / `borderRadiusRounded` / `borderRadiusPill` / `borderRadiusSquare` | `mirrored` | `--k-bdr: <value>; border-radius: <value>` |

Switch relies on that default as input:

- Track `e2` uses the generated radius class for all radius modes.
- Thumb `e3` uses generated radius classes directly for `pill` and `square`.
- For `rounded`, React Switch does not apply the generated rounded radius class to thumb `e3`.
  Structural CSS computes `--k-swt-tr` on track `e2` from the generated `--k-bdr`, `--k-bdw`, and
  `--k-pd*` variables, then `e3` consumes it by inheritance through `k-swt-e3a-*`.
- When the React Switch renders the `thumbShrink` effect, the internal `x5` visual uses the same
  track-derived rounded radius as `e3`. The effect changes visual dimensions, not the radius
  source.

This is still not a Switch-specific emission override. The web-builder emits the normal mirrored
radius class for the track, and React derives the final visual thumb radius from generated values in
structural CSS.

### Reviewed Properties Without Switch Overrides

These properties are intentionally not overridden for Switch today:

| Property family | Current behavior | Reason |
| --- | --- | --- |
| `boxHeight` | direct CSS `height` | The React Switch already centers vertical geometry through transform/runtime measurement; no height token is needed by structural CSS. |
| `boxColor`, `borderColor` | direct CSS color declarations | Switch structural CSS does not consume color variables. State styling is generated directly by the usual palette classes. |
| `textColor`, `marginLeft`, `shadow`, `boxWidthEmission: token` | no Switch-specific policy | No current Switch structural contract consumes these as token-only variables. |

### Not Style Emission

These Switch decisions are adjacent, but they are not style-emission policy:

- `components.switch.options.activationMotion`: preset-level runtime metadata exported through the
  generated Switch component artifact; React maps it to a Switch-local motion class/variable.
- `k-wow`: showcase-only macro transition used when changing visible geometry controls such as
  scale or radius.
- `stateActivator` classes such as `-s`, `-f`, `-k`, and `-a`: runtime state selector vocabulary,
  documented separately in the interaction-state model.

## TextField

Current scope:

- `textField.elements.e3`, the control shell shared by every structural branch.

### Control `e3`

| Property family | Policy | Default | CSS shape | Reason |
| --- | --- | --- | --- | --- |
| `boxHeight` | `token` | `direct` | `--k-bxh: <value>` | TextField structural CSS consumes the authored height as `min-block-size`, preserving the nominal control geometry while allowing enlarged text to grow without clipping. |

The schema value remains the design-system control height. The web structure changes only how that
height constrains layout: it is a minimum rather than a fixed block size.

## Future Additions

Add other components to this file when a component/element needs a documented emission override or
when a default non-direct emission becomes part of a component-specific structural contract.
