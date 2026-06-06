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
- KIS-28 feature inventory lives at
  `packages/components/react/docs/definitions/switch/switch-features.md`.
- Runtime motion, `thumbShrink`, `activationFeedback`, and `controlText` remain internal modules.
- `controlText` is isolated under `features/control-text`.
- The Showcase uses only `/switch`.
- The second-version Showcase route was removed.
- `radius="rounded"` is resolved from generated track variables, not from a runtime radius
  measurement. The track keeps the generated radius class, computes `--k-swt-tr` from `--k-bdr`,
  `--k-bdw`, and compensated padding vars, and the thumb/thumb-shrink visual consume that structural
  value through `k-swt-e3a-a` / `k-swt-x5a-a`.
- Do not apply the generated rounded radius class from `e3` to the thumb or `x5`; that reintroduces
  the raw track-radius bug. `pill` and `square` still use generated thumb radius classes directly.

## Validation

- `pnpm --filter @kiskadee/react-components run build`
- `pnpm --filter @kiskadee/showcase build`
- `pnpm --filter @kiskadee/showcase run build:components`
- `pnpm --filter @kiskadee/showcase run build:artifacts`

## Latest Validation

- 2026-06-05: KIS-28 docs-only feature inventory added; link/name review passed.
- 2026-06-05: `pnpm --filter @kiskadee/react-components run build:styles`
- 2026-06-05: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-06: KIS-36 `thumbSize -> thumbShrink` naming migration completed.
- 2026-06-06: `pnpm --filter @kiskadee/react-components build`
- 2026-06-06: `pnpm --filter @kiskadee/showcase run build:components`
- 2026-06-06: `pnpm --filter @kiskadee/showcase run build:artifacts`
