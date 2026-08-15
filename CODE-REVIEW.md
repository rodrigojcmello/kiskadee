## Scope

Reviewed all current staged, unstaged, and untracked changes for the shared Dropdown,
ButtonMenu, Select, Autocomplete, preset schemas, Builder publication, and Showcase routes.
The review prioritized browser/runtime cost and package-domain ownership.

Status: all four findings are resolved in the current working tree.

## Findings

### [P1] Split the visual Dropdown provider from the mechanical Dropdown root

`packages/components/react/src/components/Dropdown/Dropdown.tsx:85-88` couples the visual class-map
provider to `HeadlessDropdown.Root`. Semantic owners already have their own mechanical root:
`Menu.Root` mounts a headless Dropdown, while Select and Autocomplete own their overlay state. As a
result, ButtonMenu and both Showcase adapters mount an additional, unused Dropdown state machine,
ID pair, anchor state, memo, and context solely to access `Dropdown.Surface` and its slots.

Introduce an internal visual-only provider/root for Menu, Select, and Autocomplete adapters, and
keep the public styled `Dropdown.Root` as the convenient visual + mechanical composition for a
standalone Dropdown. This preserves the documented semantic boundary and removes duplicated
browser work.

### [P2] Keep stacking policy out of the headless overlay primitive

`packages/headless/react/src/internal/anchored-overlay.tsx:126-130` injects `zIndex: 10000` into every
consumer. This is a visual stacking decision in the Headless package and forces Menu, Select, and
Autocomplete into one global layer that may sit above dialogs or application overlays.

Return only Floating UI's positioning styles from the headless hook. Let the styled Dropdown or the
consumer's overlay system own z-index according to its visual/runtime context.

### [P2] Do not sort menu DOM nodes on every keyboard operation

`packages/headless/react/src/components/menu/Menu.tsx:138-153` rebuilds and DOM-sorts the item map
whenever `getItems()` is called. Opening, Arrow/Home/End navigation, and typeahead all call it, and
`focusAt()` calls it again for the same keystroke. Registration also triggers a root render per item.
This makes keyboard work repeatedly pay DOM comparisons and leaves Menu with a second collection
implementation beside `internal/collection.ts`.

Cache the DOM-ordered registry when registration/order changes, then navigate that snapshot. Extend
or reuse the shared collection helpers with Menu's focusable-disabled policy instead of duplicating
ordering and prefix-search logic in the component.

### [P2] Delete option refs when dynamic options unmount

`packages/headless/react/src/components/autocomplete/Autocomplete.tsx:498-503` and
`packages/headless/react/src/components/select/Select.tsx:650-655` store `null` under each option key
instead of deleting the key. Autocomplete is explicitly designed for filtered or async result sets,
so a session that sees many unique values leaves an ever-growing map of dead keys.

In both ref callbacks, call `delete(value)` when `node` is null; only call `set(value, node)` for a
mounted element. This keeps scroll-to-active lookup constant without retaining historical results.

## Resolution

- Added `Dropdown.VisualProvider`; ButtonMenu and the temporary Select/Autocomplete adapters no
  longer mount an unused mechanical Dropdown root.
- Removed the hardcoded stacking order from the Headless anchored-overlay primitive and documented
  stacking as visual/application ownership.
- Menu now computes DOM order only when item registration changes and reuses the shared Collection
  navigation/typeahead helpers during interaction.
- Select and Autocomplete delete option refs on unmount instead of retaining null entries.

## Validation

- Focused Vitest run: 10 files, 40 tests passed for Headless Collection, Dropdown, Menu, Select,
  Autocomplete, styled Dropdown, ButtonMenu, TextField input ref, and Core Button/Dropdown contracts.
- `pnpm --filter @kiskadee/react-headless build`: passed.
- `pnpm --filter @kiskadee/react-components run build`: passed.
- `pnpm --filter @kiskadee/web-builder run build`: passed for all 11 presets.
- `pnpm --filter @kiskadee/showcase build`: passed; 20 static routes generated.
- Focused Biome check on the new runtime/Core/Builder files: passed.
- `git diff --check HEAD`: passed apart from the repository fsmonitor daemon warning.
- Generated Dropdown class maps exist only for Fluent 2 Microsoft, iOS 27, and Material 3 Google,
  as intended.
- Root `pnpm test`: 124/125 files and 1003/1004 tests passed. The sole failure is an unrelated
  tonal-scale performance test that consistently takes about 5.2 seconds and exceeds its 5-second
  timeout, including when rerun alone.

## Notes For Follow-up Agents

- All review fixes were implemented without changing Core, preset, or Builder contracts.
- Browser visual QA was not started because the user previously requested control of the local
  development server.
- The unstaged cursor correction in `Dropdown.structural.scss` was included in the review.
- Keep `CODE-REVIEW.md` unstaged unless the user explicitly asks to stage it.
