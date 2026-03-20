---
name: kiskadee-architecture
description: Architecture specialist for the Kiskadee monorepo. Use when tasks involve package boundaries, token taxonomy decisions (palettes/scales/decorations/effects), web-builder generation flow, headless React composition patterns, or preserving consistency across core, presets, runtime, components, and showcase.
---

# Kiskadee Architecture Skill

Use this skill to make architecture decisions and implementation plans that stay consistent with Kiskadee's package responsibilities.

## Follow this workflow

1. Identify the requested change and classify it:
- token modeling
- preset adaptation
- web build/generation
- runtime behavior
- headless behavior/accessibility
- visual component composition
- showcase integration

2. Determine the correct package boundary before proposing code.

3. Validate taxonomy fit using `references/taxonomy-rules.md`.

4. Validate package ownership using `references/monorepo-map.md`.

5. If the task involves React headless components, apply `references/headless-react-patterns.md`.

6. If the task is "new component", apply the rollout checklist below.

7. End with a verification plan from `references/testing-checklist.md`.

## Hard constraints

- Keep platform-agnostic schema concerns in `packages/core`.
- Keep adaptation/mapping decisions in `packages/presets`.
- Keep schema-to-web artifact generation in `packages/web-builder`.
- Keep dynamic color variable/runtime behavior in `packages/runtime`.
- Keep unstyled semantics and accessibility in `packages/headless`.
- Keep visual implementation/composition in `packages/components`.
- Keep inspection/demo integration in `packages/showcase`.
- Treat schema declaration as necessary but not sufficient for "component done".
- For structural classes in `packages/components/react`, use `k-<cmp>-e<n>` for schema elements (`cmp` = 3-letter id, e.g. `tab`) and short option suffixes (`-t`, `-b`); keep visual theming in generated artifacts/runtime, not hardcoded Sass.
- Put behavioral switches in `components.<name>.options` and keep the corresponding numeric/visual values in `components.<name>.elements`.
- If a schema value must exist but only apply when a runtime/component option enables it, do not assume the generic artifact scale bucket is enough; verify whether `packages/web-builder` needs a dedicated opt-in bucket.

## Comment pattern

When adding explanatory comments above functions, use this exact structure:

```ts
/**
 * What
 *     Briefly describe what the function does.
 * Why
 *     Briefly describe why the function exists or where the runtime depends on it.
 */
```

- Keep comments in English.
- Keep the text visually compact and wrap long lines with the same indentation style.
- Keep each comment line at 100 characters maximum.
- Keep `What` to 3 lines maximum.
- Keep `Why` to 3 lines maximum.
- Prefer one short `What` paragraph and one short `Why` paragraph per function comment.

## Schema and artifact decision rules

Use these rules before proposing a schema change:

1. If the change answers "which behavior/mode is active?", prefer `components.<name>.options`.
2. If the change answers "what is the value for that behavior?", prefer the relevant element `scales/decorations/palettes/effects`.
3. If the value is always-on once generated, the generic artifact bucket is usually enough.
4. If the value must be generated but only conditionally applied by the visual layer, check whether the artifact needs a dedicated bucket instead of merging into generic `s`.

Example:

- `tabs.options.tabWidthMode` selects `auto` vs `fixed`.
- `tabs.variants.<type>.elements.e2.scales.boxWidth` stores the fixed width token.
- `packages/web-builder` may publish a dedicated width bucket so `packages/components` can opt in only when the mode is `fixed`.

## New component rollout checklist

When adding a component (for example `tabs`), validate all layers:

1. Schema/preset layer:
- Add `components.<name>.elements` in the preset schema.
- Confirm taxonomy usage (palettes/scales/decorations/effects).

2. Build artifacts layer:
- Confirm class maps/CSS artifacts generate for the component.
- Confirm any required metadata is published for showcase capability checks.

3. Headless layer:
- Implement behavior + accessibility primitives in `packages/headless`.
- Add unit tests for semantics, keyboard flow, and state transitions.

4. Visual component layer:
- Implement React visual wrapper in `packages/components` consuming class maps + headless API.
- Expose public exports/types.

5. Showcase layer:
- Add route/page and practical examples.
- Validate against manifest-driven capability behavior when applicable.

## Decision output format

When giving architecture recommendations, structure the output as:

1. `Decision`
2. `Why`
3. `Where` (exact package/path)
4. `Impact`
5. `Validation`

## Reference files

- `references/monorepo-map.md`
- `references/taxonomy-rules.md`
- `references/headless-react-patterns.md`
- `references/testing-checklist.md`
