# Border Width Padding Compensation

On the web, borders contribute to the rendered box size when height/width are `auto`. That means a
button with `paddingTop + textHeight + paddingBottom = 40` and `borderWidth = 1` renders at 42px,
even though the schema is correct for other platforms, where stroke is typically drawn inside the
bounds.

To keep the schema platform-agnostic while preserving the correct visual size on web, the
web-builder compensates padding by the border width at CSS generation time:

- `borderWidth` emits a CSS variable: `--k-bdw`.
- each `padding*` emits a base var (`--k-pdt`, `--k-pdr`, `--k-pdb`, `--k-pdl`).
- the actual CSS uses `max(0px, calc(var(--k-pd*) - var(--k-bdw, 0px)))`.

This keeps layout stable across platforms without baking web-specific offsets into the schema.
