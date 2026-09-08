# iOS 27 Apple BottomSheet Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/ios-27-apple/components/bottom-sheet.schema.ts`.

## Sources

- [Apple HIG: Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [Apple HIG: Action sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets)
- [iOS and iPadOS 27 Community: Action Sheet example](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=5580-104363)
  - file key: `GeO2lMY65IAFczDmjs6oei`; example: `5580:104363`; source component: `5446:10266`.
- [Approved Apple tonal mapping](../colors/figma-to-kiskadee.json)
- [Dropdown evidence](dropdown.md) for the independent anchored menu presenter.

The former reference `507:24673` identifies Buttons, not Sheets, and is not sheet-component evidence.

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Resizable Sheet behavior | Apple HIG Sheets | Detents, grabber, modal/nonmodal distinction, Back/Close navigation | **Official adapted** |
| Action Sheet visual content | `5580:104363` / `5446:10266` | Light title, description, three pill actions, destructive action, geometry and material | **Official adapted** |
| Light and Dark opaque tokens | Approved Figma color-variable mapping | Elevated background, normal Labels/Fills, Red, separator | **Official adapted** |
| BottomSheetMenu hierarchy and scrolling | Existing framework capability | Long lists, grouped options, recursive pages | **Kiskadee extension** |
| Exact native resizable Sheet dimensions | Figma | Resizable Sheet node was not extracted | **Not inspected** |
| Darker | Kiskadee theme | Dark elevated surface with independently addressed global profiles | **Kiskadee extension** |

## Official Contract

Sheets support scoped tasks; iOS permits modal and nonmodal presentation. A resizable sheet can
rest at medium/large or custom detents and uses a grabber to signal resizing. Back returns to the
previous step; it does not dismiss the sheet. This preset retains the existing modal-only behavior,
standard/maximum heights, swipe expansion/dismissal, and Back-based page navigation.

Action sheets offer choices after a deliberate action. Apple recommends short titles, messages only
when needed, prominent destructive choices, and avoiding scrollable action sheets. Kiskadee's
scrollable BottomSheetMenu is therefore broader than the native Action Sheet contract.

## Color And Token Provenance

Apple Gray is generated asset `n.black.v2`, published as `primitive.black.v1`. Existing semantic
intents remain `bottomSheet.neutral -> neutral` and `bottomSheet.destructive -> redLike`. All exact
positions use the established legacy `c` getter and the approved source mapping.

| Source concept | Source Light / Dark | Lookup and generated mapping | Decision |
| --- | --- | --- | --- |
| `Backgrounds/Primary - Elevated` | `#ffffff` / `#1c1c1e` | Physical Light cap L0; exact Dark D5, both exact matches | Opaque Sheet surface |
| `Labels/Primary` | `#000000` / `#ffffff` | Global `neutral.standard.<theme>.onSubtle.medium`; caps L100/D100 | Header and action text |
| `Labels/Secondary` | `#3c3c43` 60% / `#ebebf5` 70% | Global `low`; L70 `#3d3d3f` 60% / D95 `#ebebee` 70% | Supporting text and group headings |
| `Labels/Tertiary` | Same source hues, 30% in both modes | Parent-state global `lowest`; L70/D95 at 30% | Disabled text; same source role reused by grabber |
| `Fills/Secondary` | `#787880` 16% / `#787880` 32% | Exact L35 `#7b7b7e` 16% / D55 `#7a7a7c` 32% | Source-backed pill-action Rest fill |
| `Fills/Primary` | `#787878` 20% / `#787880` 36% | Same promoted neutral L35/D55 at 20%/36% | Hover adaptation; next stronger semantic fill |
| Pressed continuation | No native state token inspected | Same L35/D55 at 24%/40% | Kiskadee extension: another 4 percentage points after Hover |
| `Accents/Red` | `#ff383c` / `#ff4245` | `bottomSheet.destructive` reference `vivid +0`; L26 `#ff383c` / D65 `#e85752` | Destructive label; source-backed Dark tonal adaptation |
| `Separators/Non-opaque` | Black 12% / white 17% | Global contour `neutral.standard.<theme>.onSubtle.low` | 0.5 px surface contour; groups reuse `subtle` separator |
| Modal dimming | Physical black, alpha is framework-owned | Physical black cap L100 at 32% | Retains existing scrim; numeric opacity is a Kiskadee extension |
| Native exterior shadow | Physical black 25% | Global outer `s:lg:4`: `0 8 48 0` | Source shadow without glass reflection layers |

The approved mapping records all source/generated distances. No primitive asset is changed.
The native Action Sheet uses Liquid Glass; replacing its material with the opaque Elevated surface
is explicitly a **Kiskadee extension**, not an exact reproduction of that material.

## Kiskadee Mapping

| Kiskadee appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| Modal sheet with grabber | Resizable iOS Sheet | **Official adapted** | Preserve existing dialog and gesture capabilities |
| Centered pill actions | Inspected Action Sheet content | **Official adapted** | 48 px one-line action, semibold text, neutral fill and destructive Red |
| Opaque surface with 34 px corners | Action Sheet geometry, Elevated color | **Kiskadee extension** | Rounded source geometry within the existing edge-attached sheet |
| Standard/maximum heights | Medium/large detent concepts | **Official adapted** | Existing framework caps remain 60dvh/90dvh |
| Structured rows, descriptions, shortcuts, groups | Shared menu topology | **Kiskadee extension** | Existing slots remain independently usable |
| Selected options | Menu checkmark semantics | **Kiskadee extension** | Checkmark carries selection; no persistent extra selected fill |
| Square mode | Existing framework radius vocabulary | **Kiskadee extension** | Remains available without claiming native fidelity |

## Schema Mapping

- `e1`: black scrim, explicitly identical in `onSubtle` and `onVivid`.
- `e2`: opaque surface, 34 px source Action Sheet corners and 0.5 px contour; the edge attachment
  remains the BottomSheet structural contract. Its two parent contexts resolve identically.
- `e3`: existing 36 x 5 px grabber with 8 px top and 4 px bottom spacing. This geometry remains a
  Kiskadee adaptation, not a claimed iOS 27 measurement; Labels/Tertiary gives its neutral paint.
- `e4`, `e5`: header padding 8/22/24/22 and `label-medium` (17/22 Semibold), derived from the
  source's 14 px outer inset plus 8 px title inset and 24 px title-to-actions spacing.
- `e6`: 14 px side/bottom action inset, matching the source Action Sheet content inset.
- `e7`, `e9`: 13 px vertical and 16 px horizontal padding plus 17/22 Semibold label create a 48 px
  one-line pill; radius 100 px and an 8 px gap match the source actions. Existing structural CSS
  removes the last item margin in each typed group.
- `e8`, `e11`, `e15`: existing 20 px content and 16 px trailing/checkmark icon profiles. The
  centered default hides content icons; structured mode remains available.
- `e10`, `e13`, `e14`: 13/18 global auxiliary text profiles; group heading is semibold.
- `e12`: automatic global `subtle` boundary between typed groups. Group separator topology is a
  Kiskadee extension; native Action Sheet buttons instead use spacing.

## Shared Formula And State Ownership

Every row intent shares the source neutral pill fill; destructive meaning is carried by its label.
Rest is Fills/Secondary. Hover adds four percentage points of alpha and Pressed adds eight; only
these state changes are emitted. Disabled deliberately repeats Rest to clear transient paint.
Selection only adds the existing checkmark, so there is no redundant Selected background state.
Disabled child text uses parent-state global foreground references. Keyboard focus stays in the
existing global ring rather than introducing a duplicate fill.

The scrim and surface sit outside the descendant `SurfaceContextProvider` reset, so both explicitly
publish `onSubtle` and `onVivid`. Inside the opaque sheet, controls resolve `onSubtle`. Darker reuses
Dark's elevated surface and fills, preserving separation from a darker page canvas.

## Deferred Or Unsupported

- Nonmodal sheets and native grabber-tap detent cycling remain **Deferred** outside this preset edit.
- Liquid Glass, vibrancy, and inset material highlights remain **Deferred**; no material simulation
  is emitted.
- A separate exact resizable Sheet component and a Dark Action Sheet screenshot are **Not inspected**;
  Dark colors come from the independently inspected source variable collection.
- Source action descriptions use Body 17/22; the shared optional row description slot instead uses
  13/18 to remain secondary in the broader BottomSheetMenu topology (**Kiskadee extension**).

## Validation

- Inspected Figma design context and reference screenshot for `5580:104363`.
- Focused tests cover every theme, both external contexts, meaningful pressed/disabled behavior,
  destructive identity, and the existing public component contract.
- Aggregate build and rendered Showcase verification accompany integration; this document does not
  claim that a native material or gesture implementation was introduced.
