# TextField Structural Color Contract

## Placeholder Color

TextField separates the three textual color roles across existing schema elements:

```txt
e2.textColor.* = label
e3.textColor.rest = placeholder
e4.textColor.* = input value
```

`e3` is still the control shell. Its `textColor.rest` is a narrow TextField-specific contract used
to carry the placeholder color for the control.

Do not author other `textColor` interaction states on `e3` for this purpose. The structural
TextField CSS only consumes the rest value:

- Standard modes apply it to the native input placeholder.
- Floating modes apply it to the label while it is temporarily acting as the resting placeholder.

This avoids introducing a separate `placeholderColor` property, avoids adding a placeholder-only
schema element, and avoids reusing `focus` or `readOnly` for a content-state role.
