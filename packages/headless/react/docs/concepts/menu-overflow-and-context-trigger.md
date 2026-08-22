# Menu Overflow And Context Trigger

Status: canonical Headless React definition.

Menu owns semantics, focus, keyboard navigation, selection, and submenu state. Dropdown owns no
menu behavior. The shared anchored-overlay primitive owns only reference geometry, placement,
collision, available-size measurement, dismissal, and portalling.

`Menu.ContextTrigger` registers both a real DOM reference and a virtual point reference. The real
element supplies direction, dismissal context, and focus restoration; the virtual reference
supplies pointer or keyboard coordinates and keeps `contextElement` linked to the real area. A
consumer handler runs first. Cancellation preserves the native menu, and a disabled trigger never
prevents it. Pointer opening uses the exact event point; keyboard opening uses the logical
block-end/start-inline corner.

Root content keeps the existing vertical flip. Submenus use the following explicit fallback order:

- LTR: `right-start`, `right-end`, `left-start`, `left-end`;
- RTL: `left-start`, `left-end`, `right-start`, `right-end`.

After flip, cross-axis shift may overlap the parent to keep the floating element visible. Keyboard
open/close direction remains logical rather than following the final physical placement.

The size middleware reports `availableHeight` and `availableWidth` in render state but writes no
visual CSS. Styled presenters decide how those measurements limit surfaces. Menu calls
`scrollIntoView({ block: 'nearest', inline: 'nearest' })` whenever keyboard navigation, Home/End,
or typeahead moves focus. A captured scroll from the parent viewport closes its active submenu
with reason `parent-scroll`.
