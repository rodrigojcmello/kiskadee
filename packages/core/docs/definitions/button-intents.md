# Button intent contract

`ButtonIntentKeys` owns the system Button intent vocabulary: primary, neutral,
destructive, positive and optional support. A preset publishes only the intents
it supports through Layer 3 mappings, palettes and content-surface contexts.
Adding support to the vocabulary does not require any other preset to author it.

Support is a chromatic supporting action, not an emphasis level or an alias for
neutral. Primary identifies the main action; neutral allows supporting actions
without requiring a chromatic identity. Emphasis remains independently selectable.
Actual primitive families and state recipes belong to Presets, not Core or runtime.
The vocabulary does not require every neutral intent to be achromatic; Material's
choice of pure grayscale is preset-owned. External `brand.*` intents stay separate.

Consumers discover published support from component artifacts. Showcase displays
Support after the existing four examples when available. Progress, Badge and
other components do not inherit Button's intent vocabulary automatically.
