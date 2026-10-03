# Carbon Layout evidence

Status: **Kiskadee extension**. The shared Layout spacing calibration is supplied by the framework,
not derived from IBM Carbon spacing tokens. Upstream Layout fidelity is **Not inspected**;
no source equivalence is claimed.

The preset registers the [shared factory](../../../../src/utils/createLayoutSchema.ts) for
`components.layout`. Frame padding/margin and flow spacing use the same eleven-value ladder.
The [Layout schema rules](../../../definitions/schema-rules/layout.schema-rules.md) record its
approved values and the separate Core, Builder and platform ownership. Carbon colors, surfaces,
states, effects and component geometry retain their own recipes.
