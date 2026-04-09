# Headless React Patterns

## Goal of `packages/headless/react`

Provide unstyled, accessible behavior primitives that visual layers can compose.

## Preferred API style

Use compound components with explicit structure:

- `Component.Root`
- `Component.Trigger` / `Component.List` / `Component.Panel` (as applicable)
- optional helper pieces (`Indicator`, `Label`, etc.)

## Implementation rules

- Keep state and behavior in context at Root-level.
- Keep visual styling out of behavior logic.
- Expose compact class hooks (`e1`, `e2`, ...) only as integration points.
- Ensure controlled/uncontrolled behavior is explicit.
- Preserve keyboard and ARIA semantics first, styling second.

## Accessibility baseline

- Correct roles and relationships (`aria-controls`, `aria-labelledby`, etc.).
- Keyboard support per pattern (arrows/home/end/enter/space as relevant).
- Disabled behavior must be semantically reflected (`aria-disabled`, focus rules).

## Composition guidance

- Keep icon/label content as consumer composition unless standardization is needed.
- Add structural helper elements (e.g., `Indicator`) only when behavior/layout sync is needed.

## Testing expectations

- Prefer `@testing-library/react` for behavior and a11y assertions.
- Assert by role and ARIA state instead of brittle HTML snapshots.
