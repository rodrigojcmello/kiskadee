# TextField Message Space

## Decision

TextField message space is collapsed by default and can be reserved explicitly by the consumer.

The public React API should use a boolean prop:

```ts
reserveMessageSpace?: boolean;
```

`undefined` and `false` keep the current behavior: when there is no `message`, the message slot does
not reserve block space. `true` reserves one visual line for the message slot even when no message is
currently rendered.

## Rationale

The TextField message element, `e5`, is useful in form flows where validation or helper text can
appear after interaction. If `e5` only enters layout when an error appears, every field below the
TextField shifts down. In vertical forms this layout drift is distracting because the user just
changed focus or submitted the form and the page moves under them.

The opposite default is also undesirable. Reserving message space for every TextField would add
unwanted lower whitespace to standalone inputs, search fields, compact filters, toolbar controls, and
inline-editing surfaces that do not need supporting text.

Because of that, message-space reservation is a contextual runtime decision, not a preset default.
The preset owns how `e5` looks; the consuming form owns whether a particular field should keep a
stable message lane.

## One-Line Reservation

Reserved message space should always reserve exactly one line.

Do not expose a line-count prop such as:

```tsx
messageReserveLines={2}
```

Reserving two, three, four, or five lines would create large permanent gaps between stacked fields.
That makes the form feel loose and less fluent, especially on mobile and dense data-entry screens.

One reserved line covers the common case: short validation and helper messages. If a real message
wraps to multiple lines, the layout may still grow. That remaining drift is acceptable because it is
caused by real content exceeding the reserved lane, not by the ordinary appearance of a short
message.

## Height Source

Do not calculate reserved message height in JavaScript.

`e5` does not need a `boxHeight` token to reserve space. The reserved height should come from the
computed line height of the `e5` element itself. In CSS this can be expressed as:

```scss
.k-txf-e5-a[data-reserved],
.k-txf-e5-b[data-reserved],
.k-txf-e5-c[data-reserved],
.k-txf-e5-d[data-reserved],
.k-txf-e5-e[data-reserved] {
  min-block-size: 1lh;
}
```

`1lh` uses the element's computed `line-height`. For presets such as Material Google, `e5` already
receives its text size and text height from schema typography scales. Existing message margins, such
as `marginTop`, should remain part of the real `e5` class so the reserved lane uses the same spacing
as an actual message.

## Rendering Contract

When `reserveMessageSpace` is false or omitted:

- no message content means the message element stays collapsed;
- this preserves today's compact behavior.

When `reserveMessageSpace` is true and there is no message content:

- render the `e5` element as an empty reserved slot;
- mark it as structural, not content;
- do not expose it as a described-by target;
- do not announce it to assistive technology.

The reserved empty element should be semantic-neutral:

```tsx
<p className={className} data-reserved="" aria-hidden="true" />
```

When there is real message content, render the existing accessible message semantics:

- include the message `id`;
- allow the input to reference it through `aria-describedby`;
- use `role="alert"` for error messages;
- use `aria-live="polite"` for warning messages.

Do not reserve space by rendering fake content such as `" "`, `&nbsp;`, or an empty string as a
message. Reservation is a layout concern and should be handled by structure and CSS, not by content
placeholders.

## Example

```tsx
<TextFieldStandardOutline
  label="Email"
  message={fieldState.error?.message}
  validationStatus={fieldState.error ? 'error' : undefined}
  reserveMessageSpace
/>
```

This keeps the form stable for the common one-line validation case while preserving compact TextField
behavior everywhere else.
