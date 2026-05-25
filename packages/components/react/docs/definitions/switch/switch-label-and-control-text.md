# Switch Label And Control Text

`Switch.label` is the control name. It answers what the switch controls, such as
`Notifications`, `Bluetooth`, or `Airplane mode`.

`Switch.controlText` is the optional visual representation of the binary value.
It answers what the current `controlState` means, such as `On` / `Off` or
`Enabled` / `Disabled`.

These concepts must stay separate:

- `label` participates in the control naming model.
- `controlState` is the persistent boolean value.
- `controlText` is visual state text derived from `controlState`.

The styled React Switch groups `controlText` and the visual track in an
internal structural wrapper so row layouts can align the control name on one
side and the whole control affordance on the other. That wrapper is not part of
the headless Switch API and is not a schema element; it is React structural DOM
owned by `@kiskadee/react-components`.

The styled React Switch accepts `controlText` as content:

```tsx
<Switch
  label="Bluetooth"
  controlState
  controlText={{
    on: 'On',
    off: 'Off'
  }}
/>
```

Providing `controlText` does not guarantee that it is visible. Visibility is a
design-system policy controlled by `components.switch.options.controlTextVisibility`.

Supported visibility values:

- `none`: do not show control text.
- `largeOnly`: show control text only on large web viewports.
- `always`: always show control text when provided.

The default is `none`. Presets should opt in only when the design language
expects explicit on/off text, such as desktop settings patterns.

Do not use `label` to build a compound label plus description block. Supporting
text belongs in a higher-level composition such as `SwitchField` or
`SettingRow`, while the primitive Switch keeps only the control name and optional
control-state text.
