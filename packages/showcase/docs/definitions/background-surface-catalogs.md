# Background Surface Catalogs

## Purpose

Showcase background controls distinguish surfaces a preset intentionally publishes from
adversarial color combinations used to diagnose composition limits.

This distinction prevents a large chromatic picker from implying that every component and surface
combination is an approved Design System composition.

## Modes

### Canonical

Canonical is the default mode. It reads the active preset's generated Card schema at:

```text
Card e1
  palettes[segment][theme]
    surfaceContext.default
      boxColor[intent][emphasis].rest
```

The initial ordered roles are:

```text
neutral.low
neutral.medium
primary.medium
neutral.high
primary.highest
neutral.highest
```

Missing roles are omitted. When two roles resolve to the same normalized color, only the first
role is shown. The Showcase does not duplicate HEX values or tonal positions for this catalog.
The order follows the published Card emphasis vocabulary rather than sorting raw colors by
luminance. Sparse intent tracks are preserved: a preset may publish `primary.highest` without
inventing `primary.high`.

The Card owns the canonical surface vocabulary because it is the framework component that
represents surfaces. Other component routes may consume this catalog without copying its color
recipe.

### Stress test

Stress test keeps the broader red, green, purple, orange, blue, and black tonal combinations. These
backgrounds are diagnostic inputs, not a preset support guarantee and not a visual-approval
matrix.

Stress-test colors continue to resolve from the active preset's generated color assets. Literal
colors are not authored in component route code.

## Control independence

Theme, Background, and Surface Context are independent controls:

- Theme selects the active Light, Dark, or Darker artifact.
- Background selects the route surface from the active catalog.
- Surface Context selects the component palette intended for the surrounding surface.

Changing the Background mode or color does not change Theme or Surface Context. The Button route
remembers the most recent valid selection in each background mode for the current session.

## Initial adoption

KIS-69 applies this contract first to the Button route. The resolver lives outside the route so
future Showcase components can reuse the Card-derived canonical catalog.
