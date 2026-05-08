# TextField Width Support

Status: rejected for now.

## Decision

`TextField` in `@kiskadee/react-components` should remain structurally full width.

We do not support a dedicated runtime prop, structural branch, or CSS mode to switch TextField width
 between `100%` and content-sized behavior.

## Context

The current React TextField implementation already behaves as a full-width field:

- all structural root branches (`e1`) use `inline-size: 100%` and `max-inline-size: 100%`;
- control shells (`e3`) also use `inline-size: 100%`;
- native inputs (`e4`) expand to `inline-size: 100%` with `min-inline-size: 0`;
- the public React props expose no width mode such as `auto`, `fit-content`, or `fullWidth`.

At the schema layer, the current contract still accepts `e1.scales.boxWidth`, and the Material 3
 Google preset currently provides `boxWidth` values for TextField roots. In practice, the
 structural component contract already communicates a different layout rule: TextField is expected
 to fill the available inline space of its parent container.

## Why Reject Width Modes

Buttons are often meaningfully content-sized because their label is the primary visible content and
 naturally defines the target width.

Text fields are different:

- they usually start empty, so there is no meaningful input content width to size against;
- the label is secondary and intentionally compact, so sizing the whole field from label width is
  not a good proxy for expected field width;
- consumer layouts typically decide field width from the surrounding form/grid/container, not from
  the field's own content;
- keeping TextField full width matches the simpler and more common expectation for form controls.

Supporting width modes today would add API, schema, and CSS/runtime cost without clear product
value:

- extra schema vocabulary and validation surface;
- extra runtime or structural branching to reconcile width strategies;
- more state combinations to validate across variants and modes;
- more documentation burden for a behavior we do not currently consider necessary.

## Practical Guidance

When a consumer needs a narrower TextField, size the parent layout container instead of adding a
TextField-specific width mode.

Examples:

- constrain the field with a grid/flex column;
- wrap it in a container with a fixed or clamped inline size;
- use layout composition to place multiple fields side by side.

## Follow-up

If future product demand appears, revisit this only with strong evidence that container-driven
layout is insufficient.

Any future reconsideration should start by resolving the existing schema-level `boxWidth` allowance
before adding a public width API to the React component.
