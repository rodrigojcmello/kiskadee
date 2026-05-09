# TextField Visual Shell Focus Target

## Definition

`TextField.Control` is the visual shell of the field. It may be larger than the native `<input>`
because it owns structural padding, border, outline, and other layout affordances.

Users perceive that shell as part of the input. If an area looks like the field, clicking that
area should focus the real input.

## Native Behavior Gap

Browsers natively focus the field in two common cases:

- clicking the `<input>` itself;
- clicking a `<label>` associated with the input through `htmlFor`.

The padding owned by `TextField.Control` is neither of those things by default. Without explicit
focus handoff, that shell padding looks interactive but behaves like inert whitespace.

## Headless Contract

The TextField headless behavior is:

- `TextField.Label` keeps the native label-to-input behavior through `htmlFor`;
- `TextField.Input` remains the real form control and focus owner;
- `TextField.Control` forwards shell clicks to the input focus target;
- disabled text fields must not receive focus from the shell;
- read-only text fields may still receive focus, because users can select and copy their value.

## Implementation Note

The current implementation keeps the DOM composition unchanged:

- no wrapper `<label>` around the whole field;
- no `htmlFor` on non-label elements;
- no pointer or mouse-down special path;
- no descendant-selector policy inside the headless primitive.

`TextFieldRoot` stores an input ref in context, `TextFieldInput` assigns the real DOM node to that
ref, and `TextField.Control` focuses the input from its `onClick` handler when the control shell
receives a click.
