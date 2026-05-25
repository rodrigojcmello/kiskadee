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
- `activationMotion` is not a public Switch prop. It is read from
  `components.switch.options.activationMotion` in the generated global artifact and applied
  consistently for the selected preset.
- `controlTextVisibility` is not a public Switch prop. Consumers may provide `controlText` content,
  but the selected design system decides whether that content is hidden, shown only on large
  viewports, or always shown through `components.switch.options.controlTextVisibility`.
