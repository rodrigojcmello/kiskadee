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
