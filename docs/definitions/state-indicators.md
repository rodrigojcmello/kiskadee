# State indicators

Status: canonical cross-package presentation contract.

A state indicator is optional, decorative anatomy owned by its component. It reinforces a state
without creating another control, interaction model, public component, Effect, or Provider. Each
component names the state it represents: a Button uses selection; a text input can use focus.
These meanings must not be inferred from a shared color or shape.

## Ownership and availability

Core defines the optional anatomy and its supported recipes. Presets author dimensions, placement
distances, colors, radii, and state deltas. Builders publish classes and recipe coverage; platform
components consume them without inventing missing values. A complete published recipe establishes
availability. A component may separately restrict the default use of that recipe to particular
compositions and allow an instance override. An override never supplies an unavailable recipe or
activates a semantic state by itself.

Keep an authored indicator mounted across interaction-state changes. Its state map may author only
the active state, with no Rest paint. Omitted Hover, Focus, or Pressed deltas must preserve the active
state's paint. Do not manufacture transparent Rest entries or duplicate active-state colors solely
to complete a matrix. Relaxing Rest requirements must be local to the indicator contract, not global.

An unavailable control suppresses its indicator without erasing the stored semantic value. Disabled,
Pending, and interaction locks take precedence over selection paint. Re-enabling the control restores
the indication of its current state. This rule does not remove independent keyboard focus, including
focus on an aria-disabled control. Component-specific terminal projections must follow the same rule.

## Geometry and accessibility

Overlay indicators do not participate in flow: changing visibility or placement must preserve the
host's border-box, padding, reference height, and content position. Compensate the host's actual
border when anchoring the indicator. Never derive geometry from an inspection delta.

An internal indicator paints over the host's produced surface; an external indicator paints over
the surrounding surface. Presets author contrast against each actual background using the
ordinary palette coordinates. Position must not be encoded by substituting another intent,
emphasis or Surface Context. When a single palette cannot represent both backgrounds, the
component may select alternative Schema element recipes for the same rendered indicator rather
than introduce a generic palette axis, following
[alternate element recipes for one rendered part](./composition-strategies.md#alternate-element-recipes-for-one-rendered-part).
Such local recipes retain the actual ambient context and
host intent and emphasis; the host's published content context remains authoritative for its
other descendants.

The indicator is hidden from assistive technology, receives no pointer events, and has no focus
stop. The host retains its native semantics, state, ref, events, and focus ring. Selection and focus
may be visible simultaneously.

An external overlay can be clipped by an ancestor or extend its scrollable overflow even though it
does not change the host box. Consumers reserve composition clearance. A component must not add
padding to itself or use a portal to conceal this layout constraint.

## Button implementation

Button is the first implementation. Optional `e11` and `e12` author the inside and outside recipes
of one short bottom-centered line. The Button's `controlState` owns activation; focus alone does
not select it. Each element has ordinary scales and `palettes`, including `onSubtle` and `onVivid`.
The placement option selects one complete recipe for one DOM element. Both palettes receive the
actual Button intent, emphasis, theme and ambient context. The internal recipe accounts for the
Button's own surface at those coordinates, while the external recipe accounts for the surrounding
surface. Neutral foreground references use Standard only. This selection does not change the
context provided to other descendants.

The default Fluent placement is inside. Its shared authoring helper selects the segment's brand
signal or contrast inversion over the actual host surface; destructive and positive Buttons do not
recolor the signal by intent. All numerical choices are preset-owned Kiskadee extensions.

Button `options.indicatorScope` chooses automatic use in `all` or `stacked` compositions. Omission
preserves `all`; Fluent authors `stacked`. The instance `indicator` prop follows the policy when
omitted, bypasses only that policy when true, and suppresses the anatomy when false. Policy uses
the actual rendered layout, including any horizontal fallback from a stacked request.

Indicator width remains a literal preset-authored value per size. A reference Button may guide
manual calibration, but no build or runtime formula derives nominal width from icon geometry or
measurement. Structural CSS may shrink the line to preserve authored horizontal safety insets in
a narrow host. It never expands beyond the nominal value or enlarges the host to fit the line.

Activation Feedback owns a separate clipped paint viewport when this anatomy is available, leaving
the host's overflow available to the indicator. Progress, Badge, Group dividers, and focus retain
their existing ownership.

See the [Button indicator contract](../../packages/components/react/docs/definitions/button/state-indicator.md)
for the public API and Web structure. Select, TextField, and other components must document their
own state and geometry when they adopt this definition; their existing implementations are not
migrated by the Button delivery.
