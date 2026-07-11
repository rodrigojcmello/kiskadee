# Preset Tonal Scale Integration

Status: deferred until after Kiskadee Tonal Scale v1 approval.

This document reserves a follow-up for connecting `@kiskadee/tonal-scale` to
official presets. It is not an active proposal and does not define the output
format, preset contract, migration, or ownership boundary.

Milestone 1 is intentionally limited to making the standard scale functionally
complete and obtaining explicit visual approval. During that milestone:

- presets and their types remain unchanged;
- the generator has no preset export API;
- the local `generate` CLI is inspection-only and writes no artifacts;
- no component state mapping or preset anchor policy is introduced.

After approval, a separate plan must decide:

- the serialized artifact format and required metadata;
- whether generation is invoked manually or by a build workflow;
- how generated slots map to existing preset schemas and semantic layers;
- whether any shared color types need migration;
- how official Design System evidence and explicit exceptions are recorded;
- compatibility, validation, and rollout for the first pilot preset.

The canonical generator contract is documented in
`docs/definitions/tonal-scale.md`. Decisions in this deferred document must not
change that contract implicitly.
