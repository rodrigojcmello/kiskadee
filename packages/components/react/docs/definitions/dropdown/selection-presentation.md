# Dropdown Selection Presentation

Status: canonical p-react definition.

Dropdown selection presentation has two independent axes. Neither axis changes the semantic
selection state owned by Menu, Select, or another headless consumer.

| Leading icon composition | Selected item background | Presentation |
| --- | --- | --- |
| `item-and-selection` | `false` | Classic selection indicator plus consumer icon |
| `item-and-selection` | `true` | Two leading tracks with a Selected background |
| `selection-only` | `false` | Compact selection indicator without a Selected background |
| `selection-only` | `true` | Compact selection indicator with a Selected background |

## Options And Precedence

`leadingIconComposition` accepts `item-and-selection` or `selection-only`.
`selectedItemBackground` accepts a boolean. Both options are available on the Dropdown visual
provider/root and on collection-owning APIs such as `Dropdown.Items`, `ButtonMenu.Content`, and
`ButtonMenu.SubContent`.

Resolution order is:

1. the nearest collection override;
2. the Dropdown Root or VisualProvider override;
3. `global.components.dropdown.options` from the active preset artifact;
4. the portability defaults `item-and-selection` and `true`.

The portability defaults complete an optional behavioral contract. They do not supply style
values, colors, spacing, or glyph fallbacks.

Each submenu owns a separate collection scope. It inherits both resolved options unless its
`SubContent` overrides one or both. Runtime changes are applied while the menu remains open.

## Selected Background

Selected remains a semantic and interaction state regardless of the background option. Checked
roles retain `aria-checked`, `data-selected`, their E-I indicator, and any Selected foreground
colors published for labels or icons.

`selectedItemBackground=false` gates only the generated `e2 (dropdown-item).boxColor` rules whose
state contains Selected. Normal Hover and Pressed rules remain active. The React presenter adds an
internal class only when the gate is enabled; Structural CSS never authors a color or a fallback.

## Leading Icon Composition

`item-and-selection` preserves separate `e10 (dropdown-selection-indicator)` and
`e3 (dropdown-icon)` tracks. `selection-only` removes `e3` entirely, including its wrapper and
spacing, while preserving `e10` for checkbox and radio items.

MenuTree leading CP-I renderers are not invoked in `selection-only`. Trailing CP-I remain supported.
Unchecked selectable items retain their E-I wrapper so the selection track stays aligned. A
collection with no selectable items and no rendered leading icon has no leading track.

The option suppresses only the supported `Dropdown.Icon` slot. Arbitrary content placed outside
that slot is not interpreted as a leading icon.

## Presenter Scope

ButtonMenu and ContextMenu reuse this Dropdown contract, including their submenus and TreeContent.
AdaptiveButtonMenu forwards it only to its Dropdown presenter. BottomSheetMenu remains an
independent presenter and does not consume these options.
