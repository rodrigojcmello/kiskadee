# Shared Separator

`Separator` is the public neutral line used between independent regions of content. Its preset
recipe owns only color and thickness. Orientation belongs to the React structure, while spacing and
inset belong to the surrounding layout.

```tsx
<Separator />

<Separator orientation="vertical" />
```

The component uses the native `hr` separator semantics and publishes its orientation through
`aria-orientation`. It does not accept children, a profile, intent, emphasis, color, margin, or
padding. A vertical Separator expects its parent layout to provide a block axis through which it can
stretch.

Internal component dividers do not render this public component. Dropdown and BottomSheet emit
their own automatic group boundaries from `e7` and `e12` respectively and may share only the preset
recipe and atomic utilities with `Separator`. This avoids a component class-map dependency inside
another component and prevents manual dividers from weakening the group contract.

Colored, interactive, stateful, or component-specific lines remain owned by their component. The
shared recipe is restricted to neutral separators.
