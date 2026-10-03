# Layout Contract

Layout is a public passive composition helper. It owns spacing, child flow, alignment and equal-width
grid columns. It has no palette, surface context, border, radius, shadow, interaction state or
Headless primitive. Existing Card and Container contracts are unchanged.

## Anatomy

- `e1` is the frame: a `div` receiving public HTML attributes, ref, className, padding and margin.
- `e2` is the child flow: a nested `div` receiving flex/grid structure and spacing between children.

Children render once, directly inside e2. Layout does not clone children, insert item wrappers,
change their roles, or publish a new surface context. Both nodes are deliberate: the frame and flow
select independent padding tokens, which use the same canonical variable names on different nodes.
`classNames.e1` and `classNames.e2` permit consumer styling of each region. Native `style` applies to
the frame; native structural styling remains available through the slot class names.

Block flow uses `flow-root` to keep child margins inside the flow region. Flex and grid preserve
source order; reverse flex changes visual order only. Grid is a visual arrangement and does not
create an ARIA grid or keyboard navigation model.

## Spacing API

`padding` and `margin` accept one public `ComponentSize`, `false`, or an object with logical edges:

```tsx
<Layout padding="md" margin="sm" />
<Layout padding={{ inline: 'md', block: 'sm', blockEnd: false }} />
<Layout margin={{ inlineStart: 'lg', inlineEnd: 'sm2' }} />
```

Supported edges are `blockStart`, `blockEnd`, `inlineStart`, `inlineEnd`; `block` and `inline` select
both edges of the corresponding axis. A specific edge wins over its axis, including `false`.
Omission and `false` apply no spacing and do not consume a size slot. Negative margins and raw
numeric spacing are outside this initial helper API; consumers retain ordinary native styling.

`gap` accepts a public size, `false`, or `{ row, column }`. It applies to flex/grid flow. The frame's
padding and margin, and each gap axis, choose their sizes independently:

```tsx
<Layout display="grid" columns={2} padding="md" margin="sm" gap={{ row: 'lg', column: 'sm2' }} />
```

All eleven existing size slots are authored for all ten spacing properties. Each preset must use
the same values for padding, margin and flow spacing at a given size. The initial first-party
recipe is a Kiskadee calibration. Values remain preset-owned, not React constants. Explicit size
selection is stable across density and theme changes; Layout has no implicit density-driven spacing.

The public `gap` prop is not a new Schema style attribute. Flow `paddingTop` owns row spacing and
`paddingLeft` owns column spacing. Its arbitrary, reversible children make the relationship a
flow-owned internal space rather than a margin on one particular child. Style Emission Policy
emits these as tokens, consumed as `row-gap` and `column-gap` in Web structural CSS. Other platforms
may implement the same relationship using their native layout mechanisms.

## Flow and responsiveness

- `display`: `block` (default), `flex`, or `grid`.
- `direction`: `row` (default), `row-reverse`, `column`, or `column-reverse`; relevant to flex.
- `wrap`: enables flex wrapping; default false.
- `align`: `start`, `center`, `end`, `stretch` (default), or `baseline`.
- `justify`: `start` (default), `center`, `end`, `between`, `around`, or `evenly`.
- `columns`: a count from 1 through 12 or a map from canonical viewport breakpoints to counts.

```tsx
<Layout
  display="grid"
  columns={{ 'bp:all': 1, 'bp:md:2': 3, 'bp:lg:1': 4 }}
  gap="md"
/>
```

Columns are a bounded structural choice, not a pixel scale. The Builder generates one column class
per breakpoint using the active schema's viewport thresholds. React selects the classes and writes
the configured counts to the matching instance-local CSS variables on `e2`. These values are
available during server rendering; no effect or viewport subscription is needed. React does not
generate stylesheets or copy Core breakpoint defaults. Without a column selection, CSS grid creates
its ordinary implicit single column. These are viewport breakpoints, not container queries.
Responsive spacing props are outside this first API.

Only explicitly configured, published breakpoints receive a class and a local variable. Omitted
breakpoints are not inferred: an omitted higher breakpoint leaves the previous configured rule active,
and a map without `bp:all` has no base column rule. Each active rule consumes a value defined on
that same `e2`, preserving independence between nested and sibling Layouts despite CSS custom
property inheritance. Removing a selection removes both outputs; changing to block or flex flow
disables both. Runtime values outside the integer range 1 through 12 activate no column rule.
The public `style` attribute remains on `e1`; internally generated column variables belong to `e2`.

## Artifact handoff

Layout's element-local `sp[property][size]` contains references to existing token-only utilities.
The keys `pt/pr/pb/pl/mt/mr/mb/ml` select authored properties independently; consumers never apply
multiple aggregate `s` recipes to obtain independent padding and margin. `e2.gc[breakpoint]`
contains one generated column class reference. Both buckets carry class references only.
Core's `layoutColumnCssVariables` defines the corresponding variable names for Builder and React;
the consumer never derives them from compacted CSS classes.

This is Layout-specific independent property selection, not Structural Utility Projection: each
element consumes its own values on its own node. No projection registry entry or `p` bucket is
needed. No consumer parses CSS or class strings to recover values. The existing component resource
boundary owns stylesheet readiness, including this palette-free component's core stylesheet.

See the [Core Layout definition](../../../../../core/docs/definitions/layout.md) and
[Web Builder Layout artifact contract](../../../../../web-builder/docs/definitions/layout-artifacts.md)
for validation and producer details. Showcase `/layout` demonstrates all sizes, independent selections, logical edges, flex,
grid and responsive columns. It does not migrate existing component compositions.
