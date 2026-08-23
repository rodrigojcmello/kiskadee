# Generated Artifacts

## CSS and maps

- Core CSS: utilities for decorations/scales and palette-independent base rules.
- Effects CSS: gated effect utilities such as shadows, activation feedback, and stateful radius effects.
- Per-palette CSS: color rules only.
- Generated CSS remains aggregated by design. It behaves like a shared utility layer with maximum
  class reuse across components, while structural CSS remains owned by the component packages.
- `core.kiskadee.json` and `<segment>.<theme>.kiskadee.json`: aggregate class maps kept for
  compatibility while component hooks migrate to smaller artifacts.
- `class-maps/core/<component>.kiskadee.json`: component-scoped core class map.
- `class-maps/<segment>.<theme>/<component>.kiskadee.json`: component-scoped palette class map.
- Component-scoped class maps use the shape `{ component, classMap }`.
- An element may expose registered structural utility references under the optional
  compact shape `element.p[artifactKey][scaleKey] = className`. The `p` bucket contains only
  references to existing token-only scale utilities and is omitted when no projection is
  registered.
- `onSubtle` and `onVivid` surface contexts share the same `<segment>.<theme>` CSS and class-map files.
  Each element stores its color classes under `c.s` (`onSubtle`) and, when authored, `c.v`
  (`onVivid`).
  Style keys and CSS declarations remain globally deduplicated across both buckets.

Structural utility projection does not add another artifact or stylesheet. Its references live in
the existing aggregate and component-scoped core class maps, and the referenced token-only scale
utility continues to live in the normal core bundle. Active examples cover Button connected-group
seam overlap and Dropdown independent leading-track placeholders. Presets without an optional
source omit its branch. Migration of Tabs fixed width remains a future candidate rather than an
active projection consumer. See
[`structural-utility-projections.md`](./structural-utility-projections.md).

## Optional brand packs

Third-party brand colors are published outside the normal design-system artifacts:

```text
brand-packs/<pack>/manifest.json
brand-packs/<pack>/<segment>.<theme>.<hash>.kiskadee.css
brand-packs/<pack>/class-maps/<segment>.<theme>/<component>.<hash>.kiskadee.json
```

- One stylesheet contains every brand projected for that pack, segment, and theme.
- Class maps remain component-scoped so a boundary can request only supported components.
- The manifest records exact resource paths, integrity hashes, supported `brand.*` intents, and
  content polarity.
- The preset's main `manifest.json` advertises available pack IDs under `brandPacks.packs`; detailed
  resources and component support remain owned by each pack manifest.
- Consumers validate class-map bytes against the manifest and attach the stylesheet with the
  published SHA-256 as Subresource Integrity before revealing branded content.
- Generated class namespaces include the design system, pack, and projection hash.
- Brand packs never modify `colors.json`, normal palette CSS, or normal component class maps.
- No pack is part of the baseline page load. An explicit consumer boundary owns loading and cache
  reuse.

## Metadata

Metadata is written per template under `packages/web-builder/build/<template-key>`:

- `manifest.json`: used by the showcase to discover templates, segments and themes.
  Component interaction capabilities are published under
  `components.<component>.surfaceContexts["<segment>.<theme>"].onSubtle|onVivid.state`; there is no
  context-aggregated state map.
- Font capability is published compactly under `fonts` as semantic role-to-family-ID selections.
  Catalogs and stacks are not duplicated in the manifest.
- Typography capability is published as `typography.artifact`; profile definitions, atomic class
  lists, and detailed usages live in `typography.kiskadee.json`.
- `schema.json` / `segments.json`: schema and segment data for inspection or tooling.
- `global.kiskadee.json`: global metadata consumed by runtime/components, including the complete
  semantic font catalog and role selections, radius, and global effects. Component semantic
  metadata should live in component artifacts.
- Dropdown presence is the narrow latency-sensitive exception: when a preset authors it, the
  artifact resolves the global profile catalog and component default once under
  `components.dropdown.effects.presence`. It does not duplicate the catalog under
  `effects.presence`, emit CSS/style keys, or introduce another request.
- `tokens.kiskadee.css`: global Web custom properties. When the schema declares fonts, this file
  resolves `--k-font-body`, `--k-font-heading`, and `--k-font-code`; otherwise it emits no font
  properties.
- `components/<component>.kiskadee.json`: component-scoped semantic metadata loaded on demand by
  component runtime hooks. Current emitted metadata artifacts include
  `components/switch.kiskadee.json`, `components/tabs.kiskadee.json`, and
  `components/text-field.kiskadee.json`.
- `class-maps/**/<component>.kiskadee.json`: component-scoped class maps loaded on demand by
  component runtime hooks. These are class resolution artifacts, not semantic metadata. Any
  registered `p` branch likewise carries class references only; it does not turn a class map
  into a component-option or token artifact.

`global.kiskadee.json` should not ordinarily grow new component semantic payloads under
`global.components.<name>`. Existing fallback data may remain for compatibility, and any new
exception must justify why the component needs the metadata before a component artifact can load.
Dropdown presence is currently that explicit exception; other component-specific metadata should
move to component artifacts.

The generated `schema.json` remains aggregated. Tooling that needs full schema
inspection, such as the Showcase surface picker, should read `schema.json`
directly instead of expanding runtime component artifacts beyond their semantic
metadata role.

The font artifact shapes and fallback rules are defined in
[Font family artifacts](font-family-artifacts.md).

Typography lowering and artifact ownership are defined in
[Typography artifacts](typography-artifacts.md).

## Typical usage

1. Choose a preset from `@kiskadee/presets` and run the web-builder to generate CSS and class maps.
2. Consume `core` and palette CSS in the app, and apply classes from `classNamesMapSplit`.
3. Keep layout/structure in component code; the builder should only own visual identity.

Optional branded appearances add a second, explicit path: load a pack manifest at the feature
boundary, then load its palette stylesheet and requested component class map before rendering
`brand.*`. Absence of that boundary is an error for a branded component, not permission to use a
system-intent fallback.

Component hooks such as `useSwitchArtifactConfig` are the component-facing entry
points for generated component metadata. `KiskadeeContext` provides the loading
environment; it should not force every page to eagerly load every component
artifact.
