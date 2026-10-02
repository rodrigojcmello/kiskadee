# Sandbox Select experiment

Source: the local Showcase `k-components/Select/Select.module.scss`, reviewed on 2026-09-28.
The blue inset contour in `sequentialTrigger` is unconditional Rest paint, not selected/focus state.
Hover whitens the fill; keyboard focus adds an independent external outline in that local control.
The p-react recipe below is an explicitly approved **Kiskadee extension** and does not copy that
two-contour focus behavior. The former Showcase control remains in the header/sidebar.

Sandbox 1 preserves the soft shared outer surface, rounded internal trigger, blue Rest border
(Outline), and transparent lateral controls. Underline and Borderless are experimental adaptations.
No Fluent fidelity is claimed. The explicit pale control surface retains its own dark foreground
in both published themes and surface contexts.

The outer row owns minimum height (32/40/48); inner controls use 24/32/40 size references and stretch
within the shared row padding. Content can grow naturally without a fixed inner minimum or negative
lane margins. Rounded is now the Sandbox global default; explicit radius options remain available.
Selection and list-opening behavior remain owned by Headless, independently of this visual recipe.

## Surface and focus decisions (2026-09-29)

| Mode | Rest surface and contour | Real trigger-focus presentation | Color source |
| --- | --- | --- | --- |
| Outline | Soft shared surface with a pale, blue-bordered trigger | Inner, reusing the trigger contour | Component e4 `borderColor.focus` |
| Underline | One pale shared surface, transparent internal controls, whole-block bottom indicator | Underline | Component e7 `boxColor.focus` |
| Borderless | One pale shared surface, transparent internal controls, no Rest contour or indicator | Outer, around the common control block | Existing global focus color |

Each mode publishes this policy in its own options. Focus presentation is independent of habitual
mode appearance. There is one chosen trigger-focus presentation: Outline does not add an external
ring above its internal contour, and Underline does not add an external ring above its indicator.
Previous and Next remain independently focusable and keep their own focus outlines. Their focus
does not activate the trigger presentation or expand the whole-block indicator.

The Outline blue Rest contour remains visual identity, not a selected state or permanent focus.
Its real Focus delta changes that same contour from `#3b82f6` to `#226ce2`, read from the promoted
`colors/b.blue.v1.ts` Light tone 40. The existing generator 0.19.0 asset supplies the color; no
new family or global focus token is introduced. This experimentally selected contrast delta is an
approved Kiskadee calibration, not a source-derived Fluent value. The Light track is used in both
themes because the actual painted control retains its pale fill in both contexts. Underline uses
the same darker blue for its ordinary Focus palette delta and the existing gray for Disabled.

Underline and Borderless move the existing pale trigger fill onto e3; e4/e8/e9 are transparent in
Rest. This removes stacked near-white backgrounds and produces one block without changing size,
radius or text identity. Borderless has no outer or trigger Rest border or visible Rest indicator.
Outline preserves
its deliberately inset composition. Underline removes vertical shell padding and its indicator
paints across the whole control at the outer bottom border, with rounded paint clipping that does
not hide the individual controls' keyboard focus outlines.

All three modes publish e7 so the public `focusIndicator` override can select underline presentation.
Outline and Borderless author transparent Rest paint and zero Rest height; their indicator expands
only when underline presentation is selected and the trigger owns focus. The dormant slot therefore
adds no permanent boundary or second focus presentation. Its Focus/Disabled colors reuse the same
existing component palette references as Underline. Missing e7 in another preset still means an
unavailable bottom indicator; p-react does not synthesize missing authorship in a raw composition.

For an outer presentation override with component color, e3 also authors `borderColor.focus` with
the same promoted tone 40. Its Rest contour remains soft in Outline/Underline and transparent with
zero width in Borderless. This token does not add a second ring: structural focus gating activates
e3 only when outer is the chosen trigger presentation. The Borderless default continues to use the
global focus color.

Trigger and lateral hover fills are direct self-state colors. Hovering the common e3 block therefore
does not activate all three independent regions simultaneously. Previous/Next also author direct
Disabled text colors so an endpoint can dim independently of global disabled. Value/placeholder and
other dependent slots retain ancestor-state Disabled references for the global component condition.
These ownership changes preserve the existing Rest and interaction colors.

## Optional sequential dividers

The e12 decorative divider consumes `global.separators.profiles.subtle`, including its generated
neutral paint and 1px thickness. One recipe is instantiated at both seams, rather than duplicating
per-side color or geometry. Its 24/32/40 extent matches the existing inner-control height and stays
within the 32/40/48 overall control. `showDividers` defaults to false; non-sequential composition
does not display these dividers. They have no independent focus or accessibility semantics.

## Validation boundary

Focused schema assertions cover the single-presentation mode matrix, distinct Rest/Focus contour
colors, unified resting surfaces, component-color presentation overrides, local hover/endpoint Disabled
ownership, dormant underline override capability, absent Borderless Rest paint
and optional divider geometry.
Artifact and rendered verification are recorded in the implementation handoff. This remains an
experimental preset and makes no claim of official Fluent sequential controls.

## Review corrections: geometry and placeholder paint

The positioner e13 authors an 8px anchor gap (`marginTop`) and 8px collision clearance on all four
padding sides in every mode. This relocates the existing adapter appearance into the preset; it is
an explicit **Kiskadee extension**, not newly verified official geometry. The Builder publishes tokens
rather than DOM margin/padding, and the visual adapter supplies them to Headless positioning.

Placeholder e11 now authors `color-mix(in srgb, <existing resolved color> 62%, transparent)` for Rest
and Disabled. This moves the previous 0.62 structural opacity into preset-owned paint and preserves
existing alpha multiplicatively, including translucent disabled foregrounds. Base color provenance,
themes, segments and surface mappings are unchanged. TextField is not changed by this relocation.
