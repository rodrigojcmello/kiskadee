# Shared Separator

`Separator` is the public line used between independent regions of content. Its preset
recipe owns only color and thickness. Orientation belongs to the React structure, while spacing and
inset belong to the surrounding layout.

```tsx
<Separator />

<Separator orientation="vertical" emphasis="low" />

<Separator intent="primary" />
```

The component uses the native `hr` separator semantics and publishes its orientation through
`aria-orientation`. It does not accept children, a profile, direct color, margin, or
padding. A vertical Separator expects its parent layout to provide a block axis through which it can
stretch.

Internal component dividers do not render this public component. Dropdown and BottomSheet emit
their own automatic group boundaries from `e7` and `e12` respectively and may share only the preset
recipe and atomic utilities with `Separator`. This avoids a component class-map dependency inside
another component and prevents manual dividers from weakening the group contract.

`intent` defaults to `neutral`; presets may optionally publish `primary`. The shared
recipe always requires Neutral Medium and allows Primary Medium plus optional
emphasis levels. Missing Primary recipes do not fall back to Neutral at runtime;
consumers choose only published combinations. Other colored, interactive, stateful,
or component-specific lines remain owned by their component.

`emphasis` defaults to `medium` and selects a preset-authored ComponentEmphasis. The component
inherits its local SurfaceContext and accepts `surfaceContext` as an explicit override. Neither
prop is forwarded to the DOM. Presets must publish the requested emphasis; p-react does not
invent a fallback color. Fluent publishes Low and Medium in onSubtle and onVivid.

Every authored emphasis remains Rest-only.
