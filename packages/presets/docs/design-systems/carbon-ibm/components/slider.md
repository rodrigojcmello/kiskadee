# Carbon Slider Evidence

## Sources

- [Preview Slider specifications](https://preview.carbondesignsystem.com/building-blocks/core/components/slider/specifications), inspected 2026-09-20.
- [Carbon Slider style](https://carbondesignsystem.com/components/slider/style/), corroborating range and size differences.
- [Figma v11](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/?node-id=58-2763), file `MfGzFa79SfhHQ2mKpC3ss4`, entry node `58:2763`.

## Source Coverage

| Area | Relationship | Status |
| --- | --- | --- |
| Standard track, handle, labels, active/focus/disabled colors | Preview standard Slider | Official adapted |
| Range-specific handle and active growth | Source inspected, no size-state contract | Deferred |
| OnVivid, marks, optional indicator and thumb icon | Existing Kiskadee slots | Kiskadee extension |

## Schema And Color Mapping

The standard/base variant uses a 4px square track (`e8/e9`) and a 14px circular handle (`e10`).
All handle radius channels remain 7px so the preset's global square radius keeps the Carbon
handle circular while the rail retains square ends.
`e11` is zero-sized/transparent because Carbon has no contrasting thumb center. The track minimum
is 200px. Labels use 12/16 regular; endpoint/value labels use 14/18 regular. Tooltip is the default
value presentation, using inverse surface/text and 4px clearance.

Rest rail/filled track/handle map to `border-subtle-01`, `border-inverse`, `icon-primary`.
Focus changes the filled track to `interactive`; Pressed changes both track and handle.
Text/disabled colors come from their corresponding Carbon tokens. No Hover fill was invented.
Both existing intents retain this source-neutral treatment, using `slider.primary` only for the
active/focused interactive color. Descendant state deltas use parent references and omit Rest-equal
values. Exact/cap locators use `source.tokens`; full per-theme de-para is in
[token-mapping.json](../colors/token-mapping.json).

## Extensions And Deferred Capabilities

OnVivid uses white controls/text, 24% white rail and 35% disabled controls; this is a
**Kiskadee extension**. The optional thumb icon uses a physical-black cap on the white OnVivid
handle, independently of theme, instead of inheriting the Light inverse white foreground.
Marks and optional-indicator appearances reuse the control/text colors.
**Deferred:** native editable number input, error/warning input states, 14-to-20px active handle
growth, and distinct 16px range handles. The present schema cannot express those differences
without framework changes. No new control behavior or API is introduced.

## Validation

The standard/base topology passes the Core Slider contract for all three themes and both
contexts. Integrated browser validation is recorded by the parent preset task.
