# Component Builder Modules

Status: technical debt / deferred refactor.

## Context

The web-builder already has a generic schema traversal model for style output:

- direct component elements, such as `components.button.elements`;
- variant elements, such as `components.tabs.variants.<variant>.elements`;
- variant/mode elements, such as
  `components.textField.variants.<variant>.modes.<mode>.elements` and
  `components.switch.variants.standard.modes.base.elements`.

That generic traversal is the right foundation. A new component schema should be enough for the
main CSS and class-map pipeline to emit its visual artifacts.

The problem is the surrounding artifact metadata. Some central builder phases still contain
component-specific branches for things like:

- manifest component capabilities;
- `global.kiskadee.json` component options;
- showcase-facing metadata;
- runtime hints that are not pure style-key output.

During the first `Switch` integration, the CSS/class-map path already understood
`switch.standard.base`, but the builder still needed central edits so the manifest and global
artifacts could expose switch metadata. That is a warning sign: every new component should not force
the core builder files to learn another component's options and topology.

## Technical debt

It is not sustainable for each new component to require direct edits in central builder phases.

This scales poorly for several reasons:

1. **Central files accumulate product knowledge** - files such as `publishMetadata.ts` and
   `writeExtraArtifacts.ts` become a registry of component-specific details instead of pipeline
   phases.
2. **Every component increases regression risk** - adding `Switch` can accidentally affect
   `Button`, `Tabs`, or `TextField` because all of them share the same central branching surface.
3. **Component ownership becomes unclear** - schema authors, runtime authors, and builder authors
   must coordinate in central files even when the new behavior is scoped to one component.
4. **The generic schema model is undermined** - even when CSS generation is generic, metadata
   generation still behaves like a manual allow-list.
5. **Long-term maintenance becomes expensive** - `Checkbox`, `Radio`, `Slider`, `Select`, and other
   future components would each add more branches unless the builder gets a component module layer.

The deeper issue is not the `Switch` itself. The issue is that component-specific artifact behavior
does not currently have a component-owned extension point.

## Desired direction

Introduce component modules inside `@kiskadee/web-builder`.

A component module should own the builder-specific adjustments for one component, while the central
pipeline stays generic and only orchestrates registered modules.

Possible structure:

```txt
packages/web-builder/src/components/
  button/
    button.builder.ts
  switch/
    switch.builder.ts
  tabs/
    tabs.builder.ts
  text-field/
    text-field.builder.ts
  registry.ts
```

Each module could optionally expose hooks such as:

```ts
export type ComponentBuilderModule = {
  componentName: ComponentName;
  getManifestComponent?: (schema: Schema) => ManifestComponent | undefined;
  getGlobalComponentConfig?: (schema: Schema) => unknown;
  getShowcaseMetadata?: (schema: Schema) => unknown;
};
```

The central builder phases would then do something closer to:

```ts
for (const module of componentBuilderModules) {
  const manifestComponent = module.getManifestComponent?.(schema);
  if (manifestComponent) {
    manifest.components[module.componentName] = manifestComponent;
  }

  const globalComponentConfig = module.getGlobalComponentConfig?.(schema);
  if (globalComponentConfig) {
    globalPayload.components[module.componentName] = globalComponentConfig;
  }
}
```

## Boundaries

Component modules should not replace the generic style pipeline.

Keep these responsibilities generic:

- schema traversal into style keys;
- style-key usage mapping;
- class-name shortening;
- CSS rule emission;
- class-map generation for direct, variant, and variant/mode topologies.

Move these responsibilities toward component modules:

- component-specific manifest capability extraction;
- component-specific `global.kiskadee.json` option extraction;
- component-specific showcase metadata;
- temporary compatibility aliases for older component option names;
- any future component-specific artifact that is not a generic style concern.

## Proposed migration path

1. Define a small `ComponentBuilderModule` contract.
2. Move the existing `Button` manifest extraction into a `button` module without changing artifact
   output.
3. Move `Tabs` global option extraction into a `tabs` module.
4. Move `TextField` global/variant/mode option extraction into a `text-field` module.
5. Move `Switch` global option and manifest capability extraction into a `switch` module.
6. Replace central component branches with iteration over the module registry.
7. Add narrow snapshot or object-shape validation for generated `manifest.json` and
   `global.kiskadee.json` only if tests are explicitly requested.

## Triggers

Prioritize this refactor when at least one of these becomes true:

- a second new checkable/control component is added, such as `Checkbox` or `Radio`;
- another component requires central edits in `publishMetadata.ts` or `writeExtraArtifacts.ts`;
- manifest/global artifacts gain more component-specific fields;
- the builder starts needing per-component compatibility shims;
- the central metadata phases become hard to review because unrelated components appear in the same
  diff.

## Non-goals

- Do not introduce plugin loading or runtime discovery. A static module registry is enough.
- Do not move schema contracts out of `packages/core`.
- Do not make every style emission rule component-specific.
- Do not block current component work on this refactor unless the central branching cost grows
  further.

## Expected outcome

After this refactor, adding a component should follow a cleaner path:

1. define schema/types/contracts in `packages/core`;
2. author preset schema in `packages/presets`;
3. rely on the generic builder traversal for CSS and class maps;
4. add one component builder module only when the component needs metadata or global artifact
   extraction;
5. keep central builder phases focused on orchestration instead of component details.

This keeps the builder maintainable as the design-system surface grows and preserves the original
intent of the schema-driven pipeline: component schemas define visual data, while the builder
generates artifacts without accumulating per-component conditionals in its core flow.
