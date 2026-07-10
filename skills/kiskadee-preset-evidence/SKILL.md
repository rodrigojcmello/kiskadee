---
name: kiskadee-preset-evidence
description: Kiskadee preset source-evidence workflow. Use whenever a task touches official preset schema files, design-system documentation, Figma links, official design-system docs, visual token extraction, component geometry, state colors, shadows, radius, effects, or any source-derived preset decision under packages/presets.
---

# Kiskadee Preset Evidence

Use this skill to keep official preset source documentation automatic and consistent.

## Core Rule

Do not finish an official preset change without checking whether source evidence needs to be
created or updated.

This applies when the task includes any of these inputs or files:

- Figma links or node IDs;
- official design-system docs, such as Apple HIG, Carbon, Fluent, Material, or similar sources;
- screenshots used as design evidence;
- files under `packages/presets/src/presets/<preset>/`;
- files under `packages/presets/docs/design-systems/<preset>/`;
- component schema decisions about geometry, color, state, radius, shadow, effects, marks, or
  component options.

## Required Locations

Use the existing preset evidence structure:

```text
packages/presets/docs/design-systems/<preset>/
  source-evidence.md
  components/
    <component>.md
  evidence/
    <component>/
      <source-slug>.png
```

Use `source-evidence.md` for preset-wide sources and decisions.
Use `components/<component>.md` for component-specific evidence and schema mapping.
Use `evidence/<component>/` for local screenshots or exported assets that are referenced by the
component evidence document.

## Workflow

1. Identify whether the preset is official.
- Official presets are design-system-backed presets such as Apple, Carbon, Fluent, Material, IBM,
  Microsoft, or Google.
- Sandbox or Kiskadee-only experimental presets do not need external source evidence unless the
  task explicitly uses an external design source.

2. Capture source identity before coding decisions drift.
- Preserve the original URL.
- Extract file keys and node IDs from Figma URLs when present.
- Record official documentation URLs used for behavior, accessibility, component semantics, or
  platform guidance.
- If browsing or Figma tools are unavailable, still record the link the user provided and state what
  was inferred from local context.

3. Update `source-evidence.md` when the source affects the whole preset.
- Examples: design-system source files, token strategy, global shadows, global radius policy,
  platform-wide adaptation notes.

4. Update `components/<component>.md` when the source affects one component.
- Examples: slider thumb geometry, switch selected state colors, card shadows, button variants,
  component-specific official docs.

5. Keep evidence tied to schema decisions.
- Do not only paste links.
- Write which Kiskadee elements, options, scales, palettes, or effects were derived from each
  source.
- Explicitly document adaptations where Kiskadee differs from the upstream design system.

6. Before final response, confirm the evidence docs touched or explain why none were needed.

## Format

Use `references/preset-evidence-format.md` as the required format reference when creating or
substantially revising source evidence files.

Existing legacy evidence files do not need full migration during unrelated work, but any new or
heavily touched file should move toward that format.

## Validation

For documentation-only evidence changes, run:

```sh
git diff --check
```

For schema or generated-artifact changes, also run the narrowest relevant package validation, usually:

```sh
pnpm --filter @kiskadee/web-builder build
```

If generated artifacts are expected to change, run the established generation command:

```sh
pnpm --filter @kiskadee/web-builder run build-sync-generate
```
