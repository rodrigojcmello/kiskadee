# Layout Artifacts

Layout is a scale-only component. Its Core schema owns two elements: `e1` (frame) authors the
four padding and four margin scales; `e2` (flow) authors `paddingTop` and `paddingLeft` scales
used structurally as row and column gaps. All spacing utilities use token-only Style Emission
Policy. Neither element requires palette resources.

After ordinary style-key shortening and class-map generation, `compileLayoutArtifacts` replaces
Layout's aggregate `s` buckets with `sp[property][size]` selectors. Property keys are
`pt/pr/pb/pl/mt/mr/mb/ml`; size keys retain the compact `all`, `sm:1`, `md:1`, and `lg:1` form.
Each selector references the exact existing shortened utility identity, including its emission
mode. This does not emit another spacing rule or use Structural Utility Projection (`p`).

The consumer selects `all` plus one requested size independently for each property. A frame may
therefore use medium padding and small margin while its separate flow node uses large gap.
Applying an aggregate size bucket would couple these choices and is unsupported for Layout.
Frame utilities belong to the root DOM element; flow utilities belong to the internal flow
element, whose structural CSS consumes the padding tokens as gaps.

The flow map also publishes `e2.gc[breakpoint]`, one class per effective breakpoint. The compiler
emits `grid-template-columns: repeat(var(--k-lyt-gc-...), minmax(0, 1fr))`, with an unqualified
base rule for `bp:all` and ascending `min-width` media rules for effective breakpoints.
Variable identities come from Core's `layoutColumnCssVariables`, never from class-name parsing.
Counts are supplied by each consumer instance; there is no generated count catalog. Consequently,
eleven effective breakpoints produce eleven column rules and references, rather than 132.
As in ordinary scale compilation, a schema breakpoint table replaces the Core table; Core
breakpoints are the fallback when the schema omits the table. `bp:all` is always available at
zero. Raw thresholds remain in generated CSS and are never published to the runtime class map.
Selecting the applicable responsive classes requires no JavaScript viewport query.

The consumer pairs each selected class with a local numeric variable on the same flow element.
Only explicitly configured breakpoints with a published class activate a rule. An omitted higher
breakpoint therefore leaves the previous configured rule active. Every activated rule receives its
own local value, so nested Layouts cannot accidentally consume a parent's inherited count.
Removing an entry removes both its class and variable. Invalid counts or unpublished breakpoints
activate neither; the public count contract remains the integer range 1 through 12.

This replaces the earlier `gc[breakpoint][count]` handoff. Builder artifacts and platform consumers
must be updated together; stale count catalogs are not a supported compatibility format.

The normal recursive class-reference collector discovers both `sp` and `gc`. Component CSS
partitioning, metadata, integrity hashes, and resource publication follow the existing handoff,
including when `resources.palettes` is empty. No Layout-specific stylesheet loader is required.
