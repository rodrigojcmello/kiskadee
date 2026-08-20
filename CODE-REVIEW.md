# Code Review

## Scope

- Request: correct every pertinent finding previously recorded for `codex/bottom-sheet`
- Diff source: `master...codex/bottom-sheet`, plus the current worktree fixes
- Updated: 2026-08-20

## Resolved Findings

### [Resolved] Radio selection identity now matches across presenters

`ButtonMenu.TreeContent` now resolves the selected radio node and reports its item ID in
`MenuTreeSelectionDetails`, matching `BottomSheetMenu`. A focused AdaptiveButtonMenu regression
selects the same radio through both presenters and verifies identical details.

### [Resolved] Nested BottomSheet slots use only the active item intent

The shared BottomSheet class-name map no longer resolves a default neutral palette for the six
item-owned slots (`e8`, `e9`, `e10`, `e11`, `e13`, and `e15`). Their palette classes are resolved
once, at render time, from the inherited item intent. A regression verifies that every listed slot
receives the destructive class without also receiving the neutral class.

### [Resolved] Centered radio checkmarks and leading icons use separate tracks

Centered rows now keep five functional grid tracks. The radio checkmark stays in column 1, the
leading icon uses column 2, text uses column 3, end text uses column 4, and the trailing icon uses
column 5. The BottomSheet Showcase permission radios now include leading icons so the supported
combination remains directly demonstrable.

Browser geometry for the selected `Can view` row confirmed adjacent, non-overlapping 24 px tracks:
checkmark column 1 at x=587.8125..611.8125 and icon column 2 at x=611.8125..635.8125.

### [Resolved] Programmatically focused page titles have a visible focus treatment

`BottomSheet.Title` now opts into the shared `k-foc` treatment and its structural selector no
longer suppresses the outline. Browser QA on the `Share workspace` page confirmed that the title
was the active `:focus-visible` element with a solid 2 px outline.

## Validation

- Focused Vitest suite: 4 files, 19 tests passed.
- Full `pnpm test`: 148 files, 1200 tests passed.
- `pnpm --filter @kiskadee/react-components run build`: passed.
- `pnpm --filter @kiskadee/showcase build`: passed; `/bottom-sheet` remains statically generated.
- Browser QA at `http://localhost:3001/bottom-sheet`: page and dialog rendered, lazy page navigation
  reached `Share workspace` and `Share permissions`, centered radio tracks did not overlap,
  selecting `Can edit` produced `Permission: edit` and closed the sheet, and console warnings/errors
  were empty.
- Biome checks for the changed TypeScript/TSX files: passed.
- `git diff --check`: passed.

## Remaining Findings

None from this review.
