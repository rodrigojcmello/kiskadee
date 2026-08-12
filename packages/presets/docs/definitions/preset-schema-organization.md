# Preset Schema Organization

Preset root schema files should describe the design system as a whole and compose component-specific
schema factories.

Use this layout once a preset has more than a trivial single-component definition:

```text
src/presets/<preset>/
  <preset>.schema.ts
  components/
    button.schema.ts
    switch.schema.ts
    text-field.schema.ts
```

The root `<preset>.schema.ts` owns:

- preset metadata such as `name`, `prefix`, `version`, and `author`;
- global schema values such as fonts, radius, focus, and theme tokens;
- shared preset helpers such as segment names, color getters, and transparent/white constants;
- the `components` map that calls `create<Preset><Component>Schema(...)` factories.

Global font recommendations use a reusable family catalog and semantic role references. Follow
[Font Families](font-families.md) when authoring or migrating `global.fonts`; resource loading does
not belong in a preset schema.

Each `components/<component>.schema.ts` owns:

- the full schema for that component;
- local component helpers and constants;
- component-specific adaptation notes that are too narrow for the root preset file.

Keep cross-component preset decisions in the root file or a package-local docs definition. Keep
component geometry, palettes, and element maps near the component factory that owns them.

Material Design 3 is the reference implementation for this pattern. Smaller or legacy presets may
still be monolithic, but new work should prefer the split before the root schema becomes difficult to
review.

## Component Schema Rule Ledgers

Durable component-specific schema authoring rules should live in:

```text
packages/presets/docs/definitions/schema-rules/<component>.schema-rules.md
```

Use the `.schema-rules.md` suffix for rules that must stay visible across future schema, builder,
runtime, and showcase work. These files are the place for component-specific schema decisions that
would otherwise be scattered across temporary handoffs or package docs.

The first component ledger is `schema-rules/switch.schema-rules.md`.

## Preset Source Evidence

Every official preset should keep its source-of-truth notes under:

```text
packages/presets/docs/design-systems/<preset>/
  source-evidence.md
  components/
    <component>.md
  evidence/
    <component>/
      <source-slug>.png
```

Use `source-evidence.md` for design-system-level sources and decisions:

- Figma file name, file key, and canonical links used for the preset;
- official documentation sites and relevant pages;
- known source gaps, such as a Figma file that lacks dark mode while the public
  site demonstrates a dark or high-contrast treatment;
- broad preset decisions that affect multiple components;
- extraction notes for cross-component tokens, such as shadow/elevation scales,
  when the upstream design system does not provide a centralized token page.

When a token scale is reconstructed from multiple components, document the
reason and the provenance for each level. For example, a shadow/elevation scale
should identify the effect style, the component or local style where it was
found, and any inspected component links that did not use a given level.

Use `components/<component>.md` for component-specific evidence:

- exact Figma node links and node IDs used as references;
- official documentation URLs used for behavior, color, or state decisions;
- local evidence image paths under `evidence/<component>/`;
- the schema decisions that were derived from each source;
- explicit adaptations when Kiskadee needs a component bucket or theme treatment
  that the upstream design system does not publish as a formal component.

Do not put preset-specific source evidence in generic schema-rule ledgers such
as `definitions/schema-rules/switch.schema-rules.md`. Those ledgers define the
cross-preset component rule. The per-design-system evidence belongs with the
design-system documentation so future preset edits can audit the original
source before changing schema values.

Legacy source notes may still exist in older preset-local locations. New preset evidence should use
`packages/presets/docs/design-systems/`, and older notes should be migrated
there when touched.

For automated agent work, use `skills/kiskadee-preset-evidence/SKILL.md`.
That skill owns the reusable workflow and the evidence-file format reference
used when a task includes Figma links, official design-system documentation, or
source-derived preset decisions.

When source evidence includes colors, also use
`skills/kiskadee-resolve-preset-colors/SKILL.md`. It requires agents to trace the
official semantic token through the documented tonal de-para and use the
resulting primitive, semantic role, and exact L/D position. Official preset
schemas must not contain literal colors; literals belong only in source evidence
or approved primitive assets.

For the dependency order from evidence and tonal generation through canonical surfaces, component
surface contexts, artifacts, and Showcase validation, follow
[Official Preset Authoring Workflow](official-preset-authoring-workflow.md).

## Numeric Values

Use the simplest schema shape that preserves meaning:

- If a value is identical for every scale or mode, use the scalar value directly.
- If a value changes by scale, use the scale map.
- Do not repeat the same value across every size just to match nearby scale-mapped properties.

Example:

```ts
borderWidth: 0
```

Prefer exact cross-platform geometry over web-only shortcuts. A large radius such as `999` is a CSS
pill hack, not a portable schema value. When a component has known dimensions, express pill radius as
the exact half-height for each size. Reserve `rounded` for a modest fixed rounding when there is no
official platform value, and choose the smallest value that preserves a visibly rounded but
non-pill shape for that preset's geometry.
