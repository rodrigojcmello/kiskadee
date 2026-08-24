# BottomSheet And Adaptive Menu Composition

Status: canonical definition.

`BottomSheet` is an independent modal surface that enters from the viewport block end. It is not a
Dropdown variant and never consumes Dropdown schema elements, classes, presence profiles, or
artifacts.

`Dropdown` remains an anchored visual collection. `BottomSheet` remains a modal dialog. They may
present equivalent actions, typed groups, automatic group boundaries, and recursive navigation through a
shared `MenuTree`, but capability equivalence does not imply identical DOM, focus, keyboard, or
ARIA semantics.

## Presentation Layers

- `ButtonMenu` always presents a Menu inside Dropdown and preserves its existing JSX API.
- `BottomSheetMenu` always presents one MenuTree page inside BottomSheet.
- `AdaptiveButtonMenu` chooses one presenter from viewport policy or an explicit override. It mounts
  only the chosen presenter and freezes that choice until the open cycle ends.

The fixed presenters remain public. Adaptive composition must never make BottomSheet the mandatory
mobile form of every Dropdown; applications may intentionally keep an anchored Dropdown on compact
or touch devices.

## Height Axes

`initialHeight` is configuration for the beginning of each open cycle. `snapPoint` is internal
runtime state and may change after a gesture. Both use `content | standard | maximum`, but they are
different axes.

- `content`: natural content height capped at `60dvh`;
- `standard`: fixed `60dvh`;
- `maximum`: fixed `90dvh`, with Body still scrollable.

Closing and reopening resets the internal snap point to `initialHeight`. Upward swipe may move
content or standard to maximum only when the current page overflows. Downward swipe closes directly,
including from maximum.

These caps are framework geometry rather than preset values. Presets own the sheet surface, item,
text, icon, separator, and shadow recipes.

## Motion And Navigation

The vertical sheet entrance and exit always use the eager Motion runtime. Every open cycle enters
from below and every close exits below. This component intentionally has no static path, reduced
motion branch, `.no-transitions` branch, or public presence opt-out.

Horizontal page navigation is a separate lazy module. `pageTransition="none"` does not import it.
`pageTransition="slide"` loads it without blocking navigation; a page change remains immediate if
the module is not ready. Push enters from logical inline end and Back reverses the direction,
including in RTL.

Only the current page participates in dialog navigation. A child page shows a Button-based Back
control naming the parent page, the current page title below it, and a Button-based Close control.
Back restores the parent trigger focus and its page scroll position. Escape closes the complete
sheet instead of popping one page.

## Item Layouts

`structured` preserves the Dropdown-equivalent icon, text, metadata, and trailing tracks.
`centered` centers item content horizontally. `centeredIcons="hide"` removes only content-provided
leading and non-functional trailing icons. It never removes Back, Close, submenu disclosure,
radio checkmarks, labels, descriptions, or end text.

## Groups And Boundaries

BottomSheetMenu consumes the same typed MenuTree groups as ButtonMenu: command, checkbox, and radio
rows cannot be mixed in one group, and submenu pages also contain only groups. Each
`BottomSheet.Group` emits an `e12` boundary before itself; Structural CSS hides the first boundary
of the current page, so enabled paint produces exactly `n - 1` visible dividers for `n` groups.

`groupSeparators` is a BottomSheet-only visual option. `true` is the portability default and is
published explicitly by every official preset; `false` suppresses the boundary DOM without merging
groups or changing their selection semantics. The public BottomSheet composition does not expose a
manual Separator part. Consumers create another group when another contextual boundary is needed.

## Modal Contract

BottomSheet v1 is modal-only: portalled dialog semantics, focus containment, outside content inert,
scroll lock, visible Close, Escape dismissal, scrim dismissal, and trigger-focus restoration. It
does not integrate with browser history, provide horizontal swipe navigation, or offer a persistent
non-modal sheet.
