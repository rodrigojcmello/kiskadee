---
name: kiskadee-architecture
description: Choose Kiskadee project ownership, shared contracts, token taxonomy, or composition mechanisms. Use for architectural decisions and cross-project handoff changes.
---

# Kiskadee Architecture Skill

Use this skill to make architecture decisions and implementation plans that stay consistent with
Kiskadee's package responsibilities.

## Decision And Sources

Identify the requested outcome and concern. Use
[project-governance.md](../../docs/definitions/project-governance.md) to establish its authority,
allowed inputs, transformers, published handoff, and affected consumers before proposing code.
For repository instructions, identify the nearest normative definition and keep derived guidance
consistent with it. Reuse sources already read while they remain current.

Load additional guidance only for the matching decision:

| Concern | Reference |
| --- | --- |
| Product purpose or delivery context is missing | [README.md](../../README.md) |
| Choosing or materially changing a component, slot, variant, mode, option, profile, catalog, Effect, Provider, Headless primitive, platform mechanic, or named composition pattern | [composition-strategies.md](../../docs/definitions/composition-strategies.md) |
| Token classification changes | [taxonomy-rules.md](references/taxonomy-rules.md) |
| Schema/build/runtime placement or artifact semantics change | [SCHEMA-BUILD-RUNTIME-RULES.md](../../SCHEMA-BUILD-RUNTIME-RULES.md) and [schema-artifact-decisions.md](references/schema-artifact-decisions.md) |
| Existing token-only utility reuse on a different structural owner | [projection skill](../kiskadee-structural-utility-projections/SKILL.md) before choosing a bucket or runtime reuse |
| Structural Sass changes in React components | [STRUCTURAL-CSS.md](../../STRUCTURAL-CSS.md) before editing |
| Headless React behavior or API changes | [headless-react-patterns.md](references/headless-react-patterns.md) |
| New component delivery | [new-component-rollout.md](references/new-component-rollout.md) |
| Selecting implementation or handoff checks | [testing-checklist.md](references/testing-checklist.md) |
| Adding explanatory function comments | [function-comments.md](references/function-comments.md) |

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

## Handoff

Explain the decision, rationale, owning paths, impact, and validation. Use a short paragraph for
small decisions; add structure only when it helps review. An implementation task ends with verified
results, not just a verification plan. An analysis-only task ends with findings or a proposal.
