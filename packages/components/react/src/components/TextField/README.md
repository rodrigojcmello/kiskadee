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

The Notched input hides its native placeholder while the resting label occupies that prompt lane.
After focus promotes the label, an explicit native placeholder may supply the supplementary hint.

This avoids introducing a separate `placeholderColor` property, avoids adding a placeholder-only
schema element, and avoids reusing `focus` or `readOnly` for a content-state role.

## Internal Content

All TextField modes accept logical `startContent` and `endContent`. Compose passive parts with
`TextFieldIcon` and `TextFieldText`, and use the existing Button for actions. The field's
`startContentEmphasis` and `endContentEmphasis` independently select `lowest` (default, plain) or
`medium` (a full-height lateral surface and separator). The helpers keep their geometry and do not
paint individual frames.

```tsx
<TextFieldStandardOutline
  label="Secure reference"
  defaultValue="REF-0012"
  size="md"
  startContentEmphasis="medium"
  startContent={
    <>
      <TextFieldIcon>
        <FamilyResolvedIcon name="lock" />
      </TextFieldIcon>
      <TextFieldText dir="ltr" aria-hidden="true">ID</TextFieldText>
    </>
  }
  endContent={({ disabled }) => (
    <TextFieldAction>
      <Button type="button" size="sm" emphasis="lowest" disabled={disabled}>
        <Button.Label>Details</Button.Label>
      </Button>
    </TextFieldAction>
  )}
/>
```

Import the field and content helpers from `@kiskadee/react-components/text-field`, Button from
`@kiskadee/react-components/button`, and FamilyResolvedIcon from `@kiskadee/react-components/icon`.
The consumer supplies custom action handlers. Disable value-changing actions for `disabled || readOnly`;
consultation actions such as Details or password reveal may remain available under `readOnly`.
Button intent, emphasis, size, and radius remain independent from the field and passive helpers.

`TextFieldAction` provides uniform outer clearance for one isolated internal Button. Mixed content
and multiple actions remain free composition, without that optical spacing guarantee. One
persistent input lane consumes the field's block padding; lateral actions do not receive a second
copy. A native action that fits the inner control keeps the same input-only height. Truly
oversized content may grow the control to contain its native box and the field's borders.
The Medium-field toggle verified 32px Standard controls, 40px Notched, and approximately 46px
Inside with and without a 28px Small Button, retaining the same input node. The measured floating
line center accounts for the input's own padding when reserving label clearance.
`connectedEndAction={({ disabled, readOnly, className }) => ...}` instead places a native Button at
logical end outside the input control; attach its supplied class to the Button. This relation is
local to TextField and does not stretch Button or introduce Button.Group or generic Select groups.

Fluent 2 authors the region treatments. Its Small and Medium Buttons both use 20px icons while
retaining distinct control dimensions. Internal examples pair Medium fields with Small Buttons
and Large fields with Medium Buttons. Standard Small has no fitting native action size and
demonstrates genuine oversized content without hiding its action.

Connected examples retain Standard's equal-size pairings and use Button Large for Floating Medium,
Button Large 2 for Floating Large. These external connected choices do not promise
equal intrinsic heights: the current Chrome observation matches exactly only for Standard Medium.
The contract below records the internal-toggle measurements, supported connected pairings, and
their visible height differences.
The composition introduces no Button sizes or general radius compensation.
Other presets may omit this optional anatomy.

## Built-in clear and password visibility

`clearAction` supplies the existing Button for clearing a nonempty editable value. It is absent
when the value is empty or the field is disabled/read-only. Uncontrolled fields use `defaultValue`;
controlled fields keep `value` in the consumer and accept the clear through `onValueChange('')`.

```tsx
<TextFieldStandardOutline
  label="Search"
  value={query}
  onValueChange={setQuery}
  clearAction={{
    icon: <MyClearIcon />,
    label: 'Clear search',
    clearedAnnouncement: 'Search cleared.'
  }}
/>
```

`visibilityToggle` is an explicit opt-in for `inputProps.type="password"`. It switches the same
input between masked and visible text, preserving its value and selection. Read-only fields can
still reveal their value; disabled fields cannot activate the toggle.

```tsx
<TextFieldStandardOutline
  label="Password"
  defaultValue="Example password"
  inputProps={{ type: 'password' }}
  visibilityToggle={{
    presentation: 'text',
    showText: 'Show',
    hideText: 'Hide',
    showLabel: 'Show password',
    hideLabel: 'Hide password'
  }}
/>
```

For icon presentation, use `presentation: 'icon'`, `showIcon`, and `hideIcon` instead of
`showText`/`hideText`. All artwork properties accept React nodes, including custom SVG or an icon
component; no icon family or canonical name is required. The consumer must supply localized
accessible labels, visible text when applicable, and `clearedAnnouncement`. Clear confirmations
use a polite, visually hidden status without adding visible feedback or changing field geometry.

Both actions use an unchanged Button Small by default; `size` selects another existing Button
size without automatic resizing. They append to the logical end region after optional
`endContent`; custom content and both actions can coexist. Multiple children retain the mixed-flow
contract rather than the isolated-action lateral-spacing guarantee.

See [TextField internal content](../../../docs/definitions/text-field/text-field-content.md) for the
anatomy, intent, surface, and composition contract, and
[bidirectional layout](../../../../../../docs/definitions/bidirectional-layout.md) for LTR/RTL.
