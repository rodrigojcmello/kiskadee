# Testing Checklist

Use this checklist when implementing architecture-related or headless React changes.

## Mandatory checks

1. Type-check affected package:
- `cd packages/headless/react && npx tsc -p tsconfig.json --noEmit`

2. Run focused tests for edited area:
- `cd packages/headless/react && npx vitest run src/<path>/<file>.test.tsx`

3. Run repository-level test suite before finalizing:
- `npm test`

## Architecture checks

- Confirm change is in correct package boundary.
- Confirm token classification uses the right taxonomy bucket.
- Confirm no platform-specific behavior leaked into platform-agnostic layers.

## Headless checks

- Controlled/uncontrolled behavior is deterministic.
- Keyboard interactions cover happy path and disabled path.
- ARIA roles/states/relationships are preserved.

## Output checks

- Public exports are updated when new APIs/types are added.
- Tests cover new subcomponents and failure modes (outside-context usage, etc.).
