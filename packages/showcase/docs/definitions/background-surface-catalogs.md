# Background Surface Catalogs

## Purpose

Showcase exposes only surfaces published by the active preset. Surface context and background
swatches share one control in every route, including Card. This grouping is presentation-only:
component surface-context props and internal providers remain unchanged.

## Published catalog

The control reads the active preset's generated Card metadata artifact:

```text
components/card.kiskadee.json
  options.canonicalSurfaces[segment][theme][]
    intent
    emphasis
    contentSurfaceContext
    rest
```

The preset authors the array order through `components.container.options.canonicalSurfaces`.
Container owns the referenced Rest colors and descendant contexts. The Web Builder validates the
references and preserves Card-compatible resolved entries in the Card artifact for existing
Showcase consumers. The Container artifact keeps the complete authored catalog.
The Showcase neither owns an intent/emphasis list nor sorts colors by luminance.

When two surface entries resolve to the same normalized color, only the first is retained in the
base swatch catalog. Background composition opts out of this deduplication to retain same-intent
fallbacks even when their colors match. Scenarios must not be deduplicated by canvas
color: two scenarios can share a canvas while selecting different supporting Cards. The split-swatch
scenario requests the public Card border to distinguish its supporting Cards from the canvas.
This is scenario metadata, independent of swatch position; border paint remains preset-owned.
An explicit border override on an example takes precedence. Sparse intent
tracks remain valid: a preset may publish `primary.highest` without inventing `primary.high`.

Container owns the canonical surface vocabulary. Card consumes those Rest surfaces at build time,
then adds its own border and geometry. Other component routes may consume the resolved catalog
without copying its color recipe.

`contentSurfaceContext` records the context the selected surface provides to descendants. It
does not change the palette used to resolve the catalog and does not make Showcase infer context
from a rendered color. A rendered Card consumes its surrounding context for its boundary.

## Shared initial canvas

Every component route inherits its initial canvas background from `ShowcaseShell`.
`utils/showcase-background-defaults.ts` centralizes default selection for published backgrounds by theme and surface context. Canonical defaults select published
identities, not swatch positions. The canonical composition selector prefers the `neutral.low` canvas / `neutral.lowest` bordered Card scenario
for On subtle in every theme; when unavailable it uses the theme policy over published scenario
canvases. The underlying surface policy prefers `neutral.low` in Light/Dark and
`neutral.highest`, then `neutral.medium`, in Darker. The vivid
context prefers `primary.highest`. Other compatible published surfaces are fallbacks.
No color is authored by this policy and no surface crosses context as a fallback.

Initial load and context changes use automatic defaults, reevaluated for the active theme.
Preset changes clear the manual background selection and resolve the default for the current
surface context. Within the same preset, explicit background selections remain selected while available; unavailable selections fall
back to the current theme/context default. The schema owns the available surfaces and colors,
not the Showcase's initial canvas choice. Applications remain free to choose their own canvas.

## Canvas and supporting Card combinations

`resolveBackgroundScenarios` composes pairs from the existing generated Card surfaces. Each
scenario has a stable key, a canvas surface, a supporting Card surface, and a swatch treatment.
The first two exceptions are Neutral Lowest / Neutral Lowest and Neutral Lowest / Neutral Low.
Legacy catalogs without Neutral Lowest retain their first subtle surface as the base; if Neutral
Low is unavailable as an alternate, the first distinct published subtle color supplies it.
Both initial exceptions explicitly request Card borders. The first keeps a solid swatch;
the second keeps its split swatch.
When Neutral Low and Lowest are both published, a third exception follows the two initial exceptions: Neutral Low
canvas with Neutral Lowest Cards and a border request. Its swatch is solid Neutral Low and it is the initial selection when available.
Neutral Medium follows the other subtle compositions, immediately before the vivid group.

The remaining On subtle choices contain one composition per published intent: Medium canvas
and Low Cards of the same intent. Low falls back to Lowest of that intent, then the base subtle
surface when neither is published. Catalogs without Medium retain Low or their first published
surface. No recipes or colors are synthesized. Medium/Low are semantic coordinates in both
Light and Dark; luminosity is never used to choose them. On vivid retains each published vivid
canvas paired with the first vivid surface. Explicit component surface demonstrations retain
their own coordinates.

Scenario keys retain the canvas identity; the split exception includes both identities.
Accessible names describe the complete canvas/Card pair. Presets and Builder continue to own
surface availability and paint; these composition choices belong only to Showcase.

`useShowcaseBackgroundState` owns the route-scoped selection in the existing Showcase panel
context. The Shell paints the canvas and publishes its Surface Context only around content. All
component panels consume the same `ShowcaseBackgroundControls` through their semantic controls,
including routes without a previous local picker. Route changes reset the selection, including
return navigation; theme and segment changes resolve the current pair from current artifacts.
No route writes canvas paint to `document.documentElement`.

`ShowcaseExampleCard` is Showcase-only composition of the public passive `p-react` Card. It selects
coordinates, not CSS paint: Card consumes Container's Rest fill while keeping its own border and
geometry. Button and Switch support cards, default Slider/TextField cards, Dropdown/Select/Separator
cards and other supporting surfaces consume the same selection. An absent Card surface produces
an unpainted content wrapper instead of inventing a fallback color.

Explicit specimen surfaces remain independent: the Card route demonstrates its own intent/emphasis
matrix, foreground comparisons retain a vivid column, and Slider/TextField's existing custom
surface probes remain explicit overrides. Layout-only groups do not acquire decorative Cards.
This delivery does not replace all existing Showcase canvas Cards with Container or rewrite
remaining legacy specimen styles.

## Background control group

Every route uses one Surface context frame: On subtle / On vivid above a divider, followed by
the same background swatches. There is no route exception, mode selector, or Stress test catalog.
Swatches keep their 24px size and selection ring. Rows fill the available width with even spacing,
wrap when needed, and center incomplete rows. The chrome remains independent of preset styling.

Changing context selects the shared default for that context. Selecting a swatch applies its
published descendant context. Neither action changes Theme. Explicit component examples keep
their own coordinates and component APIs.

Switch uses the selected supporting Card coordinates. Card exposes the same control while its
surface matrix continues demonstrating explicit intent/emphasis coordinates.

## Required vivid surface

Presets supporting canonical onVivid composition must retain Primary Highest as a published Card
surface, including its onVivid descendant context, palettes and canonicalSurfaces entry. Simplifying
light backgrounds must not remove that role.
Material keeps Primary Highest and removes only Neutral Highest. Its common white Lowest entries
are deduplicated by the existing catalog logic; the canonical vivid background and Button comparison
remain available.
