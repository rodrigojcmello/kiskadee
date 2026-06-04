# Switch Component In-Progress

## Current Direction

`Switch` is now the single public styled React component for the Switch family.

The previous public v1 implementation and separate public motion boundary were removed. The
optimized single-component implementation was promoted into
`packages/components/react/src/components/Switch`.

## Public Contract

- Public component: `Switch`.
- Public hook: `useSwitchArtifactConfig`.
- Public props type: `SwitchProps`.
- Runtime motion is controlled by `motion?: false` on `Switch`.
- There is no separate public motion component export.
- There is no second-version public component export.

## Implementation Notes

- Structural namespace is `k-swt`.
- Runtime motion, `thumbSize`, `activationFeedback`, and `controlText` remain internal modules.
- `controlText` is isolated under `features/control-text`.
- The Showcase uses only `/switch`.
- The second-version Showcase route was removed.

## Validation

- `pnpm --filter @kiskadee/react-components run build`
- `pnpm --filter @kiskadee/showcase build`
