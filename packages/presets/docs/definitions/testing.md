# Preset validation and testing

Presets are configuration data. Unit tests cover the mechanisms that interpret or generate that
data, not snapshots of an individual preset's visual choices.

## Shared contract validation

Run the same Core validators against every preset in `src/test-schemas.ts`. The shared suites
validate component topology, references, typography, icons, foregrounds, contours, separators,
and presence. Add new presets to this catalog. Do not branch assertions by preset name or freeze
its supported size list, colors, spacing, font stack, or palette recipes.

Core owns the validators and their positive/negative fixture tests. Presets owns integration
checks that its instances satisfy those contracts. Builder tests own artifact emission and
resolution behavior. A missing assertion for a specific spacing value is not a review finding.

## Executable logic and source integrity

Keep unit tests for resolvers, formulas, projectors, and tooling. Prefer small synthetic inputs
and assertions about behavior, error handling, and input propagation over importing a complete
preset as an expected visual result. A preset-local algorithm can still have unit tests; its
location does not make its executable behavior configuration.

Source provenance checks (signed asset hashes, JSON/TypeScript agreement, and evidence references)
are integrity checks, not visual snapshots. Keep them until their provenance contract changes.

## Visual choices

Record approved dimensions, typography, colors, and their rationale in preset evidence documents.
Do not duplicate those choices as unit-test expectations. Visual regression suites per preset are
planned for a later maturity stage; they are not implemented by this migration. Until then,
rendered inspection remains necessary for visual changes, and shared contract validation does
not establish visual correctness or contrast quality.

## Migration

The 2026-09-10 migration removes the component and full-schema visual expectation suites under
`src/presets`, plus the recipe assertions in the former Dropdown, Separator, icon-size, and
typography suites. Shared validation is consolidated in `schema-contracts.test.ts` and
`typography.schema.test.ts`. Existing color resolver, type-boundary, brand projector, generation,
and asset-integrity tests remain. No replacement iOS Button e7 padding snapshot is required.
