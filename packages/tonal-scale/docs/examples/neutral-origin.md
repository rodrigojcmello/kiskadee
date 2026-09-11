# Unified Neutral Preview

Generator candidate: 0.10.0. No preset assets were modified.

Open the existing Fluent recipe link in `fluent-vivid-lights.md`. The neutral
editor defaults to Keep existing neutral and displays its legacy #21242d input.
Selecting Derive from primary creates #1b222b from primary #0064b4. Switching
back retains the manual #21242d seed. Entering #000000 in existing mode produces
only V1; a configured neutral produces V1 + V2. V3/V4 remain separate variants.

The shared reference controls apply rules independently to V1/V2; selecting a
fixed position applies the same position to both. Pure V1 always retains its
canonical grayscale and source-exact policy.

The opt-in recipe field is documented in ../definitions/tonal-system.md.
Derivation parameters are candidates for visual acceptance. The existing
multifamily requirement for chromatic primaries is unchanged; the derivation
helper itself emits no tint for an achromatic input.

Preset documentation version-label audit remains deferred: the approved
Fluent/iOS artifacts still carry 0.7.0 provenance, while the local generator is
0.10.0. No promotion is implied by this preview.
