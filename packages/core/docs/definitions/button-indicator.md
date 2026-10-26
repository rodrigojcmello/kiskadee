# Button state indicator

Button uses two optional recipes for one passive decorative part: `e11` (`button-indicator`) for
inside placement and `e12` (`button-indicator-outside`) for outside placement. The runtime applies
one complete recipe to one rendered indicator, following
[alternate element recipes for one rendered part](../../../../docs/definitions/composition-strategies.md#alternate-element-recipes-for-one-rendered-part).
It has no semantic role, focus target, interaction owner or layout contribution. The Button owns
the state that drives its paint. Either recipe may be published independently. A preset containing
neither recipe remains valid and does not publish indicator support.

`options.indicatorPlacement` accepts `inside` and `outside`. `options.indicatorScope` accepts `all`
and `stacked`; omission preserves `all` for consumers of existing presets. Scope describes default
rendering by the actual active layout, not anatomy support or palette availability. It neither
requires an indicator element nor removes support from other layouts.

Both recipes use the same geometry contract: `scales` requires positive `boxWidth` and `boxHeight`, non-negative
`marginTop` (outside gap), `marginBottom` (inside gap), `marginLeft` and `marginRight` (horizontal
safety insets), and non-negative `borderRadius` recipes for `rounded`, `pill` and `square`. Values
may be scalars or existing size/breakpoint maps; no new offset or size vocabulary is introduced.
`boxWidth` is a nominal literal value authored by the preset. Neither runtime nor build derives it
from icon geometry, text, measurement or formulas. Structural CSS may limit its maximum size
using the horizontal insets when the actual Button is narrower, without replacing nominal width.

Both elements contain complete geometry and `palettes` following the ordinary segment, theme,
surface context, intent and emphasis hierarchy. Paint belongs only to `boxColor`. Position selects
the participating element, without another palette axis or a different intent or emphasis. Both
recipes consume the Button's ambient context; inside placement does not imply `onVivid`. Each
recipe authors contrast for its actual position and host appearance. The context produced for
independent descendants remains unchanged.

Rest is optional only for this anatomy. State maps are sparse, including Selected substate maps.
Every non-Rest paint uses a parent-state reference (`{ ref: color }` or `fg.parentState(...)`), so
the part needs no copied activator classes. A Selected Rest recipe persists through Hover, Focus
and Pressed when those substates have no authored delta. A mounted element is not necessarily
painted. The runtime hides the decorative part in terminal states while preserving the Button's
semantic control state.

Foreground coordinates normally belong to `textColor`. The explicit exception is `boxColor` under
`components.button.elements.e11.palettes` and `components.button.elements.e12.palettes`, allowing
the indicator to reuse an existing foreground color coordinate. Foreground box paint in every other component or
element remains invalid. The ordinary palette and foreground contracts are unchanged.

The Web Builder publishes geometry as token-only utilities and ordinary surface-context color classes;
the structural owner consumes them without changing the Button border box. See the shared
[state-indicator definition](../../../../docs/definitions/state-indicators.md) and the
[component-resource handoff](../../../web-builder/docs/definitions/component-resources.md).
