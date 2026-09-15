# Material Design 3 Button Evidence

## Sources and coverage

Inspected on 2026-09-12 with Figma design context, for interaction behavior rather than literal palette adoption.

- [Material 3 Design Kit](https://www.figma.com/design/Peqe9lNMsuQHLIUZsiTZNg/Material-3-Design-Kit--Community-?node-id=57994-696)
  - File key: Peqe9lNMsuQHLIUZsiTZNg; section: 57994:696.
  - Filled: 57994:2227. Tonal: 58651:11237. Outlined: 58650:10213. Text: 58650:8094.
  - Selected tonal: 57994:2433 under 58653:17539.
- [Approved color provenance](../colors/README.md): Balanced, generator 0.15.0.
- Local Fluent reference: fluent-2-microsoft/components/button-color-formula.ts.
  User authorized this preset as the fallback for missing context/theme/state behavior.

| Source area | Status | Coverage |
| --- | --- | --- |
| Filled, tonal, outlined and text state layers | Official adapted | Figma Light behavior inspected; map to approved Kiskadee families. |
| Selected tonal | Official adapted | Filled selected container with contrasting text, instead of the unselected tonal surface. |
| Neutral, destructive, positive extension matrix | Kiskadee extension | Same recipe with the corresponding intent family. |
| Dark, onVivid and pending completion | Kiskadee extension | Fluent-guided completion; no claim of direct Figma equivalence. |
| New geometry, focus-ring and ripple fidelity audit | Not inspected | Existing shape, external ring and ripple retained. |

## Official behavior observed

Filled uses on-primary white at 8% for Hover and 10% for Focus over its opaque primary.
The inspected Pressed variant has an 8% state layer plus spatial ripple.
Tonal uses on-secondary-container at 8%/10%; outline uses on-surface-variant;
text uses primary. Thus the state moves the surface toward its foreground:
a dark filled Light button lightens; a pale tonal Light button darkens.
Labels stay stable through these interactions. Disabled container uses on-surface 10%
and content 38% in the inspected kit.

The kit contains a distinct blue secondary/tonal family. Kiskadee intentionally replaces
that organization with the participating intent family: red on pale red, green on pale
green, primary on pale primary, and neutral on the authored tinted neutral.

The absence of a separate secondary intent is deliberate. See
[the secondary color decision](../colors/secondary-color-decision.md) for why
emphasis handles hierarchy and why two similar hues do not establish an intuitive
semantic distinction. The neutral's visible blue tint remains a separate
homologation decision.

## Color lookup and shared formula

All colors resolve with the existing preset getter; no primitive assets or generator settings change.
The formula is independent of specific seed HEX values.

| Input | Lookup | Rationale |
| --- | --- | --- |
| Light onSubtle high | participating family vivid reference | Filled semantic identity. |
| Dark onSubtle high | vivid +6 chromatic; neutral vivid +0 | Light filled surface with dark text; neutral already has its vivid reference near the light endpoint. |
| Light onSubtle medium | participating family L7 | User-approved stronger tonal container, shared by all intents and segments. |
| Dark onSubtle medium | participating family subtle reference | Existing soft intent-colored container. |
| onSubtle non-high content | family L65 / D85 | Explicit Kiskadee foreground selection for contrast with soft and transparent surfaces. |
| onVivid high | pure light cap; family L65 text | Fluent-style inverse control for a strong background. |
| onVivid medium | Light subtle at 14/10/12/7% for Rest/Hover/Focus/Pressed | Fluent-guided translucent treatment that retains label contrast. |
| Low outline | content at 35%, or 40% onVivid | Family-aware Kiskadee outline; stable across transient states. |
| Disabled | physical on-surface cap at 10% container, 38% content, 12% outline | Shared across intents; light/dark polarity follows the surrounding surface. |

High/medium opaque state layers are composed in sRGB at build time.
Hover is 8%, Focus 10%, Pressed 12%. The 12% uniform Pressed layer is an explicit
static Kiskadee adaptation so the pressed palette remains visible without freezing
a spatial ripple. Existing ripple remains active. Low/lowest use foreground alpha
layers over a transparent Rest surface.

Medium/low/lowest Selected use the high container and high content, with selected
Hover/Focus/Pressed recomputed from that container. High Selected uses a 4% layer
at Rest and the same 8/10/12% interaction targets, without stacking layers repeatedly.
Borders are absent for high/medium/lowest and removed when low is selected.

Pending follows Fluent's per-slot treatment: opaque filled containers 60%, label 70%,
low outline 20%; onVivid medium uses 11%. Icon/disclosure keep Rest strength for
spinner legibility. Disabled overrides pending and selection through existing state precedence.

## State and composition ownership

e1 owns surface/border interaction states. e2 label, e3 icon and e5 disclosure use
parent-state references for selected, pending (label only), and disabled colors.
Stable foregrounds and borders omit redundant transient states. No Rest-equal Focus
palette reset is required. Focus surface treatment coexists with the existing external ring.

Content surface context is explicitly published for both themes, both input surfaces,
all four intents and emphases. Selected medium/low/lowest publish the filled context;
disabled returns to the inherited surrounding context.

## Validation

- Focused tests cover both segments, full matrix availability, family isolation,
  parent-state ownership and direction of the Light state layers.
- Enabled and selected Rest/Hover/Focus/Pressed text contrast is checked at 4.5:1
  on opaque filled surfaces, physical theme caps and the canonical primary vivid backdrop.
  This does not guarantee contrast on arbitrary consumer-supplied backgrounds.
  Pending and disabled are not asserted to meet the enabled threshold.
- Build/Showcase sync and sparse-state audits check published outputs.
- Visual homologation is user-owned; no browser/pixel-equivalence claim is made.

## Medium container refinement (2026-09-15)

Status: **Kiskadee extension**, approved by the user after comparing Google Sheets
Share/Upgrade and Gmail Compose/Upgrade screenshots. Screenshot samples indicate
stronger tonal fills, but are not asserted to be official CSS token values.
Light/onSubtle Medium now selects L7 through the existing intent getter: default
primary `#D0E2FF`, default neutral `#C8E4FF`. This explicit tonal selection also
applies to Purple and the destructive/positive intent families. It does not change
the shared subtle reference, primitive assets, generator, Dark or onVivid recipes.
Hover/Focus/Pressed retain their existing 8/10/12 percent foreground state layers
over the new base. Pending derives from that base; Selected and Disabled retain
their previous recipes. Contrast tests include Default and Purple.
