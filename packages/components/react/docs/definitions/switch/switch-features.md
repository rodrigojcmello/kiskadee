# Switch Feature Inventory

This file is a reverse specification for the current styled React `Switch`.
It records the features and preservation rules that already exist in the
component so future work can reason from a single document instead of chat
history or scattered issues.

Use this format as an experiment for future components: the ideal version may
start as a feature inventory for an existing component, then become a
before-implementation specification for new components.

## Scope

This document covers the public styled component exported by
`@kiskadee/react-components`.

- Public component: `Switch`.
- Public hook: `useSwitchArtifactConfig`.
- Public props/type exports: `SwitchProps`, `SwitchStatus`,
  `SwitchClassNames`, `SwitchElementName`, `SwitchLabelPosition`, and
  `SwitchArtifactConfig`.
- There is no separate public `SwitchMotion` component in the current contract.
- Runtime motion is an internal `Switch` effect path, enabled by default and
  disabled per instance with `motion={false}`.

This document does not redefine broad architecture. For cross-cutting rules,
prefer the canonical docs:

- [`motion-strategy.md`](../motion-strategy.md)
- [`effect-runtime-strategy.md`](../effect-runtime-strategy.md)
- [`switch-label-and-control-text.md`](./switch-label-and-control-text.md)
- [`switch-geometry.md`](./switch-geometry.md)
- [`switch-cursor-policy.md`](./switch-cursor-policy.md)
- [`switch.schema-rules.md`](../../../../../presets/docs/definitions/schema-rules/switch.schema-rules.md)

## Public API

### State And Behavior Props

`Switch` inherits its semantic state model from the headless switch primitive.

| Prop | Current rule |
| --- | --- |
| `controlState` | Controlled boolean state. |
| `defaultControlState` | Initial uncontrolled state. Defaults to `false` through the headless state hook. |
| `onControlStateChange` | Called when the semantic state changes. It is not called for no-op changes, disabled controls, or read-only controls. |
| `status` | Optional projected visual status. Supported values come from `SwitchStatus`: `hover`, `pressed`, `focus`, `disabled`, and `readOnly`. `selected` and `filled` are excluded because selection is owned by `controlState`. |
| `disabled` | Disables the native input and blocks state changes, drag, and activation feedback. |
| `readOnly` | Keeps the control focusable/readable, blocks state changes, drag, and activation feedback, and sets `aria-readonly`. |
| `required`, `name`, `value` | Forwarded to the native checkbox input. |
| `inputProps` | Forwards allowed input props to the internal native input, with Kiskadee preserving ownership of `type`, `role`, `checked`, `disabled`, `readOnly`, `required`, `name`, `value`, `aria-checked`, and `id`. |

The rendered input is a native checkbox with `role="switch"` and
`aria-checked` synchronized to `controlState`. If no `id` is provided, the
headless root generates one and connects the wrapping label to the input.

### Visual And Artifact Props

| Prop | Current rule |
| --- | --- |
| `scale` | Selects generated size classes. Default: `s:md:1`. |
| `emphasis` | Selects the color emphasis bucket. Default: `medium`. |
| `intent` | Selects the Switch intent. Default: `neutral`. |
| `radius` | Per-instance override for the component artifact/global radius. Supported values are `rounded`, `square`, and `pill`. |
| `variant` | Current public variant. Default: `standard`. |
| `mode` | Current public mode inside `standard`. Default: `base`. |
| `labelPosition` | Places the optional label before or after the visual control. Default: `start`. |
| `motion` | `false` disables the runtime motion path. Any other value keeps runtime motion eligible. |
| `thumbShrink` | `false` disables the thumb-shrink effect for the instance. Any other value keeps artifact-driven thumb size eligible. |
| `icons` | Optional decorative thumb icons by control state: `{ rest?: ReactNode; selected?: ReactNode }`. Icons must be paintable through `currentColor`. |
| `className` | Merged into the root `e1` slot. |
| `classNames` | Escape hatch for the schema element slots `e1` through `e6`. |

`emphasis="low"` is the Switch treatment for strong local surfaces such as a
primary Showcase card. It keeps the same intent semantics and adapts contrast
inside the existing emphasis bucket; it is not a dark-mode switch and does not
create a new public emphasis value.

When a Switch is shown inside a Card surface in the Showcase, the Card owns the
container surface and the Switch keeps its own component axes. Strong or dark
Card surfaces should usually render the child Switch with `emphasis="low"`;
light/base/tonal Card surfaces can keep the Switch at `emphasis="medium"`.
This is a contextual Showcase composition rule, not an automatic global
parent-to-child emphasis formula.

`radius`, `activationMotion`, and `controlTextVisibility` are component
artifact options. Props may override only the options intentionally exposed in
`SwitchProps`.

## Schema And Artifact Contract

### Elements

Switch uses six canonical schema element slots:

| Element | Meaning |
| --- | --- |
| `e1` | Root label/control wrapper and projected state scope. |
| `e2` | Track / surface. |
| `e3` | Thumb / handle. |
| `e4` | Optional label text. |
| `e5` | Optional control-state text. |
| `e6` | Optional thumb icon. |

Current Switch topology is variant-driven:

- `variant`: `standard`
- `mode`: `base`

The current schema option values are:

- `radius`: `rounded`, `square`, `pill`
- `activationMotion`: `standard`, `slow`
- `controlTextVisibility`: `none`, `largeOnly`, `always`

### Component Artifact

`web-builder` may emit `components/switch.kiskadee.json` with:

- component options: `variant`, `radius`, `activationMotion`,
  `controlTextVisibility`;
- component effects: currently `thumbShrink?: true`;
- variant-local options: currently `standard.options.mode`.

`useSwitchArtifactConfig` loads this component artifact by current design system
and artifact version. While provider data changes, it preserves the previously
loaded component artifact until the next one resolves, so a manifest swap does
not immediately drop Switch metadata.

Fallback order for component options:

1. current loaded Switch component artifact;
2. previous loaded Switch component artifact during a provider swap;
3. `global.components.switch`;
4. global radius for `radius`;
5. local defaults from `Switch.class-names.ts`.

The generated class map remains the source of truth for visual styling. The
React component resolves classes from `classesMap.switch` and
`useComponentClassMap('switch', ...)`, then composes structural classes and
effect-specific patches around that generated map.

## Rendering Model

The styled `Switch` composes the headless switch primitive:

```txt
HeadlessSwitch.Root
  SwitchControlSide
    HeadlessSwitch.Track
      HeadlessSwitch.Thumb or SwitchRuntimeMotionThumb
        optional HeadlessSwitch.Icon
  optional HeadlessSwitch.Label
```

Rules to preserve:

- The root is a label wrapper and the input is owned by the headless primitive.
- The visual track and thumb are `aria-hidden`; the native input owns the
  accessible switch semantics.
- `label` is the control name, not the on/off value.
- `controlText` is optional visual state text derived from `controlState`.
- The wrapper around `controlText` plus the visual control is internal React DOM,
  not a schema element and not part of the headless API.
- `classNames.e3` stays attached to the single rendered thumb. That thumb is
  the visual element, the measurement target, and the local effect host.
- `classNames.e6` stays attached to decorative thumb icons rendered inside
  `e3`. The icon slot must not affect thumb measurement or motion geometry.

Interactive Showcase compositions may place a Switch inside a clickable Card.
In that case, the child Switch still owns the boolean selected state. The parent
CardAction should not mirror that state as its own selected state unless the
card itself is the selectable item.

## Thumb Icons

`icons` accepts optional visual glyphs for the boolean control states:

- `icons.rest` is shown when `controlState` is `false`.
- `icons.selected` is shown when `controlState` is `true`.
- missing state icons render no glyph for that state.
- the icons are decorative; the native input and `label` still own the
  accessible switch name.
- icons render only when the resolved switch contract has `e6` or the consumer
  supplies an explicit `classNames.e6` style hook.

Switch icons follow the Button/Tabs icon color policy:

- schema `e6.textColor` emits CSS `color`;
- icons must be monochrome and use `currentColor` through SVG `fill`, SVG
  `stroke`, or font glyph color inheritance;
- the builder does not rewrite SVG `path`, `fill`, or `stroke` attributes;
- multicolor SVGs, hardcoded SVG paints, raster images, and automatic asset
  recoloring are outside the current contract.

`e6.boxWidth` and `e6.boxHeight` define the icon slot. Structural CSS centers
the slot inside the thumb and normalizes direct `svg` children to fill the slot.
It must not hardcode semantic icon colors.

Current first-party Switch presets define `e6`. Future presets that omit `e6`
are treated as not supporting thumb icons.

## States

Switch projects visual states through the root state class model:

- `hover`
- `pressed`
- `selected`
- `focus`
- `focusVisible`
- `disabled`
- `readOnly`

`selected` is derived from `controlState`. `focusVisible` is a qualifier used for
keyboard-visible focus styling.

The component must preserve both controlled and uncontrolled state:

- uncontrolled state starts from `defaultControlState`;
- controlled state follows `controlState`;
- `onControlStateChange` is the semantic change callback in both modes;
- disabled and read-only controls do not change state.

## Label And Control Text

`label` and `controlText` are separate concepts.

- `label` describes what the control changes.
- `controlText` describes the current boolean value.
- `labelPosition="start"` moves the label before the visual control with
  structural ordering.
- `labelPosition="end"` leaves the label after the visual control.

`controlText` accepts `{ on, off }`, but visibility is controlled by the Switch
component artifact:

- `none`: never render visual control text.
- `largeOnly`: render visual control text only at the large breakpoint
  (`bp:lg:1`) and above.
- `always`: render visual control text whenever `controlText` is provided.

For the durable label/control-text distinction, see
[`switch-label-and-control-text.md`](./switch-label-and-control-text.md).

## Runtime Motion

Runtime motion is a feature of `Switch`, not a separate public component.

Current rules:

- The runtime motion module is lazy-loaded through
  `useSwitchRuntimeMotionEffect`.
- Runtime motion is enabled by default and disabled with `motion={false}`.
- Until the module is available, the component can render through the static
  CSS path.
- The runtime module owns horizontal thumb movement with `motion/react`.
- `activationMotion` maps to runtime spring profiles:
  - `standard`: stiffer spring.
  - `slow`: slower spring.
- The motion path measures track/thumb geometry and writes local CSS variables
  for thumb travel.
- Measurement updates on geometry-key changes, `ResizeObserver`, and window
  resize.
- RTL direction is supported by resolving inline direction at runtime.

Runtime motion also enables drag:

- The thumb can be dragged on the x axis.
- Drag is disabled when the switch is disabled or read-only.
- Drag uses the measured track/thumb travel as its constraint.
- Drag preview may project a temporary visual `controlState` before semantic
  state changes.
- Release position and velocity decide the next semantic state.
- A drag suppresses the next click for a short window so the label click does
  not immediately undo the drag result.
- Drag cancels activation feedback once the user starts moving the thumb.

## Static Path

The static path is the lightweight fallback and opt-out path.

Current rules:

- `motion={false}` keeps the component on the static path.
- Static thumb movement is CSS-owned through the selected-state structural
  modifier.
- The static path keeps the same semantic state and generated class-map
  contract as the motion path.
- Static selected movement supports RTL through the root direction variable.

Static does not mean "no visual transition". It means the component does not
load or run a dedicated runtime animation/gesture engine for thumb movement.

## Thumb Shrink Effect

`thumbShrink` is an artifact-driven effect for presets where the off/rest visual
thumb should be smaller than the selected thumb.

Current rules:

- The effect is eligible only when the Switch component artifact says
  `effects.thumbShrink === true`.
- The effect can be disabled per instance with `thumbShrink={false}`.
- The effect module is lazy-loaded through `useSwitchThumbShrinkEffect`.
- The Switch renders a stable `e3` thumb host in both normal and thumb-shrink
  modes.
- In thumb-shrink mode, internal `x5` receives generated visual classes and
  thumb-shrink effect classes.
- The `e3` thumb remains the stable target for runtime motion, drag measurement,
  activation feedback hosting, and escape-hatch class names.
- Off/rest effect dimensions belong in schema. Runtime must not decide per-scale
  effect availability.

For preset authoring requirements, see
[`switch.schema-rules.md`](../../../../../presets/docs/definitions/schema-rules/switch.schema-rules.md).

## Activation Feedback

Activation feedback is a schema/global effect combination:

- The shared effect library comes from `global.effects.activationFeedback`.
- The Switch default recipe comes from `components.switch.effects.activationFeedback`.
- Switch enables the effect only when the generated `e3` class map contains the
  resolved activation-feedback profile class.
- The effect module is lazy-loaded through `useSwitchActivationFeedbackEffect`.
- Interactive feedback starts from a direct click/tap activation inside the
  visual track area.
- Keyboard activation does not start activation feedback. Space may still toggle
  the native switch state for accessibility, but it must not display the AF
  layer. Keyboard feedback is represented by the focus ring and the ordinary
  pressed state, not by touch/click activation feedback.
- Feedback is canceled on pointer cancel, blur, unmount, and drag movement.
- Disabled and read-only switches do not start feedback.
- `activationFeedback="active"` is reserved for static preview surfaces that
  need the AF layer held on continuously.

Current visual behavior:

- The track may allow overflow so the feedback layer can extend outside the
  rail.
- The thumb carrier hosts the feedback state layer.
- When `thumbShrink` renders internal `x5`, the feedback host remains `e3` but
  the outline geometry is measured from the visual `x5` box.
- `paint: "field"` uses `size` as outward field expansion.
- `paint: "outline"` uses `size` as the outline width and follows the measured
  thumb box/radius.

## Geometry, Radius, And Focus

The Switch owns local structural geometry that adapts generated schema classes
to the actual DOM.

Preserve these rules:

- `rounded`, `square`, and `pill` are public radius modes.
- `pill` and `square` use explicit generated radius classes for track and
  thumb.
- `rounded` uses the generated track radius and computes the thumb radius from
  track variables, padding, and border width.
- Do not apply the generated rounded `e3` radius value directly as-is; the
  thumb must use the branch-local `k-swt-e3a-*` structural modifier so it
  consumes the track-derived radius.
- The runtime motion path may measure track/thumb travel, but it must not
  project rounded radius values.
- Keyboard-visible focus is drawn on the rendered track because the native input
  is visually hidden.
- Focus ring structural CSS consumes the global focus contract:
  `--k-focus-color`, `--k-focus-width`, and `--k-focus-offset`.

For detailed radius/focus rules, see
[`switch-geometry.md`](./switch-geometry.md).

## Cursor And Touch Policy

Switch cursor behavior is component-specific.

Current rules:

- Interactive roots use `cursor: default`.
- Internal visual slots inherit the root cursor.
- Disabled and read-only roots use `cursor: not-allowed`.
- The root disables text selection and browser tap highlight.
- The runtime motion thumb uses `touch-action: pan-y` so horizontal drag can be
  owned by the motion runtime while vertical page panning remains available.

For the cursor rationale, see
[`switch-cursor-policy.md`](./switch-cursor-policy.md).

## Current Internal Structural Names

These names are implementation details, but they are useful when auditing
generated markup, structural CSS, or regressions.

| Name | Meaning |
| --- | --- |
| `k-swt` | Switch structural namespace/root. |
| `k-swt-e1-a` | Root structural branch. |
| `k-swt-e2-a` | Track. |
| `k-swt-e3-a` | Stable thumb host, motion measurement target, and local effect host. |
| `k-swt-e4-a` | Label text. |
| `k-swt-e5-a` | Control text. |
| `k-swt-m` | Runtime motion gate. |
| `k-swt-x2-a` | Internal wrapper grouping control text and visual control. |
| `k-swt-x3-a` / `k-swt-x4-a` | Internal off/on control-text parts. |
| `k-swt-x5-a` | Internal visual thumb layer for `thumbShrink`. |
| `k-swt-x6-a` | Internal visual-control wrapper. |

The structural branch registry currently uses `a` for the single public Switch
structure and `m` for the runtime motion gate. These suffixes do not create
public variants or modes.

## Public Contracts Vs Internal Details

### Public Contracts

- `Switch` as the single public styled component.
- `useSwitchArtifactConfig` as the component-local artifact hook.
- `SwitchProps` public props listed in this document.
- Headless switch semantics: native checkbox input, `role="switch"`,
  controlled/uncontrolled state, `disabled`, `readOnly`, and form props.
- Schema elements `e1` through `e5`.
- Current schema options and values for `variant`, `mode`, `radius`,
  `activationMotion`, and `controlTextVisibility`.
- Generated artifacts and class maps as the source of truth for visual tokens.

### Internal Details

- Exact structural class names.
- Internal wrappers `x2`, `x3`, `x4`, and `x6`.
- Lazy module names and loader implementation details.
- Motion spring constants, drag threshold, velocity projection, and click
  suppression duration.
- The current choice of `motion/react` as the runtime animation library.

Internal details can change, but only if the public behavior and schema/artifact
contracts remain intact or are explicitly migrated.

### Pending Or Follow-Up Areas

- This file does not define a new test plan. It identifies the highest-risk
  public behaviors that future tests should cover: controlled/uncontrolled
  state, disabled/read-only blocking, motion opt-out, control text visibility,
  thumb-shrink artifact gating, activation feedback gating, and radius behavior.
- Activation feedback now uses profile-local `size`; `paint: 'field'` treats it
  as field expansion and `paint: 'outline'` treats it as outline width.
- Future components may use this inventory format before implementation instead
  of after implementation.
