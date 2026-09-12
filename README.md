# Kiskadee

Kiskadee is a design-system framework that models visual identity as data. A platform-agnostic
Schema describes colors, scales, decorations, and effects so design-system meaning can be shared
across Web, Android, and iOS implementations.

The project separates visual identity, compilation, accessible behavior, and UI composition.
Official presets adapt Material, Apple, Fluent, and Carbon sources to the shared contract. Web is
the most mature delivery path; Android and iOS provide native implementation proofs of the same
visual contract.

## How it fits together

- **Visual identity:** Core defines the Schema; presets supply concrete design-system instances.
  Tonal generation and portable brand definitions support their color workflows.
- **Web delivery:** the Web Builder compiles presets into deduplicated utility CSS and class maps.
  React components compose those artifacts with headless behavior and structural CSS. Shared
  browser infrastructure supports dynamic colors, with optional font and icon integrations.
- **Native delivery:** Android and iOS components consume the canonical Schema or derived payloads
  through platform-specific loaders and resolvers.
- **Inspection:** the Web Showcase and native showcase applications exercise real component usage.

The [project map and governance](docs/definitions/project-governance.md) defines each package's
responsibilities, allowed inputs, and published handoffs.

## Explore and develop

This is a PNPM monorepo. Use the Node version in [.nvmrc](.nvmrc).

- [Web Showcase](packages/showcase/README.md): local development and preset inspection.
- [React components](packages/components/react/README.md): component integration.
- [Android](packages/components/android/README.md) and [iOS](packages/components/ios/README.md):
  native setup and validation.
- [Web Builder](packages/web-builder/README.md): generation pipeline and artifact documentation.

## Understand the contracts

- [Nomenclature](docs/definitions/nomenclature.md): Schema, DSPE, and other Kiskadee terms.
- [Schema, build, and runtime](SCHEMA-BUILD-RUNTIME-RULES.md): visual values and execution boundaries.
- [Composition strategies](docs/definitions/composition-strategies.md): choosing components,
  profiles, Effects, Providers, and other composition mechanisms.
- [Structural CSS](STRUCTURAL-CSS.md): Web layout and structural styling rules.
- [Preset definitions](packages/presets/docs/definitions/): source fidelity and preset authorship.

Agent workflows follow [AGENTS.md](AGENTS.md).
