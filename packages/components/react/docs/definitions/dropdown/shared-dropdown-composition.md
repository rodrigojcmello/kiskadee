# Shared Dropdown Composition

Status: canonical definition.

`Dropdown` is the shared visual surface for anchored collections. It does not decide whether a
collection is a menu, a value selector, or autocomplete suggestions.

The semantic owners remain independent:

- `Menu` owns `menu` and `menuitem`, real item focus, action activation, typeahead, and focus
  restoration;
- `Select` owns `combobox`, `listbox`, `option`, committed value, and active-descendant focus;
- `Autocomplete` owns editable input value, selected value, filtering input, and active-descendant
  focus.

Those components reuse the same Dropdown class map and DOM slots. They never change semantics by
passing a `menu | select | autocomplete` visual variant.

`Dropdown.Root` combines the visual provider with the mechanical headless root for a standalone
anchored Dropdown. Semantic owners that already control their own overlay use
`Dropdown.VisualProvider` instead. This keeps one visual class-map source without mounting a second
open state, anchor registry, ID pair, or mechanical context.

## Elements

- `e1`: floating surface;
- `e2`: interactive collection item;
- `e3`: optional leading icon;
- `e4`: principal label;
- `e5`: optional supporting description;
- `e6`: optional trailing icon;
- `e7`: explicit separator.
- `e8`: optional end text, such as a keyboard shortcut or metadata;
- `e9`: optional visual group label.
- `e10`: optional leading selection indicator for checkbox or radio items.
- `e11`: optional long-menu scroll affordance, with independent icon size and surface/foreground
  palettes.

The surface may contain arbitrary non-interactive supporting content. Rich content that introduces
multiple focus targets, dialog behavior, or form controls belongs to a future Popover or advanced
search contract rather than Dropdown.

## Icon Column

`Dropdown.Items` is the leading-track alignment scope for the complete collection, including every
explicit `Dropdown.Group` separated by `Dropdown.Separator`. Structural CSS uses `:has()` to reserve
a leading column for every item when at least one item anywhere in that collection renders
`Dropdown.Icon`. Items without icons render an empty structural track, but no icon glyph or
affordance, and align their labels with every icon-bearing item in the same menu.

The icon viewport comes from `global.iconSizes` through the normal `iconSize` Builder expansion.
In `independent`, SUP exposes only the existing `e3/e10` width-gap utilities to the empty structural
track nodes. No raw value, browser measurement, or icon-presence JavaScript is used. `columns`
continues sharing intrinsic tracks through subgrid.

Checkable items keep `e10` mounted even while unchecked. Only its artwork changes visibility, so
the selection track never collapses between values. Checkbox items use the canonical `check`;
radio items use the canonical `radio-selected` filled dot. The track precedes `e3`; an item may
therefore contain a selection indicator, ordinary leading icon, end text, and trailing icon at the
same time. Like ordinary icon alignment, indicator alignment is scoped to the containing
`Dropdown.Items` collection and is resolved entirely by structural CSS. The preset keeps authoring
the gap as `e10.paddingRight`; the Builder emits only `--k-pdr`, and structural CSS consumes it as
logical `padding-inline-end` so the relationship reverses correctly in RTL.
`e10` uses `content-box` so that this padding extends the slot instead of reducing the authored
`iconSize` viewport under the framework-wide border-box reset. Empty projected tracks therefore
reserve the same icon viewport plus gap as a rendered check or radio indicator.

## Item Layout

`Dropdown.Items` exposes two structural layout policies:

- `independent` keeps one grid per item and is the default for compact collections;
- `columns` keeps leading tracks synchronized across the complete collection while items in each
  explicit Group share content, end-text, and trailing tracks.

Group remains the sizing boundary for principal and final content in both policies. Leading icon and
selection occupancy is collection-wide. In `columns`, the widest principal content and widest final
content inside one Group determine that Group's non-leading tracks. Another Group starts a new
content calculation after a separator. The floating surface still takes the intrinsic width of its
widest Group, so all Groups occupy the same outer width without coupling unrelated content widths.

Item horizontal padding remains authored as `e2.paddingLeft` and `e2.paddingRight`. The Builder
emits these as `--k-pdl` and `--k-pdr`, and structural CSS applies them to logical inline start and
end. Asymmetric preset values therefore preserve their LTR visual while reversing correctly in RTL.

Labels and descriptions may additionally publish logical edge insets through their own
`e4`/`e5` padding tokens. Structural CSS consumes the start token only when the complete collection
has no leading icon or selection track, and consumes the end token only when the effective layout
has no end-text or trailing-icon track. Leading occupancy is collection-wide in both layouts. Final
occupancy remains Group-wide in `columns` and per-item in `independent`. The tokens are inert in
presets that do not publish them; no `iconless` runtime prop or Sass spacing literal participates in
the decision.

A group label uses CSC: its normal `e9.paddingLeft` remains always-on, while its independently
authored `e9.marginLeft` is applied only when the complete collection contains no leading icon or
selection track. If any Group introduces either track, every Group label uses the shared leading
alignment context. The implementation uses CSS Grid, subgrid, SUP, and CSC; it does not measure
content or publish runtime geometry variables.

## Separators And States

Separators are never inferred between items. Consumers split items into Groups and insert
`Dropdown.Separator` between them. Each Group keeps the item padding, while the separator is a
full-bleed line with no margin, padding, or inset of its own. The semantic owner remains responsible
for any role appropriate to that context; generic Dropdown does not presume separator semantics.

`Dropdown.Separator` and the public neutral `Separator` component consume the same preset recipe,
but do not share component DOM or class maps. Colored, stateful, or component-specific dividers
remain local to their owning component.

Items use the component's internal `medium` emphasis. Rest is the base and interaction states are
sparse deltas. Dropdown exposes neutral and destructive intent in the first contract; it does not
copy Button's public emphasis matrix.

`Dropdown.GroupLabel` and `Dropdown.EndText` are visual slots only. Semantic components decide
whether a group label names a `menu` group and whether end text represents an accessible keyboard
shortcut. `Dropdown.Trailing` remains iconographic and does not imply submenu behavior.

`Dropdown.EndText` consumes its preset-authored inline start and end padding as logical CSS. The
start inset is therefore the gap from principal content in both LTR and RTL; it is not a physical
left margin or a runtime measurement.

`Dropdown.Checkmark` and `Dropdown.RadioMark` are visual only. Both are hidden from the
accessibility tree; Menu or Select owns checked state and role. An unchecked wrapper remains in
layout through `visible={false}` rather than rendering a placeholder or inspecting sibling children
in JavaScript.

## Mechanical Overlay

The headless anchored-overlay layer owns only controlled or uncontrolled open state, anchor and
floating refs, portal presence, placement, collision handling, width policy, Escape, and outside
press. It does not own roles, selection, item keyboard behavior, or focus policy.

Stacking order is visual/application policy. The headless layer never injects a z-index; a styled
component or consuming overlay system may establish the appropriate layer for its environment.

Portal presence is hydration-stable: a portalled surface remains inline until the client mount has
completed, then moves to its resolved portal container. Semantic components decide how focus is
restored and what an Escape means.

## Long Menus And Context Menus

`Dropdown.ScrollArea` exposes the actual native scroll viewport through its props and ref. Its
outer shell and optional edge affordances are framework-owned. ButtonMenu and ContextMenu insert
it automatically; low-level Dropdown compositions opt in when their content can exceed the
viewport. The surface keeps natural height up to `min(80dvh, availableHeight)`, preserves the
system scrollbar, and restricts normal width policies by the collision middleware's available
width. These limits are structural and do not create schema height profiles.

`e11` is optional for backwards compatibility. When it and the corresponding E-I resolve, the
start/end affordance overlays the viewport and continuously scrolls after a 150 ms non-touch hover
delay at 240 px/s. It is not focusable, a menu item, or a substitute for wheel, trackpad, touch, or
keyboard scrolling. Before activation, the painted affordance stays outside pointer hit-testing so
items and native touch remain the actual targets. Once the non-touch delay elapses, it becomes the
stable pointer target for the duration of continuous scrolling, preventing moving items underneath
it from repeatedly entering and leaving hover. Missing `e11` or glyph coverage removes the whole
affordance.

The affordance currently has no independent vertical padding or height token. Its minimum block
size is exactly the icon viewport resolved from `e11.iconSize`; Structural CSS only applies that
Schema-owned dimension to the overlay. Presets should preserve this relationship until evidence
from additional design systems justifies separating glyph size from affordance height.

ContextMenu is a public Menu presenter, not a Dropdown behavior. Its consumer-owned trigger opens
from `contextmenu`, Shift+F10, or the Context Menu key, while the headless layer owns the virtual
point reference and focus policy. ContextMenu reuses ButtonMenu content, item, selection, submenu,
and tree parts. Dropdown remains responsible only for their shared appearance.

Every submenu has its own available-size measurement and ScrollArea. Collision fallback prefers
the logical opening side, then its end alignment, then the opposite side. Cross-axis shift may
overlap the parent only as the final way to remain inside the clipping boundary. Physical flipping
never changes logical keyboard direction, and scrolling a parent viewport closes its active child
submenu.

## Visual Presence

Dropdown visual presence is a preset effect resolved from the global artifact. `Dropdown.Root`,
`Dropdown.VisualProvider`, and `ButtonMenu.Root` accept `presence`; omission uses the preset,
`false` keeps the static core path, and an explicit profile selects `fade-translate` or
`grow-height` when the active preset publishes it.

The shared `Dropdown.Presence` adapter lets Menu, Select, and Autocomplete reuse the same effect
without importing Motion or duplicating profile lookup. It keeps the Floating UI positioner and
its transform static, then supplies open state to `Dropdown.Surface`; Motion animates `e1` itself.
Consequently collision placement remains mechanical, grow-height uses the surface's real
`0 -> auto` block size, and the surface shadow is not clipped by an additional animation wrapper.
The effect does not add persistent overflow clipping. `e1` keeps its existing structural
`overflow: clip` for surface/radius containment independently of presence.

The headless render state distinguishes requested placement from positioning readiness. A surface
is mounted at its full natural geometry but stays visually hidden until Floating UI finishes its
first collision pass. Presence then stages its initial frame from the resolved placement before
animating. This prevents an initial `bottom` request from leaking into a popup that ultimately
flips to `top`. For `grow-height`, the positioner reserves the measured natural height during the
cycle; a top-placed surface aligns to the positioner's block end and therefore grows upward from
the anchor instead of changing sides while its height increases. Lateral submenus also respect
their resolved alignment: `left-end` and `right-end` align the animated surface to the reserved
block end, so a collision-flipped submenu grows upward; `left-start` and `right-start` continue to
grow downward from the block start. This decision follows the final placement rather than the
initial requested placement.

Preparation hides only the paint with opacity and blocks pointer interaction; it never applies
`visibility: hidden`. Semantic owners can therefore move focus into the popup immediately, before
the visual entrance completes, without making accessibility depend on Motion timing.

Each animated Surface registers an opaque identity with the presence lifecycle. Exit retention is
released after every registered Surface completes; a composition without a Surface releases
immediately. This explicit registration avoids child inspection and prevents an adapter consumer
from retaining a closed positioner indefinitely.

The Motion module is one lazy chunk shared by every Dropdown consumer. If it becomes available
while a popup is already open, that cycle stays static; module and profile changes are adopted only
after close. A motion-enabled cycle is retained only for its exit and then unmounted, while
`presence={false}` never force-mounts closed content. Headless Dropdown, Menu, Select, and
Autocomplete all keep closed content unmounted unless this adapter is retaining that exit.
Reduced-motion preference,
`.no-transitions`, and tests use zero-duration transitions with no animated initial frame.

## Width Policy

The shared `content` policy uses intrinsic width with a 138 px minimum and 300 px maximum. These
initial framework bounds come from Fluent 2 MenuPopover and apply independently of the active
preset until a demonstrated design-system conflict justifies preset-owned width recipes.

The mechanical alternatives remain explicit overrides:

- `content` follows intrinsic content inside the shared bounds;
- `min-anchor` measures the anchor and makes the surface at least that wide while allowing wider
  content;
- `anchor` measures the anchor and makes the surface exactly that wide.

Only the anchor-relative modes require runtime measurement. Structural CSS owns the shared content
bounds; no preset schema, generated utility, or browser style lookup is introduced.

## ButtonMenu

`ButtonMenu` is one public orchestration API over Button, Menu, and Dropdown:

- without `ButtonMenu.Action`, Trigger is one menu button;
- with `ButtonMenu.Action`, Action and Trigger are two sibling Buttons and two tab stops;
- Action and Trigger are the only children composed into the shared `Button.Group`; popup content
  remains outside that visual topology, including when it is rendered inline rather than portalled;
- `ButtonMenu.Root.buttonGroup` owns the trigger group's `scale`, `radius`, `emphasis`, `intent`,
  `surfaceContext`, and optional static Rest shadow;
- the Root's top-level `scale`, `radius`, and `shadow` continue to configure the Dropdown surface,
  so popup elevation is never reinterpreted as Button-group elevation;
- only Trigger owns `aria-haspopup`, `aria-expanded`, `aria-controls`, and menu opening;
- while open, Trigger projects Button's visual `pressed` status without becoming a toggle or
  emitting `aria-pressed`;
- while open, Trigger suppresses only Button's transient activation-feedback overlay so the
  persistent pressed palette remains authoritative; closing restores the authored/preset feedback;
- Action may submit a form; Trigger is always `type="button"`;
- Button classes style Action and Trigger, while Dropdown classes style Content and items.
- `ButtonMenu.Group` composes a Headless Menu `group` and the visual Dropdown group on the same DOM
  node;
- `ButtonMenu.GroupLabel` names that semantic group while consuming `Dropdown.e9`;
- `ButtonMenu.Shortcut` consumes `Dropdown.e8`, stays outside the accessible item name, and relies
  on `aria-keyshortcuts` authored on the item;
- `ButtonMenu.Content.itemsLayout` forwards the collection policy to `Dropdown.Items` without
  changing menu semantics;
- `ButtonMenu.Separator` supplies menu separator semantics around the Dropdown-owned line.

Selection and recursive submenus remain ButtonMenu orchestration, not Dropdown variants:

- `ButtonMenu.RadioGroup` and `ButtonMenu.RadioItem` own `menuitemradio` behavior;
- `ButtonMenu.CheckboxItem` owns independent `menuitemcheckbox` state through `controlState`,
  `defaultControlState`, and `onControlStateChange`;
- checked radio and checkbox items project the generic visual Selected state on the Dropdown row;
  radio uses `Dropdown.RadioMark`, while checkbox uses `Dropdown.Checkmark`;
- `ButtonMenu.Sub`, `ButtonMenu.SubTrigger`, and `ButtonMenu.SubContent` own nested menu state,
  keyboard behavior, focus restoration, and anchored collision handling;
- while a submenu is open, SubTrigger projects Hover, keeps `aria-expanded`, and never emits
  Selected or `aria-selected`;
- SubTrigger injects the canonical logical `chevron-end`; icon-family RTL mirroring supplies the
  opposite direction without a physical icon name or consumer-authored action.

ButtonMenu has no schema of its own. It reuses `Button.Group` for connected corners, Rest shadow,
border collapse, and the optional `Button.e6` seam, while Dropdown remains the sole owner of popup
appearance. Creating parallel ButtonMenu paint or seam rules would introduce visual drift.
