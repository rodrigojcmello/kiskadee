# Monorepo Map

## Package ownership

- `packages/core`
  - Own schema, types, and cross-platform token model.
  - Avoid platform-specific CSS/layout behavior.

- `packages/presets`
  - Own official preset adaptations (Material, iOS, Fluent, Carbon).
  - Store design-system interpretation decisions here.

- `packages/web-builder`
  - Own schema-to-web generation (CSS utilities, class maps, JSON artifacts).
  - Keep dedupe and output optimization logic here.

- `packages/runtime`
  - Own browser runtime for dynamic color scales and CSS variable injection.

- `packages/headless`
  - Own unstyled component behavior, semantics, and accessibility.

- `packages/components`
  - Own visual React components combining generated CSS + headless behavior.

- `packages/showcase`
  - Own Next.js inspection app and visual validation screens.

## Boundary rules

- Do not move preset adaptation logic into `core`.
- Do not move visual structure/layout into `headless`.
- Do not move web generation internals into `components`.
- Do not treat showcase-only needs as core architecture constraints.

## Quick routing guide

- "New token shape/type" -> `core`
- "Preset-specific mapping" -> `presets`
- "Generated CSS/class-map bug" -> `web-builder`
- "Dynamic theme/runtime color update" -> `runtime`
- "Keyboard/a11y behavior" -> `headless`
- "Component visual style" -> `components`
- "Docs/demo visualization" -> `showcase`

## Canonical end-to-end flow

Use this order when reasoning about delivery status:

1. `core` defines contracts.
2. `presets` instantiate schemas for each design system.
3. `web-builder` generates artifacts (`build/<designSystemKey>`).
4. `web-builder sync/generate` copies artifacts and refreshes showcase registries.
5. `components` consumes artifacts + headless behavior.
6. `showcase` routes render real scenarios using synced artifacts and components.

Rule:
- Successful schema/build does not mean "component delivered" until component + showcase route are in place.
