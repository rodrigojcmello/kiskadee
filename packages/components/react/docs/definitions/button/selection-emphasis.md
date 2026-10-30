# Button selection presentation

Status: canonical Web composition contract.

`selectionEmphasis` complements `controlState`; it never creates selection. Its precedence is the
explicit Button prop, the preset option and `lowest`. Fluent and Material publish `lowest` as their
default for all layouts. The ordinary `emphasis` prop continues owning the unselected appearance.

`selectionIntent?: ButtonIntent` chooses the selected paint's intent. Precedence is the explicit
Button prop, `options.selectionIntent`, then the base `intent`. The preset option accepts system
intents only; Fluent and Material omit it. Unselected Buttons retain their base intent, even when
an alternative selection intent is configured.

| Level | Selected control paint | Indicator |
| --- | --- | --- |
| `lowest` | Base emphasis Selected, in the effective selection intent | No |
| `low` | Base emphasis Selected, in the effective selection intent | Yes |
| `medium` | High normal states, in the effective selection intent | No |
| `high` | High normal states, in the effective selection intent | Yes |

High is literal, including when the base emphasis is Highest. Rest describes the resting source,
not a frozen control: normal High Hover, Focus, Pressed and terminal recipes continue to apply.
Geometry and layout do not change. Without selection the original base appearance returns. The
two lower levels still depend on the base emphasis; they do not promise a light background.

For example, a Neutral Low Button with `selectionIntent="primary"` and
`selectionEmphasis="low"` consumes Primary Low Selected plus its indicator while selected. A
Primary Button may explicitly select Neutral, Positive or any other available Button intent.
The framework does not filter pairs or infer a complementary color. External `brand.*` requests
still require the compatible BrandPack boundary and published resources used by ordinary Button
intents. Missing or incompatible brand resources fail visibly without substituting a system
intent; this API does not supply new brand recipes.

## Semantic state and paint source

The native control, `controlState`, ARIA state and root `-s` remain selected at every level. The
existing `toggle` contract still determines automatic `aria-pressed`; no manual ARIA override is
needed for High Rest. Group overlap priority and indicator reference selectors keep that same
state owner. React never turns
selection off or requires a manual ARIA override to obtain High Rest.

The Builder's optional `classMap.selectionRest` projection reuses existing normal-state High
palette classes and non-Selected effects. It contains no duplicate CSS, geometry or new palette
axis; surfaced icon regions retain their own color and emphasis domain. React consumes opaque
classes and checks published intent/High coverage for the root and visible painted parts. It does not parse CSS or
shortened class names. Both combined and split class-map loading preserve the projection.

The effective paint intent is resolved once for the surface, label, icon, disclosure, effects and
produced Surface Context. Ordinary palette and effect classes are replaced, not accumulated from
both intentions. The indicator resolves its own complete recipe against that effective appearance.
High selection paint uses normal High Surface Context and activation feedback, without Selected
paint/effects leaking through the semantic root marker.

Missing required part coverage for a system selection intent restores the base intent for the
entire selected recipe and emits a development warning; partial mixed-intent paint is not allowed.
Within the resolved intent, missing High coverage keeps Selected at the base emphasis and emits
the existing warning. A compatible brand recipe may use its own Selected fallback, never a system
substitute. Indicator requests independently require complete paint/size/radius coverage for the
effective appearance. No missing value is invented, and sparse Selected deltas do not make an
otherwise complete ordinary recipe unavailable.

Disabled, Pending and interaction locks retain existing precedence, block activation and hide the
indicator without clearing selection. Restoring availability restores the selected presentation.

In `Button.Group`, the group's shared `intent` remains the base intent and owns its Rest frame.
Each member may choose `selectionIntent` without changing its siblings. All dividers adjoining a
selected member remain hidden regardless of selected intent or emphasis; frame omission over
normal High paint retains its existing contract.

## Showcase inspection

The Rich Text Editor exposes independent Button intent, Emphasis, Selection intent and Selection
emphasis controls for both toolbar rows, preserving their separate selections. Intent choices use
the system intentions published by the active preset, without pair restrictions. `Same as button`
passes the chosen base intent explicitly. Initial values are Neutral, Medium, Primary and Low,
respectively. The compact sequential controls loop and wrap within the existing card header.

## Migration

Use `low` for the former base Selected plus indicator and `lowest` to omit it. Use `medium/high`
for normal High paint without/with its indicator. Remove `indicator` and `indicatorScope`; neither
is an alternative activation API. `indicatorPlacement` remains the inside/outside positioning option.

See the [Core contract](../../../../../core/docs/definitions/button-selection.md),
[state indicator](./state-indicator.md) and
[composition strategies](../../../../../../docs/definitions/composition-strategies.md).
