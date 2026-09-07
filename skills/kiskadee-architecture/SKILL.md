---
name: kiskadee-architecture
description: Choose Kiskadee project ownership, shared contracts, token taxonomy, or composition mechanisms. Use for architectural decisions and cross-project handoff changes.
---

# Kiskadee Architecture Skill

Use this skill to make architecture decisions and implementation plans that stay consistent with
Kiskadee's package responsibilities.

## Primary sources

Read only what the task needs, in this order:

1. `../../docs/definitions/project-governance.md` for project authority and handoffs
2. `../../PROJECT-PURPOSE.md` for product context and the architecture overview
3. `../../docs/definitions/composition-strategies.md` when choosing between a component, slot,
   variant, mode, option, profile, Effect, Provider, platform mechanic, or Web composition pattern
4. `references/monorepo-map.md` as a quick routing summary
5. `references/taxonomy-rules.md`
6. `../../SCHEMA-BUILD-RUNTIME-RULES.md`
7. `../../packages/web-builder/docs/definitions/structural-utility-projections.md` when an existing
   token-only scale utility may be conditionally reused by a different structural owner
8. `../../STRUCTURAL-CSS.md` when structural Sass is involved
9. `references/headless-react-patterns.md` for headless React work
10. `references/testing-checklist.md` for validation planning

## Follow this workflow

1. Identify the requested outcome and affected concern before choosing its owning project.

2. Determine the correct project authority before proposing code. Identify its allowed inputs,
   published handoff, transformers, and consumers for the concern being changed.

   For repository-governance surfaces, identify the nearest normative definition and verify that
   summaries, bootstrap documents, agent rules, and skills remain derived from it.

3. Apply `../../docs/definitions/composition-strategies.md` when choosing or materially changing a
component, slot, variant, mode, option, profile, Effect, Provider, Headless primitive, platform
mechanic, or Schema-to-Web composition pattern.

4. When token modeling changes, validate taxonomy fit using `references/taxonomy-rules.md`.

5. Validate project ownership using `../../docs/definitions/project-governance.md`. Use
   `references/monorepo-map.md` only for quick routing.

6. If the task involves schema/build/runtime placement, validate ownership using
   `../../SCHEMA-BUILD-RUNTIME-RULES.md`.

7. If a generated token-only scale utility may be applied to a wrapper or different structural
   owner, apply
   `../kiskadee-structural-utility-projections/SKILL.md` before proposing a new bucket or runtime
   class reuse.

8. If the task involves React headless components, apply `references/headless-react-patterns.md`.

9. For a new component, load `references/new-component-rollout.md`.

10. Use `references/testing-checklist.md` to select validation for the affected behavior.
    Execute it for authorized implementation; propose it for analysis-only work.

## Hard constraints

- Follow project authority and handoffs from `../../docs/definitions/project-governance.md`.
- Treat `../../docs/definitions/composition-strategies.md` as a routing guide. It does not transfer
  authority or replace the complete contracts in its linked domain definitions.
- Treat imports and implementation responsibilities as consumption evidence, not as transfer of
  authority.
- Treat cross-project definitions, root architecture documents, agent instructions, and skills as
  repository-governance surfaces rather than implementation projects. They must preserve the
  precedence defined in `../../docs/definitions/project-governance.md`.
- A downstream adapter may translate platform mechanics but must not re-author upstream semantics.
- Treat schema declaration as necessary but not sufficient for "component done".
- When evaluating architecture tradeoffs, distinguish build-time tooling/runtime-in-Node from
  browser runtime. Prefer simplicity, correctness, and maintainability in build-only code even if
  that means extra dependencies or heavier validation; optimize aggressively only for generated
  artifacts and code that executes in the browser.
- For structural Sass in `packages/components/react`, follow
  [STRUCTURAL-CSS.md](../../STRUCTURAL-CSS.md).
- Put behavioral switches in `components.<name>.options` and keep the corresponding numeric/visual
  values in `components.<name>.elements`.
- If a schema value must exist but only apply when a runtime/component option enables it, do not
  assume the generic artifact scale bucket is enough; verify whether `packages/web-builder` needs a
  dedicated opt-in bucket.
- If an already emitted token-only scale utility must be applied independently to a different
  structural DOM owner, evaluate the Structural Utility Projection Registry before creating another
  dedicated bucket. Keep it distinct from Style Emission Policy.
- Structural utility projections use only
  `element.p[artifactKey][scaleKey] = className`; `p` never stores raw values or semantic metadata.
- The Structural Utility Projection Registry currently serves Button connected-divider overlap and
  Dropdown independent empty leading tracks.
- Migration of Tabs fixed width remains a future candidate, not an active `p` consumer.
- For fixed-geometry component types (for example `tabs.segmented`), keep the public type unique
  and prefer narrowing generic schema keys via type-specific Zod/contracts over inventing ad hoc
  schema properties or builder-only exceptions.
- When a fixed-geometry type needs rounded shells/items, keep the radius values in the
  participating schema elements themselves and let structural CSS only flatten the corners that
  must be straight; avoid cross-element radius inheritance or arithmetic in the component layer.

## Conditional Detail

- When adding explanatory function comments, follow [function-comments.md](references/function-comments.md).
- Before Schema or builder changes, use [schema-artifact-decisions.md](references/schema-artifact-decisions.md).
- For a new component, use [new-component-rollout.md](references/new-component-rollout.md).

## Handoff

Explain the decision, rationale, owning paths, impact, and validation. Use a short paragraph for
small decisions; add structure only when it helps review. An implementation task ends with verified
results, not just a verification plan. An analysis-only task ends with findings or a proposal.
