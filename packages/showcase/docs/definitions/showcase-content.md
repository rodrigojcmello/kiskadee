# Showcase Content

Status: canonical Showcase definition.

## Purpose

Showcase Content (`s-content`) is the route-owned documentation and example canvas used to inspect
the active design system through its public Web component contract.

The boundary exists to keep a visual specimen honest: the route may orchestrate scenarios, but the
rendered design-system appearance must come from the same `p-react` components and generated
artifacts that an application consumes.

## Boundary

`s-content` includes:

- route headings and explanatory copy;
- component specimens and comparison surfaces;
- inline controls that change only the presentation of those specimens; and
- empty, unavailable, pending, and explanatory states rendered in the route canvas.

It excludes the top bar, lateral controls panel, and other Showcase application chrome. A portal
created by a `p-react` component remains output of that component even when its DOM is mounted
outside the route subtree.

## Visual composition rule

Every visual entity inside `s-content` must use a public `p-react` component and styles resolved from
the active Schema-generated artifacts.

This includes text, controls, surfaces, separators, icons, feedback, and other visible component
roles. A component-owned slot, such as `Button.Label` or the `Switch` label, remains owned by that
component; the route must not insert a second component merely to replace the slot's generated
typography or foreground.

Showcase may still own:

- semantic HTML landmarks and accessibility relationships;
- React state and scenario orchestration;
- grid, flex, ordering, alignment, responsive layout, width constraints, and positioning; and
- small composition gaps between independent `p-react` components.

Showcase must not author inside `s-content`:

- typography or foreground recipes;
- background, border, radius, or shadow paint;
- component dimensions or internal spacing;
- interaction-state visuals; or
- a local visual replacement for a missing framework capability.

`packages/showcase/k-components` and the visual wrappers under `ShowcaseControls` remain valid for
Showcase chrome, but they are not valid visual implementations inside `s-content`.

## Missing capabilities

When `p-react` cannot express a required visual role, the route must not conceal the gap with local
paint. The capability must first be modeled by its owning project, carried through the normal
Schema-to-artifact handoff when applicable, and then consumed by Showcase.

Migration may proceed by component family. During migration, each completed family must remove its
Showcase-local visual implementation rather than layering `p-react` underneath the old skin.

## Surface Context

All component routes inherit the shared canonical canvas background from `ShowcaseShell`, using
Button as the visual reference. The second compatible subtle surface is the initial default
(Fluent Light: light-gray `neutral.medium`). A route needs no background setup to inherit it.
Manual choices use the shared Showcase background scenario: canvas and supporting Card coordinates
are independent. The split swatch selects the first subtle canvas with the second subtle Card;
it does not change the initial default. Explicit specimen comparisons remain independent. See [Background Surface Catalogs](./background-surface-catalogs.md#shared-initial-canvas).

The Shell publishes the active canvas Surface Context through `SurfaceContextProvider`, around
content only, not the toolbar or side panel. Independent `p-react` descendants that support Surface
Context consume it normally; explicit specimens can establish a local boundary.

Use a passive `Card` only when the scenario intentionally introduces a distinct surface. Card owns
that surface and publishes its produced Content Surface Context to descendants. Never use
`CardAction` merely as decoration around another interactive control because that would create
nested interactive ownership.

A complete control such as `Switch` should render directly when the active preset supports it on the
surrounding surface. Do not add a local capsule, panel, or background merely to reproduce Showcase
chrome. If the specimen genuinely needs a separate supported surface, compose it inside a passive
`Card` and accept the Card geometry and paint published by the active preset.

## Initial adoption

The Button route is the first incremental adoption:

1. documentation text moves to `Text` or remains in a `p-react` component-owned text slot;
2. inline boolean controls move from Showcase wrappers to `Switch`; and
3. remaining visual wrappers migrate by component family without changing the top bar or lateral
   controls panel.

The Fluent Switch artifact publishes an explicit `onSubtle`/`onVivid` matrix. The Button route
composes its inline switches inside passive Card surfaces, and the Switch route uses the generated
canonical Card catalog for its specimen surfaces. The catalog resolves colors against `onSubtle`;
the rendered supporting Card consumes the selected background scenario and its surrounding
supported context for its boundary, as on Button, and publishes its authored Content Surface Context to the nested Switch. Switch specimens use preset
borders without shadows; selecting the canvas background does not force the Card to use the same
surface.

The Switch route may also render specimens directly on a generated stress-test route background.
That mode intentionally omits the Card so its canonical surface cannot mask the adversarial input;
the route still publishes the selected Surface Context through `SurfaceContextProvider`. Stress-test
colors come from generated preset tonal assets and remain diagnostic inputs, not local Showcase
paint or approved component compositions. If a required compact surface is absent from `p-react`, it
must still be modeled by the framework rather than recreated with route CSS.

## Related definitions

- [Kiskadee Nomenclature](../../../../docs/definitions/nomenclature.md)
- [Project governance and responsibility](../../../../docs/definitions/project-governance.md)
- [Composition strategies](../../../../docs/definitions/composition-strategies.md)
- [Background Surface Catalogs](./background-surface-catalogs.md)

## Preset transformation

The Shell marks the route canvas with `s-content`. Showcase owns the temporary `s-wow`
class and macro transition rules on this root and its DOM descendants, including specimen
Cards. Application chrome and portals outside this subtree do not participate.

The prepared-selection commit starts the effect before layout measurements, after resources
are ready. Initial activation does not start it. Subsequent triggers replace the previous
expiration timer. The existing 800ms theme duration is preserved within a 900ms activation
window; `no-transitions` still suppresses transitions. This presentation effect interpolates
preset values and does not author component paint or interaction-state recipes.

During a preset change, Card metadata consumers retain the last valid canonical surface
catalog while the next metadata snapshot is pending (or failed). A pending snapshot is not
an absent capability: it must not temporarily replace an example Card with a plain div and
remount its descendants. Once the new snapshot resolves, use its catalog; a confirmed absent
artifact clears the previous catalog. This preserves DOM continuity for preset transitions.
