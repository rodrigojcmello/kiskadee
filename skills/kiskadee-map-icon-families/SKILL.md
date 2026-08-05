---
name: kiskadee-map-icon-families
description: Maintain Kiskadee interface-icon names and family mappings. Use when adding a canonical icon concept, adding an official family, replacing a direct interface-icon import with a semantic name, changing RTL direction metadata, or diagnosing incomplete family coverage.
---

# Kiskadee Map Icon Families

Use this skill to keep the curated interface-icon contract complete without turning Kiskadee into
a mirror of every upstream library.

## Sources of truth

- `packages/icons/src/interface/canonical.ts`: canonical public names.
- `packages/icons/metadata/interface-families.json`: official family mappings, provenance, and
  directional behavior.
- `packages/icons/scripts/generate-interface-families.ts`: deterministic generator and coverage
  audit.
- `packages/icons/src/interface/families/`: generated adapters; never edit manually.
- `packages/icons/docs/definitions/icon-families.md`: durable ownership contract.
- `packages/icons/docs/definitions/interface-icon-provenance.md`: pinned upstream sources.

## Classification

Before editing, classify the requested artwork:

1. Reuse an existing canonical name when the concept already exists.
2. Add an unnamespaced canonical name only for a common interface concept that every official
   family can represent.
3. Use `${company}:${concept}` for product-specific concepts supplied by application families.
4. Keep one-off or unmapped upstream icons as direct React nodes.
5. Keep social and brand artwork in the independent social-icon pipeline.

Do not add a canonical name merely because one Showcase screen needs unusual artwork. Do not map
social marks through interface families.

## Workflow

1. Read `AGENTS.md` and the icon-family definition.
2. Search canonical names, metadata, generated adapters, and direct imports before choosing a new
   name.
3. Update `canonical.ts` when a genuinely new canonical concept is required.
4. Add the closest semantic mapping for every official family in
   `metadata/interface-families.json`.
5. Classify direction as `fixed`, `mirror`, or `unique`. Supply an explicit RTL glyph when the
   upstream family provides distinct artwork.
6. When adding a family, use an explicit public subpath, an optional peer dependency, a pinned
   upstream version, and provenance/license documentation. Registration must remain inert.
7. Run deterministic generation and never patch generated family files by hand.
8. Replace deliberate direct interface imports with `Icon`, `IconGlyph`, or a component slot
   `name`; preserve arbitrary direct nodes when that is the intended escape hatch.
9. Update affected definitions, Showcase text, and preset evidence when a recommendation changes.

## Validation

Run the narrow checks first:

```sh
pnpm --filter @kiskadee/icons generate
pnpm --filter @kiskadee/icons check:generated
pnpm --filter @kiskadee/icons build
```

Then verify:

- every official family covers every canonical name;
- no generated adapter imports an uninstalled undeclared upstream peer;
- no accidental direct interface-library imports remain outside family adapters and deliberate
  direct cases;
- RTL metadata renders correctly;
- unselected lazy families create no browser request;
- Material Symbols requests only the canonical ligature subset;
- social icons and fixed brand paint remain unchanged;
- React Components and Showcase still compile.

If a concept has no credible equivalent across the official families, stop and keep it namespaced
or direct instead of inventing a misleading mapping.
