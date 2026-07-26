# Fluent Switch Polish

This tracks remaining Fluent Switch follow-ups that were not promoted into the
stable Switch schema rules.

## Open Checks

- Reassess raw Fluent thumb colors observed during earlier extraction:
  `#616161`, `#575757`, `#424242`, `#D1D1D1`, and `#242424`.
- Validate track padding against the current generated geometry.
- Confirm thumb geometry after the latest schema and runtime motion changes.
- Revalidate compensated padding emission for the Switch track.
- Confirm whether the current single-size assumptions still hold for the
  Fluent preset.
- Review any remaining references to older `switchDataAttributeProjections`
  patterns and remove them if they no longer describe the current runtime.

## Boundaries

These items are polish and verification work. They should not reopen the stable
axis decisions already documented in component intents and Switch schema rules:

- the default Switch presentation remains `neutral.medium`;
- selected/on activation color is a control-state color, not a new component
  intent by itself;
- `low` emphasis is the local strong-surface adaptation, not dark mode.

## Surface Context Migration

The shared schema now models a local strong-surface relationship through
`surfaceContext="onVivid"`. Fluent Button is the first experiment and publishes
On-subtle and On-vivid independently from emphasis.

Fluent Switch still overloads `low` as its on-primary appearance. Preserve that
behavior until Switch adopts the shared axis in a separate component-scoped
change. That migration must keep the current visual evidence, remove the
surface meaning from emphasis, add an explicit on-vivid capability, and update
the Switch Showcase before this debt can be closed.
