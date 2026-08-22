# Kiskadee Nomenclature

Status: canonical cross-package definition.

This document standardizes terms and abbreviations that have a specific architectural meaning in
Kiskadee. It is not a glossary of general software, web, or design-system terminology.

A term belongs here only when Kiskadee defines, narrows, or relies on its meaning as part of a
cross-package contract. General industry abbreviations remain ordinary technical vocabulary and
are intentionally excluded.

## Canonical abbreviations

### AF — Activation Feedback

Kiskadee's visual response to actionable interaction. AF is modeled as an interaction capability
and must not be treated as structural ownership or as an arbitrary component animation.

### CP-I — Consumer-provided Icon

Arbitrary icon content deliberately supplied by the consumer through composition or an explicit
renderer. A Kiskadee component owns the slot, but does not interpret the artwork or choose its icon
family.

### DSPE — Decorations, Scales, Palettes, and Effects

The four fundamental visual domains available under a schema element. Use **DSPE taxonomy** as the
canonical collective term for this structure:

- **Decorations** define structural, always-on base styling.
- **Scales** normalize size and geometry through reusable references.
- **Palettes** define semantic color by intent, emphasis, and interaction state.
- **Effects** define optional, additive visual treatments.

DSPE is a collective abbreviation, not a fifth schema domain. Its letter order is mnemonic and does
not establish evaluation precedence or serialized object order. Element topology, options, variants,
global catalogs, and recipes are not part of the DSPE taxonomy.

### E-I — Essential Icon

An internal affordance selected from Kiskadee's limited global essential-icon catalog. Components
request the concept from the `EssentialIconProvider` and omit the complete affordance when it cannot
be resolved.

### IFP — Icon Family Provider

The optional authority that selects the effective icon family and variant for family-resolved
icons. Components and icon slots must not select another family independently.

### SEP — Style Emission Policy

The build-time policy that defines how a Style Key is materialized in generated CSS and class-map
artifacts, such as direct, token, or mirrored emission.

### SUP — Structural Utility Projection

The build-time mechanism that exposes an already emitted token-only utility so an approved
structural owner can consume the same class reference without copying its value.

## Canonical terms without abbreviations

### Family-resolved Icon

An icon requested by `IconName` and resolved against the effective family and variant selected by
the IFP. `FamilyResolvedIcon` is the React implementation of this resolution mode.

### Schema

Kiskadee's platform-agnostic, serializable visual contract. Core defines its types and validation;
presets provide concrete instances; builders compile those instances into platform artifacts. The
Schema owns visual semantics, including the DSPE taxonomy, but does not own component runtime
behavior, structural layout, resource imports, callbacks, or generated artifacts.

Use **Schema** when referring to this Kiskadee contract. A generated `schema.json` is a reference
snapshot or input artifact; it is not the sole definition of the Schema.

### Style Key

The Web Builder's canonical serialized identity for one style property and value, with any relevant
state, size, breakpoint, or reference context. Style Keys allow equivalent schema values to be
deduplicated and carried into generated CSS and class-map artifacts.

A Style Key is not a Schema property name, generated CSS class name, component prop, or public
runtime API.

### Showcase

The Kiskadee consumer and visual-validation application located at `packages/showcase`. Showcase
demonstrates and inspects framework behavior; it is not the architectural owner of behavior that
belongs to Core, presets, builders, runtimes, or component projects.

## Project aliases

The `p-` prefix identifies a Kiskadee platform component project in project discussions. These are
communication aliases, not package names, import scopes, or filesystem replacements.

### `p-react`

The Web React visual component project at `packages/components/react`. It does not refer to
`packages/headless/react`; use **headless-react** when naming that project.

### `p-android`

The Android component project rooted at `packages/components/android`.

### `p-ios`

The iOS component project rooted at `packages/components/ios`.

## Usage rules

- Use the full term on first mention when the audience may not know the abbreviation.
- Do not create an abbreviation solely to shorten a local implementation detail.
- Add a term here only when its meaning is stable and applies across packages.
- Keep component-local vocabulary in that component's nearest documentation.
- Keep general technical abbreviations out of this document unless Kiskadee assigns them a narrower
  normative meaning.
- Use **DSPE taxonomy** when discussing the four visual domains collectively; use the individual
  domain name when ownership or behavior differs between them.
- Capitalize **Schema**, **Style Key**, and **Showcase** when invoking their canonical Kiskadee
  meanings. Lowercase remains appropriate for ordinary generic usage.
- Keep the project aliases lowercase and hyphenated: `p-react`, `p-android`, and `p-ios`.

## Related definitions

- [Icon consumption](./icon-consumption.md) defines the complete E-I, CP-I, family-resolution, and
  icon-size ownership contracts.
- [Project purpose](../../PROJECT-PURPOSE.md) defines the Schema, DSPE domains, package ownership,
  and platform flow.
- [Schema, build artifacts, and runtime rules](../../SCHEMA-BUILD-RUNTIME-RULES.md) defines the
  boundary between Schema ownership and generated or runtime behavior.
- [Structural utility projections](../../packages/web-builder/docs/definitions/structural-utility-projections.md)
  defines the SUP eligibility, registry, and artifact contracts.
