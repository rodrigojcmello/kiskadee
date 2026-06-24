# TextField Width

## Decision

TextField width is owned by the parent layout container.

`TextField` in `@kiskadee/react-components` remains structurally full width: the root, control
shell, and native input fill the available inline size of the wrapper that contains them.

TextField root elements must not declare `scales.boxWidth`, and the public React API does not expose
a TextField-specific width mode.

## Rationale

TextField differs from Button. A Button can often size itself from its visible label, but a
TextField is an editable control whose useful width depends on the expected value and form layout.
An empty field does not provide a meaningful content width, and the label is not a reliable proxy
for values such as email addresses, zip codes, URLs, names, or addresses.

Because of that, TextField width should be decided by the surrounding form or layout composition:

- a grid column;
- a flex item;
- a fixed or clamped wrapper;
- a responsive form section.

## Contract

- TextField structural CSS keeps root, control, and input at `inline-size: 100%`.
- Presets must not emit TextField root `boxWidth` classes.
- Runtime does not switch between container width and schema width.
- Consumers that need a narrower or wider field should size the wrapper.

## Example

```tsx
<div style={{ inlineSize: 320, maxInlineSize: '100%' }}>
  <TextFieldStandardOutline label="Email" />
</div>
```

```scss
.emailField {
  inline-size: min(100%, 360px);
}

.zipField {
  inline-size: min(100%, 160px);
}
```

## Future Reconsideration

If a real product need appears, revisit this as an explicit width ownership feature. Do not reuse
generic `e1.scales.boxWidth` as an always-on root width. A future proposal should define a public
mode, the schema value it consumes, and how it avoids mobile or card overflow.
