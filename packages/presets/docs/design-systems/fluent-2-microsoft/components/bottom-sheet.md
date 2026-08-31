# Fluent 2 Microsoft BottomSheet Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/fluent-2-microsoft/components/bottom-sheet.schema.ts`.

## Sources

- [Fluent 2 React Drawer usage](https://fluent2.microsoft.design/components/web/react/core/drawer/usage)
- [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9230-4927)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - relevant node: `9230:4927`
- Existing local [Fluent Dropdown evidence](dropdown.md)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Overlay Drawer | Fluent Drawer usage | Modal overlay, dismissal, header/body anatomy, multi-step guidance, and body overflow | **Official adapted** |
| Bottom-edge placement and detents | No official Fluent BottomSheet contract found | None | **Kiskadee extension** |
| Menu rows and colors | Existing Dropdown evidence and tonal de-para | Light, Dark, and Darker item recipes | **Official adapted** |

## Official Contract

- Fluent Overlay Drawer is modal by default, dims and disables the main content, includes a clear
  dismissal path, and separates a header from a scrollable body.
- Fluent documents short multi-step Drawer flows and Back as a header action.
- The inspected guidance does not define BottomSheet detents, a grabber, or bottom-edge menu paint.

## Color And Token Provenance

| Source concept | Source value | Lookup | Kiskadee mapping |
| --- | --- | --- | --- |
| Modal overlay | Fluent Overlay Drawer modality | `cap(primitive.black.v1, dark, 32%)` | `e1.boxColor` scrim |
| Light surface | Neutral Background 1 | `cap(primitive.black.v1, light)` | `e2` surface |
| Dark/Darker surfaces | Existing Neutral de-para | `reference(bottomSheet.neutral, subtle +1/-1)` | `e2` surface |
| Handle | Existing compact neutral stops | `exact(bottomSheet.neutral, 45/55/50, component.bottom-sheet)` | Light/Dark/Darker `e3` handle |
| Destructive item states | Existing Menu adaptation | `exact(bottomSheet.destructive, 5/9/7, component.bottom-sheet)` | Hover/Pressed/Selected rows |
| Text hierarchy | Existing Menu adaptation | `reference(bottomSheet.neutral, vivid + offsets)` | `e5`, `e7` through `e15` |
| Drawer elevation | Approved Fluent shadow catalog | Global shadow profile | `effects.shadow.e2` |

All colors use promoted Fluent primitive assets through the strict FRF resolver. The handle and
destructive stops above are the complete closed `component.bottom-sheet` exact catalog; they are
not functional anchors. Light, Dark, and Darker resolve independently; no literal schema color is
used.

## Kiskadee Mapping

| Kiskadee appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| Modal surface, fixed header, scrollable body | Fluent Overlay Drawer | **Official adapted** | Translate Drawer anatomy to a bottom-edge modal surface |
| Neutral and destructive rows | Fluent Menu mapping | **Official adapted** | Resolve through independent BottomSheet roles |
| Bottom edge, grabber, detents, swipe | No inspected Fluent equivalent | **Kiskadee extension** | Supply framework behavior without claiming Fluent fidelity |
| Recursive pages | Fluent short multi-step Drawer guidance | **Official adapted** | Keep Back in the header and render one hierarchy level |

## Kiskadee Extensions

- Fixed `60dvh` standard and `90dvh` maximum geometry.
- Mandatory bottom-entry Motion and optional lazy horizontal page transition.
- Centered icon-free item layout as the preset default.
- Automatic `e12` boundaries between typed groups, with `groupSeparators: true`; both the option
  and the ability to suppress paint at runtime are Kiskadee extensions.

## Shared Formula

- BottomSheet owns independent intents and elements while reusing approved primitive families,
  typography profiles, icon sizes, separators, and shadow levels.
- Its automatic group boundary consumes the shared one-pixel `subtle` recipe. The geometry remains Fluent-derived,
  while the achromatic Black v1 color is the same explicit Kiskadee adaptation used by Dropdown
  and the standalone Separator.
- Item states remain sparse deltas over Rest and follow the existing Fluent Menu tonal mapping.
- The explicit transparent `disabled` item background is a terminal compound-state reset, retained
  so disabled rows cannot inherit hover, pressed, or selected paint.

## Deferred Or Unsupported

- Inline/non-modal Drawer behavior is **Deferred**; BottomSheet v1 is modal-only.
- Footer actions are **Deferred** from BottomSheetMenu; low-level BottomSheet remains composable.

## Schema Mapping

- `e1`: scrim; `e2`: surface; `e3`: handle; `e4`: header; `e5`: title; `e6`: body.
- `e7` through `e15`: independent menu-capability slots.
- `components.bottomSheet.options`: standard height, expand/dismiss swipe, lazy slide pages,
  centered items, hidden content icons, and enabled group separators.

## Validation

- Source behavior and extension boundaries recorded before schema authoring.
- Fluent tonal evidence remains the source for every Light/Dark lookup.

## Open Gaps

- A future official Fluent mobile BottomSheet source may supersede the Drawer adaptation.
