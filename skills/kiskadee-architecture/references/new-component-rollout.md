# New Component Rollout

When adding a component (for example `tabs`), validate all layers:

1. Schema/preset layer:
- Add `components.<name>.elements` in the preset schema.
- Confirm taxonomy usage (palettes/scales/decorations/effects).

2. Build artifacts layer:
- Confirm class maps/CSS artifacts generate for the component.
- Confirm any required metadata is published for showcase capability checks.

3. Headless layer:
- Implement behavior + accessibility primitives in `packages/headless`.
- Add unit tests for semantics, keyboard flow, and state transitions.

4. Visual component layer:
- Implement React visual wrapper in `packages/components` consuming class maps + headless API.
- Expose public exports/types.

5. Showcase layer:
- Add route/page and practical examples.
- Validate against manifest-driven capability behavior when applicable.

