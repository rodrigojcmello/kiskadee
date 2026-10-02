# Select

Status: Fluent-inspired **Kiskadee extension**. Microsoft and Teams share the structure; brand
focus paint follows the active segment. This implementation is not an assertion that Fluent
provides sequential Previous/Next or loop controls.

## Sources and coverage

- [Fluent Dropdown](https://fluent2.microsoft.design/components/web/react/core/dropdown/usage)
  supports choosing an existing value; the Kiskadee headless Select owns that behavior.
- [Fluent Combobox](https://fluent2.microsoft.design/components/web/react/core/combobox/usage)
  includes editable/filterable scenarios, deliberately outside this Select delivery.
- [Windows ComboBox](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/combo-box)
  provides the Windows selection-control reference.
- The user supplied the community Figma SearchBox node `8995:7` in file
  `qdtPPQysSX0kHGGcDpEXzw`. Tool inspection did not resolve that node; no pixel measurements
  or official sequential behavior are attributed to it.

| Source area | Reference | Status | Coverage |
| --- | --- | --- | --- |
| Existing-value selection | Fluent Dropdown and Windows ComboBox links above | Official adapted | Behavior is supplied by Headless Select. |
| Community SearchBox | `qdtPPQysSX0kHGGcDpEXzw`, `8995:7` | Not inspected | No measurements or behavior are inferred. |
| Shared neutral control identity | Existing Button/TextField calibration | Kiskadee extension | Explicitly selected visual adaptation. |
| Sequential navigation and dividers | User-approved Select refinement, 2026-09-29 | Kiskadee extension | No official Fluent sequential-control claim. |

The approved source of visual calibration is the existing Kiskadee Fluent TextField and low-neutral
Button, including the user's Windows 11 screenshot comparisons documented in
[text-field.md](text-field.md). This is an explicit adaptation rather than a literal copy of the
Fluent Web appearance naming.

## Shared recipes

`field-visual-recipe.ts` supplies colors and standard typography/size helpers to both components.
`neutral-control-recipe.ts` continues to supply canonical Outline hover fill and bottom contrast.
The Select schema declares its elements independently and only neutral intent, with no
TextField validation or read-only states. Height is 24/32/40 for sm/md/lg.

Outline has the neutral contour and transparent Rest surface; hover uses Button's calibrated fill.
Underline retains only the lower delimitation. Borderless uses canonical Card neutral fill.
Focus changes e7 color and height; lateral controls retain individual focus rings. Rest-equal
focus/pressed resets intentionally suppress Outline hover paint, matching TextField.

Light, Dark and Darker publish onSubtle and onVivid. Darker uses the existing Button black-surface
contour calibration and Card low D2 surface. It retains Dark text, disabled and indicator contrast
where the shared control family already uses the same values. Filled onVivid controls retain
foreground colors for their own fill, while external label/message follow the surrounding surface.

## Unified sequential composition (2026-09-28)

User review approved moving the common surface/contour to e3 and removing separate shells and
margins from Previous/Next. This supersedes the initial three-box composition. Overall heights stay
24/32/40. The structural x1 lane overlaps e3's border using its emitted border-width token,
so e7 overlays the native bottom border rather than sitting one pixel above it. The original
indicator lived inside the trigger; the 2026-09-29 refinement below supersedes that paint ownership.
Fluent declares `focusIndicator: underline`; sibling focus never expands it. Shared shell hover applies across the
control row; trigger and lateral buttons retain independent focus ownership. The existing colors
and their TextField provenance are unchanged.

## Mode focus policy and optional dividers (2026-09-29)

All three modes explicitly select `underline` with `focusRingColorSource: component` in their
mode options. Mode describes the habitual shell; focus presentation is an independent policy.
Outline therefore keeps its native neutral border while using the lower indicator for real focus.
There is one trigger-focus presentation, without an additional outer ring. Previous and Next
retain their own individual focus indications and never simulate trigger focus.

Previous/Next hover fills and Disabled text colors are direct self-state palette values. Each endpoint
can therefore dim independently, and hovering the shared block does not activate both button fills.
Value, placeholder and other dependent slots retain ancestor-state Disabled references for the
global component condition. Shared shell hover and lower-indicator hover remain intentional control
scope reactions; they do not transfer the individual buttons' state ownership.

The e3 control owns the single shared surface, native border and whole-block indicator paint area.
The e7 indicator is anchored to the full control bottom, overlaying the native lower border without
escaping the control's rounded paint boundary. Only its paint is clipped; keyboard focus outlines
on the separately focusable controls remain visible. This width is a **Kiskadee extension** for
sequential Select, rather than a claim about an official Fluent Previous/Next composition.

The component-owned focus color uses ordinary palettes on each presentation host: e7
`boxColor.focus` for underline, e4 `borderColor.focus` for inner and e3 `borderColor.focus` for
outer. These authored colors also support public presentation overrides. The trigger border keeps
zero native width and transparent Rest/Disabled paint; its Focus token does not add a Rest contour.
Structural focus gating activates only the chosen host, so default underline focus does not change
the native outer contour. e3/e4 own their projected focus state and therefore author direct Focus
colors, which emit self-state `--focus` selectors. e7 reacts to its x2 paint-scope ancestor and
retains `{ ref: ... }`, which emits ancestor-state `==focus` selectors. Reference-state selectors
cannot target the state owner itself. This distinction follows the existing interaction-state
contract and does not change the chosen color. All three hosts use the existing
`field-visual-recipe.ts` brand reference:
`primary.vivid` for onSubtle and
`primary.subtle + 4` on the Light track for onVivid. Microsoft and Teams keep their own resolved
brand identities. No additional focus-color field, primitive family, or literal color is introduced.
The Rest/hover bottom colors keep their documented shared neutral-control provenance.

Optional e12 is one decorative divider recipe instantiated at both seams between Previous,
trigger and Next. It consumes the existing `global.separators.profiles.subtle` thickness and paint;
its 16/24/32 extent leaves an 8px difference from the 24/32/40 control height. The dividers are
hidden by default and only participate in sequential composition. They do not change keyboard
order, accessible naming or selection semantics. No duplicate per-side palette is authored.

## Validation and open gaps

Focused schema tests check mode focus policy, independently authored focus hosts, divider publication,
all themes/segments/surface contexts, and parity with the unchanged TextField recipe. Artifact and rendered verification belongs
to the implementation handoff. Official sequential Select geometry and the supplied SearchBox
node remain uninspected upstream; these adaptations retain their **Kiskadee extension** status.

## Review corrections: geometry and placeholder paint

The positioner e13 authors an 8px anchor gap (`marginTop`) and 8px collision clearance on all four
padding sides in every mode. This relocates the existing adapter appearance into the preset; it is
an explicit **Kiskadee extension**, not newly verified official geometry. The Builder publishes tokens
rather than DOM margin/padding, and the visual adapter supplies them to Headless positioning.

Placeholder e11 now authors `color-mix(in srgb, <existing resolved color> 62%, transparent)` for Rest
and Disabled. This moves the previous 0.62 structural opacity into preset-owned paint and preserves
existing alpha multiplicatively, including translucent disabled foregrounds. Base color provenance,
themes, segments and surface mappings are unchanged. TextField is not changed by this relocation.
