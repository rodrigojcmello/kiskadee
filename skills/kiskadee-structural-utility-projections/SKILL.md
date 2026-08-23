---
name: kiskadee-structural-utility-projections
description: Architecture workflow for Kiskadee structural utility projections. Use when a generated token-only scale utility must be applied conditionally to a wrapper or different structural DOM owner, when proposing or reviewing the compact `p` class-map bucket and the Structural Utility Projection Registry, or when deciding between normal class resolution, Style Emission Policy, a dedicated artifact bucket, runtime composition, and structural Sass.
---

# Kiskadee Structural Utility Projections

Use this skill to keep conditional utility reuse inside the schema-build-runtime boundaries instead
of copying visual values into component code.

## Read first

Read these sources in order:

1. `../../packages/web-builder/docs/definitions/structural-utility-projections.md`
2. `../../SCHEMA-BUILD-RUNTIME-RULES.md`
3. `../../STRUCTURAL-CSS.md` when structural Sass or a different DOM owner is involved
4. `../../packages/web-builder/docs/definitions/style-emission-policy.md`
5. `../../packages/web-builder/docs/definitions/generated-artifacts.md`

## Follow this workflow

1. Identify the schema element that owns the visual value.
2. Locate the normal generated utility and class-map bucket that already serves that element.
3. Identify the structural node that needs the utility and the exact condition that activates it.
4. Apply the eligibility test from the canonical definition.
5. Reject projection when the task actually requires:
   - a new schema value;
   - a different CSS emission shape;
   - component behavior or an option;
   - ordinary structural layout; or
   - palette, intent, emphasis, theme, or interaction-state selection.
6. If projection remains justified, propose one explicit Registry entry and a stable lowercase
   artifact key of one to three characters. Derive scale keys from source authorship; do not list
   them in the Registry or infer entries from component code or generated CSS.
7. Preserve the canonical output shape:
   `element.p[artifactKey][scaleKey] = className`.
8. Verify that `p` carries only existing token-only scale utility references and that an empty
   Registry omits it.
9. Validate artifact size, utility deduplication, runtime ownership, and absence of new requests or
   browser modules.

## Hard constraints

- Keep the Structural Utility Projection Registry in the Web Builder. Do not add it to Core or
  preset schema.
- Keep visual values in the source schema element.
- Never put raw values, CSS declarations, state, semantic metadata, or options in `p`.
- Never use a projection to copy an element's complete class list when one utility subset is enough.
- Never inspect descendants, class strings, or CSS declarations at runtime.
- Keep projections palette-independent and scale-keyed.
- Project only standard scale properties whose source Style Emission Policy is `token`.
- Keep source and target in the same component, variant, and mode branch.
- Reject cross-component projection, projection chains, and target custom-property collisions.
- Resolve `all` plus the active scale; do not invent scale fallback.
- Do not create CSS rules, effect recipes, component artifacts, providers, or runtime dependencies
  for a projection.
- Preserve `button-group-divider-thickness` as the canonical active example: optional
  `Button.e6.boxWidth` projects to `Button.e1.p.gd` with `retainSource: true`.
- Preserve the Dropdown independent-track entries: `e3` publishes `iw/ig`, `e10` publishes `sw/sg`,
  and p-react applies them only to empty structural leading-track nodes.
- Treat migration of Tabs fixed width only as a future candidate until its ownership is reviewed.

## Decision output

Report:

1. `Source owner`
2. `Structural consumer`
3. `Why normal resolution is insufficient`
4. `Projection eligibility`
5. `Artifact shape`
6. `Runtime activation`
7. `Validation`
