# Accordion

Status: first delivery, Fluent 2 by Microsoft, Light. Neutral emphasis names and surfaces match Card exactly; the Accordion composition
is a Kiskadee adaptation, not an official Fluent variant catalog.

## Public API

`Accordion` owns `expandedItems: readonly string[]`, `defaultExpandedItems`,
`onExpandedItemsChange(items)`, `multiple`, `disabled`, `interactionLocked`,
`emphasis`, `panelEmphasis`, `divider`, `border`, `shadow`, `motion`, `motionSpeed`, `transitionCoordination` and `indicatorTransition`. Defaults are no expanded items, single-open, medium and
Motion enabled. All items may close. Single-open input is normalized to its first
unique value. Switching from multiple to single likewise displays only the first.
Controlled requests notify without changing the supplied state.

Compose `Accordion.Item` (unique `value`, optional `disabled`), `Accordion.Header`
(title children, optional decorative `icon`, `headingLevel` default 3), and
`Accordion.Panel` (arbitrary content). Each Item must contain exactly one Header
and one Panel. Values must be unique within their group. Item owns the single
expansion scope; nested groups are independent. Root classes may be passed through
`classNames.e1` through `e6`; ordinary props and refs target each public part.

Do not place links, buttons, fields, or other interactive descendants inside a
Header. The title must be phrasing content. Put interactive content in Panel.
Headless owns stable header/panel IDs; caller-provided IDs on those parts cannot
replace their relationship. Panel can opt into `role="region"`; it is not a
landmark by default. `disabled` disables headers, not the content of an open panel.
`interactionLocked` blocks user toggling while retaining focusability and visuals.

## Ownership and element map

| Slot | Name | Owner |
| --- | --- | --- |
| e1 | root | Headless grouping and expansion coordination; no outer spacing |
| e2 | item | Item scope; Card provides the medium frame |
| e3 | trigger | Native CardAction with Accordion-authored intrinsic padding |
| e4 | label | Preset typography, inheriting CardAction content foreground |
| e5 | indicator | Preset geometry, decorative trailing chevron |
| e6 | panel | Accessible content region and measured-height target |

Schema composition is flat, with the implicit standard/base branch. Only e3/e4/e5
own generated visual attributes; the other slots have name-only contracts.
CardAction, Card, Container, Separator and Icon remain independent components and
load their own resources. Core validates these composition dependencies.

Every emphasis uses a rounded Card frame. Fluent Light supports `lowest`, `low`,
`medium` and `high`, exactly matching Card neutral colors without renaming.
`emphasis` selects the frame/header and, when omitted, `panelEmphasis` inherits it.
An explicit `panelEmphasis` selects the Container body independently. Card and Container share the same neutral Rest surface source. No intent prop is exposed; the composition is neutral.
Unavailable emphases render no Accordion rather than substituting another recipe.

`border` and `shadow` reuse the exact Card prop types: boolean/adaptive for border,
boolean or a fixed global level for shadow. Defaults are border on and shadow off.
Only the frame receives them; the trigger has neither its own border nor shadow.
Changing appearance preserves mounted children.

`options.divider` is a single required boolean preset default, common to every
emphasis. Fluent declares true. Instance `divider` overrides that default;
false removes only the internal line, independently of the outer border.
Separator matches the frame neutral contour: low onSubtle, medium onVivid.
 Expansion never becomes
CardAction `controlState` and never emits `aria-pressed` or selected paint.
No shared Card, Button, Container or Layout recipes are modified.

Panel supplies no padding. Consumers compose `Layout` inside Panel and around
items. The Fluent trigger owns 16px block and 24px inline insets. Its marginRight scale
is emitted as a token and consumed as a 16px gap between header children, independently
of the insets (it does not create an outer margin), following the wrapper relationship
exception in [Structural CSS](../../../../../../STRUCTURAL-CSS.md#spacing-and-schema-ownership).
The uniform gap follows the flex flow in LTR and RTL; marginRight is the token source, not
a physical outer margin. Label uses
body-medium; the indicator is 12px. Existing Icon handles leading-glyph geometry.
Structural CSS consumes published spacing variables and logical axes; no token
values, colors, state recipes or breakpoints are invented in CSS.

## Semantics and Motion

Header is one native `button type="button"` inside the configured heading, with
`aria-expanded` and `aria-controls`. Native Enter/Space activate; normal Tab order
is retained. Event cancellation is honored. There is no arrow-key navigation.

Closing immediately applies `inert` and `aria-hidden`; focus within Panel returns
to Header. Mounted children survive closure. `hidden` is applied after exit, so
collapsed panels reserve no height. No automatic focus moves occur on opening.

One public Accordion loads its optional Motion module lazily. Panel timing is a bounded
p-react recipe under the [transition-speed contract](../../../../../../docs/definitions/transition-speeds.md),
not a preset effect or generated metadata. `motionSpeed` defaults to normal:

| Speed | Open ms | Close ms |
| --- | ---: | ---: |
| normal | 180 | 120 |
| fast | 120 | 80 |
| slow | 360 | 240 |
| debugSlow | 1800 | 1200 |

Isolated opening uses ease-out; isolated closing uses ease-in.
`transitionCoordination` defaults to synchronized. If one committed group update opens
and closes panels, all participants use the opening recipe on one shared progress clock.
Independent mode retains separate entry/exit clocks. This works with controlled and
internal state, single or multiple expansion, and isolated nested groups.

Interrupted batches stop at current measured heights. All still-moving participants of
an interrupted synchronized batch join its replacement. ResizeObserver retargets changed
content on the existing progress clock; it never extends the group's deadline. Open height
becomes auto on completion. Unmount and cancellation release observers and clocks.
Changing motion enablement, speed, coordination, or enhancer availability settles current desired
states immediately. This also applies when configuration and expansion change in the same React
commit: the new expansion is applied without animation and is not replayed afterward. Ordinary
expansion updates with stable configuration still animate. Initial mount is immediate.

The indicator composes Rotate or Crossfade; its independent recipe remains 180ms entry /
120ms exit with ease-out/ease-in, unaffected by panel speed or coordination. Fluent defaults
to none (instant glyph replacement), with the default still sourced from Schema.
See [visual helpers](../visual-helpers/visual-helpers-contract.md).

`motion={false}` disables panel height animation only. `indicatorTransition`
follows `options.indicatorTransition` unless overridden by the instance: rotate,
crossfade, or none (immediate down/up replacement). Reduced motion and missing
Motion modules apply both animations immediately. Initial render and enhancer arrival do not replay transitions.
No CSS transition competes for height or rotation. Headless has no Motion dependency.

## Coverage and verification

Only the Fluent Light artifact advertises this component; `options.themes` and
`options.emphases` are availability metadata. Unsupported themes render no styled
Accordion; Showcase explains availability without fabricating a recipe.

The `/accordion` route exercises all advertised neutral emphases and independent panel emphasis, controlled and multiple-open
state, disabled and locked controls, nested items, long titles, dynamic content,
RTL and the immediate path. Showcase examples use low panel emphasis except for the matching-emphasis example;
they omit code blocks to keep the visual comparison compact.
Unit/integration tests cover state, semantic closure, focus, retained children,
late Motion, reduced motion, reversal and dynamic measurement. Artifact tests
cover availability, absence of preset-owned Motion metadata and spacing emission.

Deferred: other presets/themes, sizes/radius variants, upward expansion, mandatory
one-open groups, unmount-on-close and additional header actions.
