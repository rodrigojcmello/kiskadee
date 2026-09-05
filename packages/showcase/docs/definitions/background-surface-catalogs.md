# Background Surface Catalogs

## Purpose

Showcase background controls distinguish surfaces a preset intentionally publishes from
adversarial color combinations used to diagnose composition limits.

This distinction prevents a large chromatic picker from implying that every component and surface
combination is an approved Design System composition.

## Modes

### Canonical

Canonical is the default mode. It reads the active preset's generated Card metadata artifact:

```text
components/card.kiskadee.json
  options.canonicalSurfaces[segment][theme][]
    intent
    emphasis
    contentSurfaceContext
    rest
```

The preset authors the array order through `components.card.options.canonicalSurfaces`. The Web
Builder validates each referenced Card Rest surface, resolves its color, and preserves the order
in the artifact. The Showcase neither owns an intent/emphasis list nor sorts colors by luminance.

When two surface entries resolve to the same normalized color, only the first is retained in the
base surface catalog. Background scenarios are separate and must not be deduplicated by canvas
color: two scenarios can share a canvas while selecting different supporting Cards. Sparse intent
tracks remain valid: a preset may publish `primary.highest` without inventing `primary.high`.

The Card owns the canonical surface vocabulary because it is the framework component that
represents surfaces. Other component routes may consume this catalog without copying its color
recipe.

`contentSurfaceContext` recommends the palette context for descendants placed on that Card. It
does not change the palette used to resolve the catalog and does not make Showcase infer context
from a rendered color. A rendered Card consumes its surrounding context for its boundary.

### Stress test

Stress test keeps the broader red, green, purple, orange, blue, and black tonal combinations. These
backgrounds are diagnostic inputs, not a preset support guarantee and not a visual-approval
matrix.

Stress-test colors continue to resolve from the active preset's generated color assets. Literal
colors are not authored in component route code.

The Button stress-test picker uses three physical-lightness rows whose visibility depends only on
Theme:

- The light row is available only in the Light theme.
- The vivid row is available in every theme and both surface contexts.
- The dark row is available only in Dark and Darker and supports both surface contexts.

The Light and Dark rows therefore alternate with the active theme. The vivid row remains available
as the shared adversarial range. Changing Surface Context never hides either theme-visible row.

## Shared initial canvas

Every component route inherits its initial canvas background from `ShowcaseShell`. Button is the
visual reference: the default is the second distinct canonical `onSubtle` surface in the preset's
published order, or the first when only one is available. In Fluent Light this is
`neutral.medium`, the light-gray surface, rather than the white `neutral.low` surface. The same
policy resolves the current preset, segment and theme; no light-gray HEX is authored in Showcase.
An unavailable catalog yields no invented surface or cross-theme color fallback.

`resolveDefaultCanonicalCardSurface` owns that base-surface selection policy. The initial
scenario is selected by its base surface key, never by its index in the expanded list of swatches.
Adding the split swatch must not turn the second displayed option into the page default.
An unavailable catalog yields no invented color or cross-theme fallback.

## Canvas and supporting Card combinations

`resolveBackgroundScenarios` composes pairs from the existing generated Card surfaces. Each
scenario has a stable key, a canvas surface, a supporting Card surface, and a swatch treatment.
For Fluent Light, the canonical choices begin with:

| Swatch | Canvas | Supporting Cards |
| --- | --- | --- |
| White | Neutral Low (white) | Neutral Low (white) |
| Half white / half gray | Neutral Low (white) | Neutral Medium (light gray) |
| Light gray (initial default) | Neutral Medium (light gray) | Neutral Low (white) |
| Other subtle surfaces | Selected published surface | First canonical subtle surface |
| Vivid surface | Selected published vivid surface | First canonical vivid surface |

The split scenario is inserted after the first subtle surface only when a second distinct subtle
surface exists. Its key includes both surface identities. Its colors are resolved again for each
preset, segment and theme; "white" and "gray" describe the Light presentation, not literal colors
or a demand to paint white in dark themes. Other swatches retain their previous single-color
appearance. Accessible names describe both the canvas and Card, independently of the visual split.

`useShowcaseBackgroundState` owns the route-scoped selection in the existing Showcase panel
context. The Shell paints the canvas and publishes its Surface Context only around content. All
component panels consume the same `ShowcaseBackgroundControls` through their semantic controls,
including routes without a previous local picker. Route changes reset the selection, including
return navigation; theme and segment changes resolve the current pair from current artifacts.
No route writes canvas paint to `document.documentElement`.

`ShowcaseExampleCard` is Showcase-only composition of the public passive `p-react` Card. It selects
coordinates, not CSS paint: Card still owns backgrounds, borders, geometry and produced child
context. Button and Switch support cards, default Slider/TextField cards, Dropdown/Select/Separator
cards and other supporting surfaces consume the same selection. An absent Card surface produces
an unpainted content wrapper instead of inventing a fallback color.

Explicit specimen surfaces remain independent: the Card route demonstrates its own intent/emphasis
matrix, foreground comparisons retain a vivid column, and Slider/TextField's existing custom
surface probes remain explicit overrides. Layout-only groups do not acquire decorative Cards.
This work does not change Button/Switch/Badge colors or rewrite remaining legacy specimen styles.

## Background control group

The chrome has one Background frame. Its first row is Canonical / Stress test, followed by a
horizontal divider and the active mode's swatches. Neither the segmented row nor the swatch row
owns another surrounding frame. The description remains below the frame. Both modes share this
component on desktop and mobile. Showcase chrome styling is not preset specimen styling.

## Coordinated controls

Theme, Background, and Surface Context remain separate concepts:

- Theme selects the active Light, Dark, or Darker artifact.
- Background selects the route surface from the active catalog.
- Surface Context selects the component palette intended for the surrounding surface.

Changing Surface Context directly always resets Background to Canonical and selects the first Card
surface carrying that `contentSurfaceContext`. The exact intent and emphasis are preset-authored;
for example, Fluent may publish Primary Highest while iOS 27 publishes Primary High. This provides
a predictable return from exploratory stress testing to an approved composition without imposing
one global emphasis on every design system.

Changing the Background mode also initializes it with the first valid surface for the current
Surface Context. Selecting a canonical swatch applies its exact published
`contentSurfaceContext`. Selecting a stress-test swatch applies a physical-lightness convention:
light-row tones select `onSubtle`, while vivid- and dark-row tones select `onVivid`. Vivid and dark
tones remain available in both contexts for intentional testing, but a fresh click restores their
recommended `onVivid` context. Background selection never changes Theme.

## Adoption

KIS-69 first applied this contract to the Button route. The Switch route also consumes the shared
Card-derived canonical catalog instead of maintaining its own intent/emphasis surface list.

On Switch, Canonical mode uses the selected scenario's supporting Card coordinates, independently
of the canvas coordinates. Like Button, these Cards use preset borders without a shadow and consume
the surrounding supported context for their boundary. They publish their authored child context.
Stress-test mode keeps Switch specimens directly on the chosen canvas so a canonical Card does not
mask the adversarial input. Explicit surface comparisons on other routes keep their stated purpose.
