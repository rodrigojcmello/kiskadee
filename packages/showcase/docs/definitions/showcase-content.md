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

The route publishes its active Surface Context through `SurfaceContextProvider`. Independent
`p-react` descendants that support Surface Context consume that context normally.

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

The current Fluent Switch artifact publishes only its `onSubtle` visual track and the public Switch
API does not consume Surface Context. On a vivid Button-route canvas, the related inline switches
therefore belong inside one passive Card selected from the active preset's canonical surfaces with
`contentSurfaceContext: onSubtle`. This is explicit composition of two supported components, not a
Showcase fallback. If the design later requires one compact capsule per switch, that compact surface
must first become a supported `p-react` capability instead of being recreated with route CSS.

## Related definitions

- [Kiskadee Nomenclature](../../../../docs/definitions/nomenclature.md)
- [Project governance and responsibility](../../../../docs/definitions/project-governance.md)
- [Composition strategies](../../../../docs/definitions/composition-strategies.md)
- [Background Surface Catalogs](./background-surface-catalogs.md)
