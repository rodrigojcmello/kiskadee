# Material Design 3 Google BottomSheet Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/material-3-google/components/bottom-sheet.schema.ts`.

## Sources

- [Material Design 3 Bottom sheets overview](https://m3.material.io/components/bottom-sheets/overview)
- [Material Design 3 Bottom sheets specs](https://m3.material.io/components/bottom-sheets/specs)
- Existing local [Dropdown and Menu evidence](dropdown.md)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Bottom sheet concept | Material overview | Modal surface from the bottom edge | **Official adapted** |
| Exact component tokens | Material specs | The client-rendered token table was not extracted in this task | **Not inspected** |
| Menu rows | Existing local evidence | Item, icon, label, description, separator, and state recipes | **Official adapted** |

## Official Contract

- Material defines Bottom sheets as surfaces that enter from the bottom edge and expose contextual
  content or actions.
- Exact current Bottom-sheet colors, dimensions, and motion tokens were not extracted from the
  client-rendered specification in this task.

## Color And Token Provenance

| Source concept | Source value | Kiskadee mapping |
| --- | --- | --- |
| Dimmed modal background | Material modal relationship | `e1.boxColor`, independent `bottomSheet.neutral` lookup with alpha |
| Elevated sheet surface | Existing Material neutral surface and elevation catalog | `e2.boxColor`, border, radius, and `effects.shadow.e2` |
| Menu-like rows | Existing Material Dropdown/Menu adaptation | Independent `e7` through `e15` BottomSheet elements |

All schema colors resolve through `createPresetColorGetter()` and the existing Material primitive
assets. No literal color is introduced by BottomSheet.

## Kiskadee Mapping

| Kiskadee appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| Neutral sheet and rows | Material Bottom sheet plus Menu concepts | **Official adapted** | Reuse approved neutral tones through `bottomSheet.neutral` |
| Destructive row | Material semantic error/destructive family | **Official adapted** | Map `bottomSheet.destructive` to `redLike` |
| Light and dark palettes | Existing Material theme tracks | **Official adapted** | Emit independent `light` and `dark` class maps for `default` and `dynamic` segments |
| Recursive menu pages | No inspected Material Bottom-sheet MenuTree contract | **Kiskadee extension** | Render one hierarchy level at a time with Back and Close Buttons |
| Centered items without icons | Framework presentation policy | **Kiskadee extension** | Default `itemLayout=centered` and `centeredIcons=hide` |

## Kiskadee Extensions

- The fixed framework detents are `60dvh` and `90dvh`; they are not Material tokens.
- Mandatory eager vertical Motion and lazy horizontal page navigation are framework behavior.
- BottomSheet is modal-only in v1 and stays independent from Dropdown classes and artifacts.
- Automatic `e12` boundaries between typed groups and `groupSeparators: true` are Kiskadee
  extensions; applications may suppress their paint without changing group semantics.

## Shared Formula

- Rest is the base. Interaction states are retained only for visual deltas or selected-state resets.
- The explicit transparent `disabled` item background is an intentional terminal reset: it clears
  any hover, pressed, or selected background that would otherwise win in a compound disabled state.
- Icons, typography, separators, and shadows reuse approved global catalogs while every component
  element remains BottomSheet-owned.

## Deferred Or Unsupported

- Exact Material Bottom-sheet token extraction is **Not inspected**.
- Material-specific non-modal or persistent Bottom sheets are **Deferred**.

## Schema Mapping

- `e1`: scrim; `e2`: sheet; `e3`: handle; `e4`: header; `e5`: title; `e6`: body.
- `e7` through `e15`: item, icon, label, description, trailing icon, automatic group boundary, end text, group
  label, and checkmark.
- `components.bottomSheet.options`: `standard`, `expand-dismiss`, `slide`, `centered`, `hide`, and
  `groupSeparators: true`.

## Validation

- Source identity and adaptation boundaries recorded before schema authoring.
- Schema and generated-artifact validation cover both theme tracks for every authored segment.

## Open Gaps

- Exact Material Bottom-sheet component-token extraction remains **Not inspected**.
