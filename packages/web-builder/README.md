# @kiskadee/web-builder

Build pipeline that converts a Kiskadee `Schema` into Web artifacts (utility CSS + JSON maps).

## Docs

- [Style emission policy](docs/definitions/style-emission-policy.md) - element-level rules for CSS output shape.
- [Structural utility projections](docs/definitions/structural-utility-projections.md) - explicit
  Registry and compact `p` bucket for reusing token-only scale utilities on structural owners.
- [Component style emission overrides](docs/definitions/component-style-emission-overrides.md) - component/element
  emission overrides and their structural reasons.
- [Border width padding compensation](docs/definitions/border-width-padding-compensation.md) - web-only padding
  adjustment for border widths.
- [Gradients](docs/definitions/gradients.md) - `ResolvedGradient` CSS emission, interpolation variables, mirrored
  `boxColor`, and related flags.
- [Control state effects](docs/definitions/control-state-effects.md) - separation between semantic toggle states
  and opt-in visual effects.
- [Border radius](docs/definitions/border-radius.md) - radius modes, radius effects, and cross-platform rules.
- [Interaction state model](docs/definitions/interaction-state-model.md) - native, semantic helper, projected,
  and forced state selector rules.
- [Segments](docs/definitions/segments.md) - segment registry source of truth and `segments.json` materialization.
- [Pipeline](docs/definitions/pipeline.md) - build phases and package scripts.
- [Generated artifacts](docs/definitions/generated-artifacts.md) - CSS, maps, metadata, and high-level usage.
- [Runtime CSS contract](docs/definitions/runtime-css-contract.md) - ownership split between JSON runtime data and
  CSS presentation.
- [Font family artifacts](docs/definitions/font-family-artifacts.md) - semantic catalogs, compact manifest roles,
  CSS stack resolution, and fallback behavior.
- [Typography artifacts](docs/definitions/typography-artifacts.md) - profile lowering, atomic classes, usage
  metadata, and relative Web units.
- [Reference files](docs/definitions/reference-files.md) - implementation entry points for the build pipeline.
- [Future optimizations](docs/proposals/future-optimizations.md) - deferred optimization proposal.
