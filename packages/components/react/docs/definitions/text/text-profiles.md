# Text typography and foreground consumption

## Decision

`Text` renders independent application content with a typography profile and an optional
surface-relative foreground declared by the active design system:

```tsx
<Text as="h2" profile="heading-large" emphasis="high">
  Button
</Text>
```

The HTML element, typography profile, and foreground are independent. `as="h2"` owns document
semantics; `profile="heading-large"` owns visual typography; and the default
`foreground="neutral"` owns color relative to the current Surface Context. Omitted emphasis uses
`components.text.options.emphasis` from the current preset; Fluent 2 authors `high`. Explicit
emphasis always takes precedence, independently of the chosen typography profile.

## Artifact contract

The Web Builder preserves the atomic utility contract:

```text
one style key -> one CSS class
```

It does not create a selector for each profile. Instead, `global.kiskadee.json` publishes a compact
typography lookup at `classMap.text.e1.t`. Each value is a space-separated composition of the same
atomic classes already used by component slots.

Author-facing profile IDs remain readable in React. Core maps normalized IDs to stable compact
keys, while custom preset-local IDs use a deterministic `x-<profile-id>` key. The descriptive
`typography.kiskadee.json` records that bucket key for inspection, but `Text` never loads that lazy
artifact. Foreground profiles are expanded into the ordinary Text component class maps:

```text
text.e1.c.s.<foreground>.h|m|l|ll
text.e1.c.v.<foreground>.h|m|l|ll
```

The `t` bucket remains typography-only and the `c` bucket remains color-only. React resolves and
composes the two channels independently.

## Component boundary

`Text` owns:

- the selected typography profile;
- the required `neutral` foreground plus preset-supported named color-family profiles and
  `high | medium | low | lowest` strength;
- explicit or inherited Surface Context selection;
- the selected HTML element or class-forwarding component;
- native props, ARIA attributes, events, consumer classes, and ref forwarding;
- removal of native block margins through the structural `k-txt` class.

`Text` does not own:

- action semantics for chromatic foregrounds, spacing, truncation, or clamping;
- free size, family, weight, line-height, or tracking overrides;
- a default profile or a component scale;
- typography inside Button, Switch, Slider, Tabs, or TextField slots.

Component-owned labels continue resolving typography from their own generated class maps. A
standalone `Text` component is for page titles, paragraphs, captions, metadata, and other content
whose typography is not already owned by a parent component.

## Foreground API and Surface Context

The public foreground props are a discriminated union:

```ts
type TextForegroundFamily =
  | 'neutral'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'brown';

type TextForegroundName = TextForegroundFamily | `${Exclude<TextForegroundFamily, 'neutral'>}-deep`;

type TextForegroundProps =
  | {
      foreground?: TextForegroundName;
      emphasis?: 'high' | 'medium' | 'low' | 'lowest';
      surfaceContext?: 'onSubtle' | 'onVivid';
    }
  | {
      foreground: 'inherit';
      emphasis?: never;
      surfaceContext?: never;
    };
```

Resolution precedence is explicit prop, then the nearest `SurfaceContextProvider`, then
`onSubtle`. Text consumes that context and does not publish another Provider. A Card or another
surface-owning ancestor may publish the context produced by its content surface.

The chromatic values are visual family names, not Text intents. The unsuffixed name selects the
preset's local mapping to the family `standard` profile. A `-deep` suffix selects a local mapping to
that chromatic family's optional independent `deep` profile. Neutral has only Standard;
`neutral-deep` is excluded from the public API and Schema. A preset may publish any subset of those
capabilities, but unsuffixed `neutral` is always required. `black` is excluded because all
achromatic variation stays inside `neutral`. If the active preset does not publish the requested
family profile, Text inherits color; it does not fall back to `neutral` or from `deep` to
`standard`.

`foreground="inherit"` removes only the generated color class. Typography, polymorphic element,
native props, `className`, and ref forwarding are preserved. This escape hatch is React-only;
`inherit` is not a schema foreground profile.

## Missing artifacts and profiles

During a design-system transition, content remains rendered with inherited typography until the
matching global artifact arrives. The Showcase exposes global metadata only when it belongs to the
active preset, so `Text` never applies the previous preset's typography classes.

If the matching artifact exists but does not contain the requested profile, development builds emit
a warning and the content remains rendered with inherited typography. There is no silent fallback
to another profile.

The Text core artifact publishes `options.emphasis`; typography profiles contain no default
foreground choice. Other components keep selecting their own coordinates and do not consult this
option. Without a current default, omitted emphasis inherits color rather than selecting a runtime
constant or preserving the previous preset default. Explicit emphasis can still resolve a matching
color map.

The Text color class map is loaded independently. While a new preset, segment, or theme artifact is
pending, Text drops the previous color class and temporarily inherits color. A preset without a Text
color artifact also inherits silently. If the artifact exists but omits the requested `onVivid`
branch, the standard missing-context warning is emitted and color is inherited; Text never falls
back to `onSubtle`.

Split component class maps are resolved once per design-system, artifact-version, segment, theme,
and component cache key. Every Text instance subscribes to that shared resolution instead of
creating its own async state/effect pair; later subscribers consume an already resolved map
synchronously. `foreground="inherit"` does not subscribe or start a Text color-artifact load.
