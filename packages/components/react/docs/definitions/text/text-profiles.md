# Text profile consumption

## Decision

`Text` renders independent application content with a typography profile declared by the active
design system:

```tsx
<Text as="h2" profile="heading-large">
  Button
</Text>
```

The HTML element and typography profile are independent. `as="h2"` owns document semantics;
`profile="heading-large"` owns visual typography.

## Artifact contract

The Web Builder preserves the atomic utility contract:

```text
one style key -> one CSS class
```

It does not create a selector for each profile. Instead, `global.kiskadee.json` publishes a compact
lookup at `classMap.text.e1.t`. Each value is a space-separated composition of the same atomic
classes already used by component slots.

Author-facing profile IDs remain readable in React. Core maps normalized IDs to stable compact
keys, while custom preset-local IDs use a deterministic `x-<profile-id>` key. The descriptive
`typography.kiskadee.json` records that bucket key for inspection, but `Text` never loads that lazy
artifact.

## Component boundary

`Text` owns:

- the selected typography profile;
- the selected HTML element or class-forwarding component;
- native props, ARIA attributes, events, consumer classes, and ref forwarding;
- removal of native block margins through the structural `k-txt` class.

`Text` does not own:

- color, intent, emphasis, spacing, truncation, or clamping;
- free size, family, weight, line-height, or tracking overrides;
- a default profile or a component scale;
- typography inside Button, Switch, Slider, Tabs, or TextField slots.

Component-owned labels continue resolving typography from their own generated class maps. A
standalone `Text` component is for page titles, paragraphs, captions, metadata, and other content
whose typography is not already owned by a parent component.

## Missing artifacts and profiles

During a design-system transition, content remains rendered with inherited typography until the
matching global artifact arrives. The Showcase exposes global metadata only when it belongs to the
active preset, so `Text` never applies the previous preset's classes.

If the matching artifact exists but does not contain the requested profile, development builds emit
a warning and the content remains rendered with inherited typography. There is no silent fallback
to another profile.
