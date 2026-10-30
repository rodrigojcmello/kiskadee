# Button state indicator

The optional selection indicator follows the shared
[state-indicator contract](../../../../../../docs/definitions/state-indicators.md).
`e11` authors the inside recipe and `e12` authors the outside recipe. They are independent optional
elements consumed by one decorative span of the existing Button, not additional controls or public
slots. This follows
[alternate element recipes for one rendered part](../../../../../../docs/definitions/composition-strategies.md#alternate-element-recipes-for-one-rendered-part):
placement selects one complete recipe for that part.

## Resolution and state

`selectionEmphasis` controls the presentation strength and indicator activation. Levels `low` and `high` request
the indicator; `lowest` and `medium` omit its anatomy. There is no independent `indicator` prop or
`indicatorScope` policy. Omission resolves the preset's selection emphasis, then `lowest`, in all
layouts. A requested line still requires complete geometry and paint coverage, selection and an
available action. Changing level, layout or coverage can add or remove the node; ordinary state
changes retain it. See [selection emphasis](./selection-emphasis.md) for the four levels.

`selectionIntent` separately chooses the selected appearance's intent, with the base intent as
its inherited default. Indicator paint follows that effective intent and emphasis, including any
whole-recipe coverage fallback, so the line contrasts with the surface actually being painted.
The independent intent choice does not add indicator activation states or geometry.

`indicatorPlacement` resolves from the Button prop, then the preset option, then `inside`.
The other placement is `outside`; both anchor to the lower edge. Inside requires `e11` and published
`indicator.sizesByRadius` coverage; outside requires `e12` and `indicator.outsideSizesByRadius`.
The active recipe must provide scale/radius classes for the effective size and radius, and paint
for the exact effective paint intent, emphasis and ambient Surface Context. Unsupported
coordinates omit the anatomy; they do not borrow a neutral or weaker-emphasis recipe.

`indicator.stackedSizesByRadius` and `indicator.stackedOutsideSizesByRadius` supply independent inside
and outside coverage when the actual composition is stacked, using `e8` border geometry instead of
`e1`. A stacked request that falls back to horizontal composition uses the corresponding horizontal
coverage. An unavailable recipe never falls back to the other placement's element or metadata.

With adaptive density, the root keeps its generated CSS adaptive alias while the indicator uses
`useResolvedComponentScale` to select current capability coverage and geometry. It follows the
existing density breakpoints through media-query changes, without measuring the Button or adding
an explicit size to its public API.

`useButtonArtifactConfig()` exposes `indicatorSizesByRadius`, `stackedIndicatorSizesByRadius`,
`outsideIndicatorSizesByRadius` and `stackedOutsideIndicatorSizesByRadius` to consumers such as the
Showcase. Each recipe's geometry comes from the core component artifact and its ordinary `c` paint
comes from the selected palette artifact. Standard split-artifact loading merges both buckets;
neither element has a placement-specific palette structure.

When coverage exists, the same `aria-hidden` span stays mounted across state changes. It has no
focus, events or accessible name. `controlState === true` activates its paint; Hover, Focus and
Pressed preserve Selected unless the preset authors another state delta. Explicit `aria-pressed`
does not set `controlState`. Native disabled, ARIA disabled, interaction locks, pending and projected
Disabled/Pending hide the indicator without clearing `controlState` or changing existing ARIA
semantics. A restored action reveals the same selected indicator. Levels `medium/high` keep
`controlState` and the root selection activator while consuming the normal High paint projection;
the indicator therefore continues using its Selected recipe over the actual High Rest surface.

## Overlay geometry and clipping

The native `<button>` remains the semantic root, ref target, event owner and measured border box.
The active recipe is an absolutely positioned child. Its authored width and height do not contribute to layout,
content spacing or `_boxHeight`. It stays horizontally centered in LTR and RTL. No browser measurement
or reference-height arithmetic determines its position.

Both recipes use the same `k-btn-e11` structural span, with `k-btn-e11a` for outside geometry. Changing
between supported placements replaces the authored recipe classes on that span without adding a
second indicator. The optional feedback viewport remains a separate passive structural extra.

- `boxWidth` supplies the fixed nominal width; it is never derived from icon dimensions. `boxHeight`
  supplies the fixed height.
- The active radius bucket supplies its own radius, independently of the Button corners.
- `marginBottom` is the inside distance from the lower outer border edge.
- `marginTop` is the outside distance below that edge.
- `marginLeft` and `marginRight` provide the narrow-control inline safety minima. Structural CSS
  limits the maximum width to the actual border box minus twice the larger minimum, clamped at zero.
  This preserves centering and honors both minima even when they differ, while retaining the nominal
  `boxWidth` whenever it fits. The budget accounts for Group seams that remove one or both inline
  borders. These inline minima are independent of the inside/outside block distances.
- Structural positioning compensates the root's real border using inherited `--k-bdw` because
  absolute children are positioned against the padding box.

The root modifier `k-btn-e1k` establishes an isolated, overflow-visible containing block. It does
not change padding, size or margins. When activation feedback loads, structural extra `x6` clips
only that effect; it follows the rendered corner radii, including animation and connected Group
corners. Feedback measurements and input handlers continue to use the native Button. Progress
retains its separate clipped viewport, and overlaid Badge content stays above the indicator.
The focus outline remains on the root and is not clipped by either viewport.

The indicator does not change the content Surface Context or its published map. Both recipes consume
the Button's ambient context and effective paint intent and emphasis through ordinary palette resolution.
The preset authors `e11.c` against the Button surface and `e12.c` against the surrounding surface;
runtime does not infer either recipe from the context produced for children. Those children continue
to receive the same produced context as before. Group children remain direct native Button siblings,
preserving the connected seam and their independent state.

An outside overlay can be clipped by an ancestor's overflow or extend a scroll container's painted
overflow. The surrounding application must provide clearance where required, as it does for an
external focus ring or Badge. The Button does not mutate ancestors, reserve space, use a portal or
increase its height to compensate.
