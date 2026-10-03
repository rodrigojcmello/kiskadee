# Layout contract

`Layout` owns framework-neutral spacing grammar. It is a passive composition component, with no
surface, palette, border, radius, shadow, interaction state or Headless behavior.

The schema has exactly two elements:

- `e1`, named `frame`: `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `marginTop`,
  `marginRight`, `marginBottom`, and `marginLeft` scales.
- `e2`, named `flow`: `paddingTop` supplies row spacing; `paddingLeft` supplies column spacing.
  Web adapters translate these values into flow gaps without introducing a Schema `gap` attribute.

Each property requires all eleven `ElementSizeValue` entries as finite positive numbers, strictly
increasing in the declared size order. Every frame property and both flow properties use the same
values. Presets own the concrete spacing ladder. Scalar shortcuts, `s:all`, breakpoint maps,
paint and other geometry are outside this first version.

`LayoutColumnCount` is 1 through 12. `LayoutResponsiveColumns` accepts either a count or a partial
map from the existing `BreakpointValue` vocabulary to counts. Spacing sizes remain fixed values;
responsive columns do not introduce responsive spacing or a new breakpoint scale.

## Web handoff

The generated element class map publishes two Layout-specific buckets:

- `sp`: property bucket (`pt`, `pr`, `pb`, `pl`, `mt`, `mr`, `mb`, `ml`) to compact size to atomic
  spacing class. This permits independent selection of each frame side and each flow direction.
- `gc`: preset breakpoint key to one generated column class, independent of the selected count.

These buckets carry classes, not pixel values. They are not Structural Utility Projections and
do not use `p`. Core defines their serialization types and exports `layoutColumnCssVariables`,
the shared Web artifact identity map from canonical breakpoint keys to instance-local custom
property names (`--k-lyt-gc-all`, `--k-lyt-gc-sm1`, and so on). This map contains names only;
it does not define counts, breakpoint thresholds, or native layout behavior.

Web Builder owns emitted classes and responsive media queries. Each rule reads its breakpoint's
variable in `repeat(var(...), minmax(0, 1fr))`. The platform component selects only the classes for
configured, published breakpoints and supplies each consumed count on its own flow element.
The runtime never derives variable names from compacted classes or evaluates viewport thresholds.
The public count range remains 1 through 12; the generated CSS no longer enumerates these values.

See the [preset Layout rules](../../../presets/docs/definitions/schema-rules/layout.schema-rules.md)
for the shared Kiskadee calibration.
