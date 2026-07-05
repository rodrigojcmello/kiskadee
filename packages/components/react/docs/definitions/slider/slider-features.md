# Slider Feature Inventory

This file is the first durable specification for the styled React `Slider`.
It records the V1 behavior, schema slots, artifact options, and known deferrals
so future Slider work can start from a shared document instead of chat history.

Use this document like `switch/switch-features.md`: it is a component contract
inventory, not a Showcase-only usage guide.

## Scope

This document covers the public styled component exported by
`@kiskadee/react-components`.

- Public component: `Slider`.
- Public hook: `useSliderArtifactConfig`.
- Public props/type exports: `SliderProps`, `SliderStatus`,
  `SliderActivationFeedback`,
  `SliderClassNames`, `SliderMark`,
  `SliderMarks`, `SliderValueAnimationOption`, `SliderSnapMotionOption`,
  `SliderThumbCrossingOption`, `SliderClassesMap`, `SliderModeClassesMap`,
  `SliderVariantClassesMap`, and `SliderArtifactConfig`.
- Shared value helper: `RollingNumber`.
- Headless primitive: `HeadlessSlider` from `@kiskadee/react-headless`.
- Current layout scope: horizontal only.
- Current topology: `variant: "standard"` and `mode: "base"`.

Vertical Slider is intentionally out of V1. A vertical control is not only a
rotated horizontal track; it needs separate placement rules for labels, lateral
edge content, value indicators, marks, summaries, and helper content.

This document does not redefine broad architecture. For cross-cutting rules,
prefer the canonical docs:

- [`component-architecture.md`](../component-architecture.md)
- [`schema-option-overrides.md`](../schema-option-overrides.md)
- [`component-style-emission-overrides.md`](../../../../../web-builder/docs/definitions/component-style-emission-overrides.md)
- [`style-emission-policy.md`](../../../../../web-builder/docs/definitions/style-emission-policy.md)

## Public API

### Value And Behavior Props

`Slider` inherits its state and accessibility model from the headless slider
primitive.

| Prop | Current rule |
| --- | --- |
| `valueMode` | Selects `single` or `range`. If omitted, arrays in `value` or `defaultValue` imply `range`; otherwise the Slider is `single`. |
| `value` | Controlled value. A single Slider uses `number`; a range Slider uses `[number, number]`. |
| `defaultValue` | Initial uncontrolled value. Values are normalized to bounds and step. |
| `onValueChange` | Called when the committed semantic value changes. It is not called for no-op changes, disabled controls, or read-only controls. |
| `min` / `max` | Numeric bounds. Defaults are `0` and `100`. If `max <= min`, headless normalizes `max` to `min + step`. |
| `step` | Numeric value grid. Defaults to `1`; invalid or non-positive values fall back to `1`. |
| `disabled` | Blocks pointer and keyboard value changes and removes thumb tab stops. |
| `readOnly` | Keeps the control focusable/readable but blocks value changes. |
| `required` | Projects required state and renders the styled required marker when `label` is present. |
| `status` | Optional projected visual status. Supported values come from `SliderStatus`: `hover`, `pressed`, `focus`, `disabled`, and `readOnly`. `selected` and `filled` are excluded because Slider selection is numeric range state, not a boolean state. |
| `formatValue` | Formats visible value summary and value indicators. Receives the thumb value and thumb index. |
| `getAriaValueText` | Formats `aria-valuetext` for each thumb. |
| `aria-label` / `aria-labelledby` | When no visible `label` is rendered, these inherited props are forwarded to the rendered thumb instead of naming only the wrapper. |
| `thumbAriaLabels` | Optional per-thumb accessible labels: `{ start, end }`. Use this for range sliders when each thumb needs a distinct name. |
| `thumbAriaLabelledBy` | Optional per-thumb accessible label references: `{ start, end }`. This takes precedence over `thumbAriaLabels` for the matching thumb. |
| `thumbCrossing` | Optional per-instance override for range pointer dragging. Supports `"prevent"` and `"swap"`. |

The rendered thumb is a focusable `span` with `role="slider"`,
`aria-orientation="horizontal"`, and `aria-valuemin`, `aria-valuemax`,
`aria-valuenow`, and `aria-valuetext`. Range mode renders two independent
slider thumbs. When a visible `label` exists, each thumb falls back to that
label through `aria-labelledby` unless a per-thumb naming prop overrides it.

`thumbCrossing` affects range sliders only. With `"prevent"`, each thumb is
blocked by the other thumb. With `"swap"`, pointer drag can cross the other
thumb; when that happens, the active thumb switches to the opposite side of the
range and continues following the pointer. The public `value` and
`onValueChange` contract remains ordered as `[lower, upper]`. Keyboard behavior
still uses the `"prevent"` model because `start` and `end` are semantic lower
and upper values, not fixed physical thumb identities. For the same reason,
`thumbAriaLabels.start` and `thumbAriaLabels.end` name the current lower and
upper values.

### Visual And Artifact Props

| Prop | Current rule |
| --- | --- |
| `scale` | Selects generated size classes. Default: `s:md:1`. |
| `emphasis` | Selects the color emphasis bucket. Default: `medium`. |
| `intent` | Selects the Slider intent. Default: `neutral`. |
| `radius` | Per-instance override for generated radius classes. Supported values are `rounded`, `square`, and `pill`. |
| `variant` | Current public variant. Default comes from the component artifact, falling back to `standard`. |
| `mode` | Current public mode inside `standard`. Default comes from the component artifact, falling back to `base`. |
| `label` | Optional field label shown above the control row. |
| `labelAdornment` | Optional inline adornment after the label, such as an info affordance. |
| `helperText` | Optional helper copy below the control row. |
| `marks` | Scale content and visual marker configuration. Supports `false`, `"none"`, `"step"`, or an explicit array of `{ value, label?, icon? }`. `label` is the only source for scale labels, including `min` and `max`. `icon` is supported only on exact `min` and `max` marks. |
| `edgeMarks` | Controls whether rendered marks include edge marks at `min` and `max`. Supports `"include"` and `"exclude"`. |
| `markLabelPlacement` | Controls where `e14` mark labels sit relative to the track. Supports `"auto"`, `"above"`, and `"below"`. |
| `edgeMarkLabelPlacement` | Controls whether labels declared on `min`/`max` marks render as endpoint labels or track labels. Supports `"auto"`, `"endpoints"`, and `"markLabels"`. |
| `edgeMarkLabelAlignment` | Controls how `min`/`max` labels align when rendered as track labels. Supports `"auto"`, `"center"`, and `"inside"`. |
| `valueDisplay` | Controls selected value display: `"none"`, `"tooltip"`, `"summary"`, or `"both"`. |
| `valueAnimation` | Optional per-instance override for how selected values are visually rendered. Supports `"none"` and `"rolling"`. |
| `snapMotion` | Optional per-instance override for thumb position settling after pointer release. Supports `"none"` and `"smooth"`. |
| `activationFeedback` | Optional per-instance override for the schema/artifact activation feedback effect. Supports `false` to disable and `"active"` for static preview. |
| `className` | Merged into the root `e1` slot. |
| `classNames` | Escape hatch for schema element slots `e1` through `e15`. |

`valueDisplay="tooltip"` renders a value indicator near each thumb. The value
indicator includes a fixed structural arrow with a slightly rounded tip that
points toward the track.
`valueDisplay="summary"` renders an out-of-track value summary in the header.
`valueDisplay="both"` renders both surfaces.

`formatValue` owns the value text. `valueAnimation` only changes how selected
values are presented on the visual value surfaces. With `valueAnimation="rolling"`,
the styled Slider uses the shared `RollingNumber` helper for value indicators
and summaries when `formatValue` returns a string or number. If `formatValue`
returns a complex React node, the value is rendered statically. Mark labels,
edge labels, helper text, and accessible value text are not animated by this
option.

`snapMotion` owns the visual position transition from a free drag preview to
the committed `step` value. It is separate from `valueAnimation`: `snapMotion`
moves the thumb, tooltip, and active track after pointer release, while
`valueAnimation` animates the text shown inside value surfaces. `marks` do not
control snapping; `step` controls the committed value grid. Programmatic or
externally controlled `value` changes do not automatically enter the settling
state in this contract.

### Activation Feedback

Slider activation feedback is a schema/artifact effect, following the same
global/component recipe model used by Switch. The styled prop is only a local
override:

- omitted: use the current design system artifact;
- `false`: disable the effect for this instance;
- `"active"`: force a static preview state.

The effect host is `e10`, the thumb wrapper. `e11` remains the thumb inner and
must not own the effect state. This is important for presets such as Fluent 2,
where the wrapper and inner thumb can have independent borders, fills, and
radius values.

Range sliders render two physical `e10` instances. The generated base
activation-feedback classes are shared by the slot, but the active structural
class `k-afxa` is applied per rendered thumb instance. A track click uses the
thumb index chosen by `HeadlessSlider`, so only the thumb that will move gets
the activation feedback. Keyboard value changes do not trigger activation
feedback; the effect represents physical pointer/touch interaction.

## Schema And Artifact Contract

### Elements

Slider uses fifteen canonical schema element slots:

| Element | Meaning |
| --- | --- |
| `e1` | Root field wrapper and projected state scope. |
| `e2` | Optional field label. |
| `e3` | Optional value summary. |
| `e4` | Control row that groups lateral edge content and track. |
| `e5` | Internal lateral edge content wrapper. |
| `e6` | Internal lateral edge icon. |
| `e7` | Internal lateral edge label/value. |
| `e8` | Track / rail. |
| `e9` | Active track / selected interval. |
| `e10` | Thumb / handle wrapper. |
| `e11` | Thumb inner. |
| `e12` | Value indicator / tooltip. |
| `e13` | Mark / visual step marker. |
| `e14` | Mark label. |
| `e15` | Helper text. |

Current Slider topology is variant-driven:

- `variant`: `standard`
- `mode`: `base`

The current schema option values are:

- `valueDisplay`: `none`, `tooltip`, `summary`, `both`
- `valueAnimation`: `none`, `rolling`
- `snapMotion`: `none`, `smooth`
- `thumbCrossing`: `prevent`, `swap`
- `marks`: `none`, `step`
- `edgeMarks`: `include`, `exclude`
- `markLabelPlacement`: `auto`, `above`, `below`
- `edgeMarkLabelPlacement`: `auto`, `endpoints`, `markLabels`
- `edgeMarkLabelAlignment`: `auto`, `center`, `inside`

`snapMotion`, `thumbCrossing`, `marks`, `edgeMarks`, `markLabelPlacement`,
`edgeMarkLabelPlacement`, and `edgeMarkLabelAlignment` are top-level component
options because they describe visual defaults for the component. Consumers can
still override them per instance.

`components.slider.effects.activationFeedback` defines the component-level
activation feedback recipe. When present, the web builder treats `e10` as the
Slider activation-feedback host and emits the effect buckets consumed by the
styled runtime.

### Schema-Owned Layout Spacing

Slider structural CSS may consume schema-emitted variables, but spacing values
belong to schema scales:

- `e3.marginLeft` separates the field label from the value summary.
- `e4.marginTop` separates the header row from the control row.
- `e5.marginLeft` and `e5.marginRight` separate lateral edge content from the
  track.
- `e5.paddingLeft` defines the internal lateral edge content gap. Structural CSS
  consumes it as the `column-gap` between edge items so both `icon -> label` and
  `label -> icon` compositions use the same schema-owned spacing.
- `e8.boxWidth` is consumed structurally as the minimum useful track width.
- `e12.boxHeight` sets the value indicator height.
- `e12.paddingLeft` and `e12.paddingRight` set the value indicator horizontal
  padding.
- `e12.marginBottom` offsets the value indicator above the track. When tooltip
  display is active, structural CSS also adds fixed arrow geometry: a `2px`
  arrow overlap into the tooltip body and a `2px` arrow clearance from the
  thumb.
- `e14.marginTop` offsets mark labels below the track.
- `e14.marginBottom` offsets mark labels above the track.
- `e15.marginTop` separates helper text from the control row.

Do not add gap-like Slider scale attributes for these relationships. Use
margin, padding, or existing box scales, then let structural CSS consume the
generated token in the specific DOM relationship.

### Radius Ownership

Slider radius follows the shared Kiskadee radius model: `rounded`, `pill`, and
`square` are semantic modes selected globally or per instance, while the schema
defines the physical radius value for each element inside each mode.

Runtime precedence is:

1. `Slider` prop `radius`;
2. preset `global.radius`;
3. `DEFAULT_SLIDER_RADIUS`.

The styled Slider currently resolves the selected radius mode for:

- `e8`: track;
- `e9`: active track;
- `e10`: thumb wrapper;
- `e11`: thumb inner;
- `e12`: value indicator / tooltip;
- `e13`: mark.

Do not add per-element radius props such as `trackRadius`, `thumbRadius`, or
`tooltipRadius` only to support showcase experimentation. If a preset wants the
component mode to be `pill` but one Slider element should remain square, the
preset should encode that directly in the element schema by setting that
element's `pill` border radius value to `0`. Likewise, a preset can make the
thumb fully circular, the tooltip softly rounded, and the track square while
still exposing only one public radius mode.

Example:

```ts
e8: {
  // Track is square even when the component radius mode is pill.
  scales: {
    borderRadius: {
      rounded: 2,
      pill: 0,
      square: 0
    }
  }
}

e10: {
  // Thumb wrapper remains circular in pill mode.
  scales: {
    borderRadius: {
      rounded: 12,
      pill: 999,
      square: 0
    }
  }
}
```

This keeps the public contract small: consumers select the radius mode, and the
design system decides what that mode means for each Slider element. Reopen a
per-element radius API only if multiple components need the same runtime
override pattern and schema-owned mode values are not enough.

### Component Artifact

`web-builder` may emit `components/slider.kiskadee.json` with:

- component options: `variant`, `valueDisplay`, `valueAnimation`, `snapMotion`,
  `thumbCrossing`, `marks`, `edgeMarks`, `markLabelPlacement`,
  `edgeMarkLabelPlacement`, and `edgeMarkLabelAlignment`;
- component effects: currently `activationFeedback`;
- variant-local options: currently `standard.options.mode`.

Fallback order for component options:

1. current loaded Slider component artifact;
2. previous loaded Slider component artifact during a provider swap;
3. `global.components.slider`;
4. local defaults from `Slider.class-names.ts`.

The generated class map remains the source of truth for visual styling. The
React component resolves classes from `classesMap.slider` and
`useComponentClassMap("slider", ...)`, then composes structural classes around
that generated map.

## Rendering Model

The styled `Slider` composes the headless slider primitive:

```txt
HeadlessSlider.Root
  optional header
    optional HeadlessSlider.FieldLabel
    optional HeadlessSlider.ValueSummary
  HeadlessSlider.ControlRow
    optional start HeadlessSlider.Endpoint derived from min mark
      optional HeadlessSlider.EndpointIcon from min mark icon
      optional HeadlessSlider.EndpointLabel from min mark label
    HeadlessSlider.Track
      HeadlessSlider.ActiveTrack
      optional HeadlessSlider.Mark list
      optional HeadlessSlider.MarkLabel list
      HeadlessSlider.Thumb index=0
        HeadlessSlider.ThumbInner
      optional HeadlessSlider.Thumb index=1
        HeadlessSlider.ThumbInner
      optional HeadlessSlider.ValueIndicator list
    optional end HeadlessSlider.Endpoint derived from max mark
  optional HeadlessSlider.HelperText
```

Rules to preserve:

- The root is a field wrapper, not a native form input.
- Each thumb owns its own accessible slider semantics.
- The track owns pointer capture and maps pointer position to a value.
- `label` names the control and is connected to thumbs through
  `aria-labelledby`.
- When `label` is omitted, the styled component must not leave the thumbs
  pointing at a non-rendered label. Consumers can provide `aria-label`,
  `aria-labelledby`, `thumbAriaLabels`, or `thumbAriaLabelledBy`.
- `helperText` is connected through `aria-describedby`.
- Edge icons come from exact `min` and `max` marks. They are decorative by
  default, render laterally through `e6`, and should be paintable through
  `currentColor`.
- Marks are visual; they do not become separate interactive controls.
- `classNames.e10` stays attached to each rendered thumb wrapper.
- `classNames.e11` stays attached to each rendered thumb inner.
- `classNames.e13` stays attached to each rendered mark.

## Values, Drag, And Step

Slider values are normalized to `min`, `max`, and `step`.

Pointer interaction uses two phases:

- during drag, the active thumb visually follows the cursor continuously within
  bounds;
- on pointer release, the committed value is rounded to the nearest `step`.

This keeps stepped sliders from feeling locked while still committing values to
the same grid used by keyboard interaction and controlled state.

Keyboard interaction is step-based:

- `ArrowRight` and `ArrowUp` increment by one step.
- `ArrowLeft` and `ArrowDown` decrement by one step.
- `PageUp` increments by ten steps.
- `PageDown` decrements by ten steps.
- `Home` moves to the lower bound, or to the other thumb in range mode when
  needed to preserve ordering.
- `End` moves to the upper bound, or to the other thumb in range mode when
  needed to preserve ordering.

Range mode preserves thumb ordering:

- thumb `0` cannot move above thumb `1`;
- thumb `1` cannot move below thumb `0`;
- clicking the track chooses the nearest thumb, keeping the previous active
  thumb when distances tie.

## Marks And Labels

The track line is `e8`. The thumb wrapper is `e10`, and its visual inner layer
is `e11`. Visual markers on the line are `e13`. Optional text attached to
marker values is `e14`.

`marks="step"` generates one mark per step between `min` and `max`, capped at
101 generated marks. This prevents accidental huge DOM output when a consumer
uses a very small step across a large range.

`edgeMarks` controls whether the rendered visual mark set (`e13`) includes
boundary values:

- `edgeMarks="include"` renders visual marks at `min`, intermediate steps, and
  `max`.
- `edgeMarks="exclude"` renders only intermediate visual marks.

`edgeMarks` is resolved from the component prop first, then from the
schema/artifact option, then from the default `"include"`. It applies after mark
normalization and affects visual marks only. Labels and icons declared on exact
`min` and `max` marks are still available to lateral edge composition and
`edgeMarkLabelPlacement`.

`markLabelPlacement` controls only mark labels (`e14`):

- `markLabelPlacement="below"` places labels below the track using
  `e14.marginTop`;
- `markLabelPlacement="above"` places labels above the track using
  `e14.marginBottom`;
- `markLabelPlacement="auto"` resolves at runtime from the shared
  `isLikelyTouch` interaction environment. Likely-touch environments use
  `above`; otherwise labels use `below`.

This option does not affect lateral edge labels (`e7`), value summaries (`e3`),
or value indicators/tooltips (`e12`).

`edgeMarkLabelPlacement` controls only labels declared on exact `min` and `max`
marks:

- `edgeMarkLabelPlacement="markLabels"` renders those edge labels as track labels
  (`e14`);
- `edgeMarkLabelPlacement="endpoints"` renders those edge labels as lateral
  edge labels (`e7`);
- `edgeMarkLabelPlacement="auto"` resolves at runtime from the shared
  `isCompactViewport` layout environment. Compact viewports use `markLabels`;
  non-compact viewports use `endpoints`.

`edgeMarkLabelAlignment` controls how edge labels align when
`edgeMarkLabelPlacement` resolves to `markLabels`:

- `edgeMarkLabelAlignment="center"` keeps the current centered geometry;
- `edgeMarkLabelAlignment="inside"` aligns the `min` label start to the track
  start and the `max` label end to the track end;
- `edgeMarkLabelAlignment="auto"` resolves at runtime from the shared
  `isCompactViewport` layout environment. Compact viewports use `inside`;
  non-compact viewports use `center`.

This is not collision handling for all labels. Intermediate mark labels remain
centered on their marks. If a design system chooses `center` and needs extra
room for large edge labels, reserve that space outside the Slider, such as on a
wrapper or card content container.

Intermediate mark labels always render as track labels (`e14`). `marks` remains
the single source for scale labels and edge icon content:

```tsx
<Slider
  min={0}
  max={100}
  marks={[
    { value: 0, label: '0%', icon: '-' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%', icon: '+' }
  ]}
/>
```

Explicit marks accept:

```ts
type SliderMark = {
  value: number;
  label?: ReactNode;
  icon?: ReactNode;
};
```

`marks[].icon` is consumed only when `value` is exactly `min` or `max`.
Intermediate mark icons are intentionally ignored by the styled `Slider`.
The edge icon always renders laterally in `e6`. The edge label follows
`edgeMarkLabelPlacement`: `endpoints` renders it laterally in `e7`,
`markLabels` renders it on the track in `e14`, and `auto` chooses between those
two placements from the shared compact viewport environment.

Only marks inside `[min, max]` render. A mark is projected as selected when it
falls inside the active interval. In single mode, that interval is `min` to the
current thumb value. In range mode, it is thumb `0` to thumb `1`. Selected marks
also receive the projected `selected` state classes on `e13`, so presets can
style `e13.selected.rest` independently from the unselected mark color.

### Selected Mark Color

`e13` owns mark color. The normal mark color comes from `e13.boxColor.rest`.
The selected mark color comes from `e13.boxColor.selected.rest`.

Use this distinction for the two common visual treatments:

- To hide selected marks on the active range, set `e13.selected.rest` to the
  same color as the active track (`e9.rest`).
- To keep selected marks visible on the active range, set `e13.selected.rest`
  to a contrasting color, such as white on a dark active track.

Example:

```ts
boxColor: {
  primary: {
    medium: {
      rest: markOnInactiveTrack,
      selected: {
        rest: markOnActiveTrack
      }
    }
  }
}
```

Selected mark state is projected on the mark element itself. Slider hover,
focus, and pressed states are projected on the Slider root. Because of that,
avoid adding root-inherited mark interaction colors such as `hover: ref(...)`,
`focus: ref(...)`, or `pressed: ref(...)` on `e13` unless the preset explicitly
wants root interaction to recolor all marks. Those inherited rules can override
`e13.selected.rest` while the Slider root is hovered. If a preset only needs a
stable mark color, prefer `rest`, `selected.rest`, and `disabled`.

Visual mark shape belongs to preset schema, not to React logic. A preset can
make `e13` look like a dot, a vertical tick, or another simple marker by
changing generated width, height, border, radius, and color. React still treats
all of those as the same `e13` mark element.

## Geometry, Radius, And Focus

The current structural branch is horizontal `standard/base`.

Preserve these rules:

- `e8` is the positioning plane for `e9`, `e10`, `e12`, `e13`, and `e14`.
- `e9` fills the active range through `--k-sld-start` and `--k-sld-end`.
- `e10` centers on `--k-sld-value` and owns focus semantics.
- `e11` is centered inside `e10` and is pointer-inert.
- `e12` centers on the corresponding thumb position and is pointer-inert.
  It owns a fixed-size structural arrow through `::after`; the arrow inherits
  the tooltip background, has a fixed softened tip, overlaps the tooltip body by
  `2px`, and includes a fixed `2px` clearance from the thumb. Arrow geometry is
  not schema-customizable yet.
- `e13` uses `--k-sld-mark` for its value position.
- `e14` uses `--k-sld-mark` for its label position.
- Keyboard-visible focus is drawn on each thumb through global focus variables.

Edge marks and Slider layout spacing need generated geometry variables so the
structural CSS can avoid hardcoding preset sizes. The web-builder policy emits:

- `slider.variants.standard.elements.e8.boxHeight` into `--k-bxh`;
- `slider.variants.standard.elements.e8.boxWidth` into `--k-bxw`;
- Slider layout margins into `--k-mgt`, `--k-mgr`, `--k-mgb`, or `--k-mgl`
  when structural CSS needs conditional spacing;
- `slider.variants.standard.elements.e5.paddingLeft` into `--k-pdl` for the
  endpoint internal content gap;
- `slider.variants.standard.elements.e13.boxWidth` into `--k-bxw`.

Structural CSS uses those variables to clamp `e13` by the larger of half the
track height and half the mark width, position value indicators and mark labels,
separate endpoint content, and apply header/helper spacing only when the related
DOM composition exists.

For the durable web-builder rule, see:

- [`component-style-emission-overrides.md`](../../../../../web-builder/docs/definitions/component-style-emission-overrides.md)
- [`style-emission-policy.md`](../../../../../web-builder/docs/definitions/style-emission-policy.md)

## Cursor And Touch Policy

Current rules:

- Interactive roots use `cursor: default`.
- The track and thumbs use pointer affordance locally because they are direct
  drag targets.
- Disabled and read-only roots use `cursor: not-allowed` and inherit that cursor
  through descendants.
- The root disables text selection and browser tap highlight.
- The track and thumbs use `touch-action: none` so drag remains owned by the
  Slider interaction model.

## Current Internal Structural Names

These names are implementation details, but they are useful when auditing
generated markup, structural CSS, or regressions.

| Name | Meaning |
| --- | --- |
| `k-sld` | Slider structural namespace/root. |
| `k-sld-e1-a` | Root field wrapper. |
| `k-sld-x1-a` | Internal header wrapper for label and value summary. |
| `k-sld-e2-a` | Field label. |
| `k-sld-e3-a` | Value summary. |
| `k-sld-e4-a` | Control row. |
| `k-sld-e5-a` | Internal lateral edge content wrapper. |
| `k-sld-e6-a` | Internal lateral edge icon. |
| `k-sld-e7-a` | Internal lateral edge label/value. |
| `k-sld-e8-a` | Track / rail. |
| `k-sld-e9-a` | Active track / selected interval. |
| `k-sld-e10-a` | Thumb / handle wrapper. |
| `k-sld-e11-a` | Thumb inner. |
| `k-sld-e12-a` | Value indicator / tooltip. |
| `k-sld-e13-a` | Mark / visual step marker. |
| `k-sld-e14-a` | Mark label. |
| `k-sld-e14c-a` | Start edge mark label aligned inside the track. |
| `k-sld-e14d-a` | End edge mark label aligned inside the track. |
| `k-sld-e15-a` | Helper text. |

The structural branch registry currently uses `a` for the single public Slider
structure. The suffix does not create a public variant or mode.

## Public Contracts Vs Internal Details

### Public Contracts

- `Slider` as the single public styled component.
- `useSliderArtifactConfig` as the component-local artifact hook.
- `SliderProps` public props listed in this document.
- Headless slider semantics: focusable thumbs with `role="slider"`,
  controlled/uncontrolled value, `disabled`, `readOnly`, and keyboard support.
- Schema elements `e1` through `e15`.
- Current schema options and values for `variant`, `mode`, `valueDisplay`,
  `valueAnimation`, `snapMotion`, `thumbCrossing`, `marks`, `edgeMarks`,
  `markLabelPlacement`, `edgeMarkLabelPlacement`, and
  `edgeMarkLabelAlignment`.
- Generated artifacts and class maps as the source of truth for visual tokens.
- Current horizontal-only contract.

### Internal Details

- Exact structural class names.
- Internal header wrapper `x1`.
- Drag preview state shape and pointer-capture implementation details.
- The current cap for generated step marks.
- The current edge-mark clamp formula, as long as the public visual behavior and
  emission contract remain intact.

Internal details can change, but only if the public behavior and schema/artifact
contracts remain intact or are explicitly migrated.

## Deferred Areas

These areas are intentionally not part of the current V1 contract:

- vertical orientation;
- chart or histogram overlays behind the track;
- built-in numeric inputs attached to one or both thumbs;
- dedicated mark placement modes beyond the current clamped track geometry;
- built-in value label placement modes beyond `valueDisplay`;
- special collision handling when two range value indicators overlap;
- preset-specific source evidence for Slider in official design systems.

Those features are valid follow-up candidates, but they should be added through
schema/artifact decisions rather than one-off React-only props.
