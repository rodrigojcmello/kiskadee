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
- clicks on passive content inside the shell also focus the input;
- native controls, links, editable content, focusable descendants, and interactive ARIA roles retain
  their own activation and focus behavior, including clicks on their nested artwork or text;
- an internal action does not project input focus; only the native input owns that focus state;
- clicks from portalled content do not trigger shell focus handoff through React event bubbling;
- a consumer's prevented click does not trigger shell focus handoff;
- disabled text fields must not receive focus from the shell;
- read-only text fields may still receive focus, because users can select and copy their value.

## Implementation Note

Focus delegation preserves the native DOM semantics:

- no wrapper `<label>` around the whole field;
- no `htmlFor` on non-label elements;
- no pointer or mouse-down focus handoff.

`TextFieldRoot` stores an input ref in context, `TextFieldInput` assigns the real DOM node to that
ref, and `TextField.Control` focuses the input from its `onClick` handler when the control shell
receives a passive click. The handoff excludes interactive descendants rather than requiring each
composed action to cancel event propagation. Internal actions remain sibling controls with their
own semantics; the shell does not become an additional keyboard stop or a focus group.

Root and Control expose `data-text-field-root` and `data-text-field-control` respectively. Styled
adapters can identify their actual owners when an optional composition row wraps the shell and a
connected action. An extra layout wrapper does not become the input's state or focus owner.

## Pointer state ownership

The root exposes semantic `hovered` and `pressed` state through state projection and data attributes.
Hover follows the control shell's pointer bounds for mouse and pen, excluding portalled content.
A connected action outside that shell does not hover or press the field, even when it shares the
same Root. Moving between the shell and that action updates hover without requiring a Root exit.
Touch does not retain hover. Disabled and read-only fields suppress both transient states.

Pressed starts only from the primary pointer's main button on the input, control shell, or passive
content inside the shell. Independent controls and their artwork do not press the field. Their
Space/Enter keyboard activation also remains their own interaction; typing or submitting from the
native input does not synthesize field pressing.

Pointer release, cancellation, leaving the shell, moving focus to another control, window blur, and
terminal-state changes clear the active field gesture. A matching pointer release is also observed
outside the root. Pointer handling does not capture the pointer or prevent native selection and
editing. A passive click can temporarily move focus away from the input before the existing click
handoff restores it; that intermediate blur does not cancel the shell's pointer gesture.

The styled adapter projects the existing Hover/Pressed classes instead of enabling native pseudos
on the root. This prevents an internal action's ancestral `:active` match from changing field paint,
effects, or indicator geometry. Input focus and focus-visible projection retain their existing owner.
