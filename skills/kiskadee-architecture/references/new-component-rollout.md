# New Component Rollout

Determine the requested platform and delivery scope first. For native components, follow the
corresponding platform's handoff in
[project-governance.md](../../../docs/definitions/project-governance.md) and its local definitions;
do not require React, Web Builder, or Web Showcase work for a native-only implementation.

For complete Web component delivery (for example `tabs`), validate the layers below. A request
limited to a schema, prototype, or analysis ends at that authorized boundary; identify the remaining
layers without implementing them or claiming full component delivery.

1. Schema/preset layer:
- Add the preset definitions using the component contract's element/variant/mode topology.
- Starting with one preset is valid; state any remaining preset coverage gaps.
- Confirm taxonomy usage (palettes/scales/decorations/effects).

2. Build artifacts layer:
- Confirm class maps/CSS artifacts generate for the component.
- Confirm any required metadata is published for showcase capability checks.

3. Headless layer:
- Implement behavior + accessibility primitives in `packages/headless/react`.
- Add unit tests for semantics, keyboard flow, and state transitions.

4. Visual component layer:
- Implement React visual wrapper in `packages/components/react` consuming class maps + headless API.
- Expose public exports/types.

5. Showcase layer:
- Add route/page and practical examples.
- Validate against manifest-driven capability behavior when applicable.

Generated artifacts prove token availability. Complete component delivery also requires the
requested platform's behavior, public API, and working showcase scenarios.
