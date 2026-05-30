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

## Switch

Current scope: `switch.variants.standard.elements.e2`, the visual track.

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

Why Switch needs it:

- Fluent 2 Microsoft uses a visible `1px` track border and still needs the thumb to sit on the
  intended inner geometry.
- iOS 26 Apple uses `borderWidth: 0`, but the same track contract keeps the generated artifacts
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
- For `rounded`, React Switch derives the rendered thumb radius from the generated track radius
  variable and the rendered track block inset (`border + padding`), then projects that value as
  `--k-swt-tr` on the shared visual wrapper. The track values still come from normal generated
  mirrored/compensated CSS; the runtime only bridges the sibling DOM boundary.
- When the React Switch renders the `thumbSize` effect, the internal `x5` visual uses the same
  projected rounded radius as `e3`. The effect changes visual dimensions, not the radius source.

This is still not a Switch-specific emission override. The web-builder emits the normal mirrored
radius class, and React applies or derives the final visual thumb radius from generated values.

### Reviewed Properties Without Switch Overrides

These properties are intentionally not overridden for Switch today:

| Property family | Current behavior | Reason |
| --- | --- | --- |
| `boxWidth`, `boxHeight` | direct CSS `width` / `height` | The React Switch measures the rendered DOM to compute thumb travel; no structural CSS variable is needed. |
| `boxColor`, `borderColor` | direct CSS color declarations | Switch structural CSS does not consume color variables. State styling is generated directly by the usual palette classes. |
| `textColor`, `marginLeft`, `shadow`, `boxWidthEmission: token` | no Switch-specific policy | No current Switch structural contract consumes these as variables. |

### Not Style Emission

These Switch decisions are adjacent, but they are not style-emission policy:

- `components.switch.options.activationMotion`: preset-level runtime metadata exported through
  `global.kiskadee.json`; React maps it to a Switch-local motion class/variable.
- `k-wow`: showcase-only macro transition used when changing visible geometry controls such as
  scale or radius.
- `stateActivator` classes such as `-s`, `-f`, `-k`, and `-a`: runtime state selector vocabulary,
  documented separately in the interaction-state model.

## Future Additions

Add other components to this file when a component/element needs a documented emission override or
when a default non-direct emission becomes part of a component-specific structural contract.
