# iOS 27 Apple BottomSheet Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/ios-27-apple/components/bottom-sheet.schema.ts`.

## Sources

- [Apple Human Interface Guidelines — Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [Apple Human Interface Guidelines — Action sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets)
- [iOS and iPadOS 27 Community](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24673)
  - file key: `GeO2lMY65IAFczDmjs6oei`
  - relevant source node: `507:24673`
- Existing local [iOS 27 System Color Evidence](../colors/ios-27-color-evidence.md)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| iOS resizable Sheets | Apple HIG Sheets | Modal/non-modal distinction, medium/large detents, grabber, swipe dismissal, Back/Close guidance | **Official adapted** |
| Action choices | Apple HIG Action sheets | Modal choices and destructive treatment | **Official adapted** |
| Exact iOS 27 sheet tokens | Community Figma | Color collection inspected; sheet component node not extracted | **Not inspected** |

## Official Contract

- iOS Sheets may expose medium and large detents, a visible grabber, vertical swipe dismissal, and
  Back/Close controls for hierarchical flows.
- Apple supports both modal and non-modal Sheets on iOS and iPadOS.
- Apple Action sheets are modal choices with a destructive style, but their action count is narrow.

## Color And Token Provenance

| Source concept | Source value | Kiskadee mapping |
| --- | --- | --- |
| Dimmed parent content | Apple modal Sheet relationship | `e1.boxColor` using approved Neutral with alpha |
| Sheet surface and foreground | Apple Gray mapping | `e2`, `e3`, `e5`, and neutral item slots |
| Destructive choice | Apple Red family | `bottomSheet.destructive` mapped to `redLike` |

Every lookup resolves through the promoted Apple assets documented by the iOS 27 tonal de-para.
Light and Dark resolve independently and no literal schema color is introduced.

## Kiskadee Mapping

| Kiskadee appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| Modal Sheet, grabber, swipe dismiss | iOS Sheet | **Official adapted** | Preserve the platform interaction model in a cross-platform web dialog |
| Standard and maximum snap points | Medium and large detents | **Official adapted** | Normalize to framework caps of `60dvh` and `90dvh` |
| Content-height initial state | Custom detent concept | **Official adapted** | Use natural content capped at the standard height |
| Recursive action pages | Back guidance plus menu capability | **Kiskadee extension** | Present one hierarchy level at a time inside the Sheet |

## Kiskadee Extensions

- BottomSheetMenu supports long scrollable menus; it is broader than Apple Action sheets.
- Horizontal page animation is lazy; vertical Sheet animation is eager and mandatory.
- Centered items without content icons are the default, with structured rows still available.
- Automatic `e12` boundaries between typed groups and `groupSeparators: true` are Kiskadee
  extensions; the paint may be suppressed without changing MenuTree semantics.

## Shared Formula

- Apple Gray and Red tones are reused through independent BottomSheet intents.
- Item states are sparse deltas over Rest and reuse the existing iOS Menu mapping where Sheet
  guidance does not define row paint.
- The explicit transparent `disabled` item background is an intentional terminal reset that clears
  hover, pressed, and selected paint in compound disabled states.

## Deferred Or Unsupported

- Apple non-modal Sheets are **Deferred**; v1 is modal-only.
- Exact iOS 27 sheet-component token extraction is **Not inspected**.

## Schema Mapping

- `e1`: scrim; `e2`: surface; `e3`: grabber; `e4`: header; `e5`: title; `e6`: body.
- `e7` through `e15`: action/menu capability slots.
- `components.bottomSheet.options`: standard initial detent, expand/dismiss swipe, lazy slide pages,
  centered items, hidden content icons, and enabled group separators.

## Validation

- Official behavior and adaptation boundaries recorded before schema authoring.
- Color mappings use the current promoted iOS 27 tonal assets.

## Open Gaps

- Exact Sheet surface/material tokens remain **Not inspected**.
