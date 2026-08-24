# Schema Option Overrides

Schema options describe the design-system contract. React component props describe per-instance
consumer control. These are related but not equivalent APIs.

Do not expose a React prop just because an option exists in schema. Each schema option needs an
explicit API decision before it becomes overrideable at component usage sites.

Use a React prop when the option is safe and useful as an instance-level choice, for example:

- the option represents a supported component variant or mode that consumers intentionally choose;
- the option controls presentation that can vary by use case without weakening preset fidelity;
- the generated class map already contains the required branches for the selected design system.

Keep an option schema/context-only when it is preset fidelity or runtime tuning, for example:

- motion timing chosen to match a design system's geometry and perceived interaction speed;
- platform adaptation details that should stay consistent across all instances of that preset;
- options that would create unsupported visual combinations when changed per instance.

Current Switch decisions:

- `variant`, `mode`, and `radius` are public Switch props because consumers may choose supported
  generated branches per instance.
- `thumbShrink` is an optional Switch override for disabling the preset-provided
  `effects.thumbShrink` path per instance. `undefined` inherits the generated artifact behavior;
  `false` disables the effect for that instance. It does not synthesize a thumb-shrink effect when the
  selected design system does not emit one. The effect availability source is
  the Switch component artifact through `components/switch.kiskadee.json` and
  `effects.thumbShrink`; the class map is only used after that decision to resolve generated classes.
- `activationMotion` is not a public Switch prop. It is read from
  `options.activationMotion` in the generated Switch component artifact and applied
  consistently for the selected preset.
- `controlTextVisibility` is not a public Switch prop. Consumers may provide `controlText` content,
  but the selected design system decides whether that content is hidden, shown only on large
  viewports, or always shown through the generated Switch component artifact.

Current Button decisions:

- `iconLayout` and `iconPlacement` are public Button props because icon composition is a supported
  instance-level choice. Their defaults come from `components.button.options`.
- `iconLayout="inline"` centers icon and label as one group.
- `iconLayout="edge"` centers the label independently and pins the icon to the logical
  `leading` or `trailing` edge.

Current Dropdown decisions:

- `leadingIconComposition` and `selectedItemBackground` are public presentation overrides because
  applications may choose independently between one or two leading tracks and between a visible
  Selected background or ordinary Rest/Hover/Pressed backgrounds.
- The nearest collection override on `Dropdown.Items`, `ButtonMenu.Content`, or
  `ButtonMenu.SubContent` wins over Root/VisualProvider, which wins over the generated Dropdown
  options. Portability defaults apply only when all three sources omit a value.
- These options never change checked semantics. `selectedItemBackground` gates only the generated
  Selected `boxColor` rules for `e2 (dropdown-item)`, while `leadingIconComposition="selection-only"`
  omits only `e3 (dropdown-icon)` and its renderer.
- See [Dropdown Selection Presentation](dropdown/selection-presentation.md) for the complete matrix
  and presenter scope.

Current BottomSheet decisions:

- `groupSeparators` is a public BottomSheet presentation override. `undefined` inherits the
  generated BottomSheet option and the portability default is `true`.
- The option controls only whether automatic `e12` boundaries between adjacent typed groups are
  painted. It does not remove, merge, or otherwise change the semantic groups.
