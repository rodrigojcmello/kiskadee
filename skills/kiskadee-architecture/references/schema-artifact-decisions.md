# Schema And Artifact Decisions

Use these rules before proposing a schema or builder change:

1. If the change answers "which behavior/mode is active?", prefer `components.<name>.options`.
2. If the change answers "what is the value for that behavior?", prefer the relevant element
   `scales/decorations/palettes/effects`.
3. If the value is always-on once generated, the generic artifact bucket is usually enough.
4. If the value is conditionally applied to its normal schema element, check whether the existing
   component artifact contract already provides the required opt-in bucket.
5. If one already emitted token-only scale utility must instead be applied to a different structural
   owner, apply the Structural Utility Projection Registry eligibility test.

Current example and future candidate:

- Button divider thickness projects optional `Button.e6.boxWidth` to `Button.e1.p.gd` with
  `retainSource: true`; Button.Group activates it only with an authored divider.
- Dropdown projects only `e3/e10` width-gap utilities to their empty independent-track nodes; normal
  icon and selection slots retain their source references.
- Tabs fixed width may eventually migrate from its specialized `w` bucket to the generic `p`
  contract.

Do not register the Tabs candidate without a separate implementation and validation task.

