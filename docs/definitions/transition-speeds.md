# Transition speeds

Status: canonical cross-project contract for bounded transition customization.

## Public vocabulary

When a component offers transition-speed customization, it uses exactly these names:

| Speed | Purpose |
| --- | --- |
| `normal` | Default and calibration reference |
| `fast` | Faster than normal |
| `slow` | Slower than normal |
| `debugSlow` | Extremely slow, publicly available for detailed inspection |

Components are not required to expose speed customization merely because they animate.
Any future exception to this vocabulary requires a documented rationale in the owning
component contract. Existing components are migrated explicitly, not automatically.
Public APIs do not accept arbitrary milliseconds, velocity, easing, or spring parameters
as replacements for this bounded speed choice. The internal timing inputs of rendering
helpers such as Rotate and Crossfade are execution contracts supplied by their consumer;
they are not component speed selectors.

## Authority and calibration

Repository governance owns the names, semantics, and bounded customization rule. The
platform component project owns the internal executable recipe for each named speed,
including duration, easing, or spring physics. Such recipes are library interaction
mechanics, not preset-owned visual tokens. They may be defined outside Schema and must
not be transported through preset options or generated design-system metadata.

`normal` is the reference; `fast` and `slow` are calibrated relative to it for each
component, without a universal multiplier. Moving a Tabs indicator and revealing an
Accordion panel can have different timing and physics. Document each component's recipes
and verify that all four names have the intended perceptual ordering. Other platform
adapters may adapt mechanics while preserving these semantics.

Geometry, colors, typography, contours, shadows, and preset-owned appearance options
remain Schema-owned. Existing Schema effects are not generally migrated or invalidated
by this definition. Headless owns accessible state and events, never animation timing.

## Independent responsibilities

Speed, animation enablement, and coordination are separate controls. A speed selector
must document the transition it affects and must not silently change other animated
parts. Reduced motion and disabled motion bypass even debugSlow. Initial state and late
loading of an animation module do not replay a transition.

When opening and closing occur together, a component may coordinate participants on one
progress clock while retaining different isolated entry and exit recipes. Coordination
is local to that semantic group and must work with both controlled and internal state.
Interrupted transitions start from current geometry. Content changes retarget within the
remaining timeline instead of restarting a complete duration for one participant.

## First adoption

Accordion p-react exposes `motionSpeed` for panel height only and independently controls
its indicator. See the [Accordion contract](../../packages/components/react/docs/definitions/accordion/accordion-contract.md).
Tabs migration is tracked by KIS-115; its existing public spring object is a known legacy
exception, not a pattern for new APIs. This delivery does not change Tabs or other effects.
