# Sandbox Preset

The `sandbox` preset is an internal Kiskadee test preset, not an adaptation of a real design
system.

Use it when a schema needs freedom to exercise framework behavior without the fidelity burden of an
official preset such as Material, Fluent, Carbon, or iOS. Values in this preset may be changed,
expanded, reduced, or replaced whenever that helps a test or exploratory workflow.

Durable expectations:

- do not treat `sandbox` values as design-system reference data;
- keep it valid against the same schema, builder, runtime, and Showcase contracts as official
  presets;
- prefer focused component additions, starting with only the component needed by the current work;
- document any new long-lived sandbox convention here instead of hiding it in temporary handoffs.

Current component scope:

- Switch only.
