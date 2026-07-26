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

When two entries resolve to the same normalized color, only the first is shown. Sparse intent
tracks remain valid: a preset may publish `primary.highest` without inventing `primary.high`.

The Card owns the canonical surface vocabulary because it is the framework component that
represents surfaces. Other component routes may consume this catalog without copying its color
recipe.

`contentSurfaceContext` recommends the palette context for descendants placed on that Card. It
does not change the Card's own `surfaceContext="default"` palette and does not make the Showcase
infer context from a rendered color.

### Stress test

Stress test keeps the broader red, green, purple, orange, blue, and black tonal combinations. These
backgrounds are diagnostic inputs, not a preset support guarantee and not a visual-approval
matrix.

Stress-test colors continue to resolve from the active preset's generated color assets. Literal
colors are not authored in component route code.

The Button stress-test picker uses three physical-lightness rows:

- The light row is available only in the Light theme and Default surface context.
- The vivid row is available in every theme and both surface contexts.
- The dark row is available only in Dark and Darker and supports both surface contexts.

The Light and Dark rows therefore alternate with the active theme. The vivid row remains available
as the shared adversarial range.

## Coordinated controls

Theme, Background, and Surface Context remain separate concepts:

- Theme selects the active Light, Dark, or Darker artifact.
- Background selects the route surface from the active catalog.
- Surface Context selects the component palette intended for the surrounding surface.

Changing Theme or Surface Context selects the first valid background when the current selection is
not compatible. In Canonical mode, changing Surface Context selects the first Card surface carrying
that `contentSurfaceContext`: currently the first Default entry is white and the first Inverse
entry is Primary Highest. In Stress Test, the same operation selects the first visible tone allowed
for that context.

Changing the Background mode also initializes it with the first valid surface for the current
Surface Context. Manually selecting a visible swatch never changes Theme or Surface Context, so
intentional stress testing remains possible.

## Initial adoption

KIS-69 applies this contract first to the Button route. The resolver lives outside the route so
future Showcase components can reuse the Card-derived canonical catalog.
