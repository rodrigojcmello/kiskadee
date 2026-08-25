# Badge, Chip, and Surface Context Contract

Status: canonical cross-package definition.

This document defines Badge, Chip, their composition with Button, and the semantic surface context
used by independent nested components.

## Component identity

Meaning and behavior determine component identity; visual complexity does not.

| Component | Represents | Interaction ownership |
| --- | --- | --- |
| Badge | Passive metadata as a dot, short text/number, or icon-only Mark | None |
| Chip | An entity, filter, choice, or removable value | Selection and/or removal |
| Button | A command or navigation action | Activation |

Badge is adjectival metadata such as `new`, `12`, or an icon-only verified mark. Chip is a represented
noun or value such as `Marketing`, `Brazil`, or `Active`. Button is a verb or command such as
`Save`, `Open`, or `Add`.

Kiskadee uses **Chip** as the canonical name for the entity, filter, and token family. There is no
separate Tag component.

## Badge

Badge is an independent passive component whose visual state contract is Rest-only. Rest-only
limits interaction states; it does not limit theme, segment, surface context, intent, emphasis,
scale, radius, or data updates.

Badge supports exactly three public anatomies:

- the root accepts one `string` or `number`;
- `Badge.Dot` is content-free and always uses filled/high presentation;
- `Badge.Mark` accepts exactly one Consumer-provided Icon (CP-I).

`Badge.Icon`, `Badge.Label`, and `Badge.Count` do not exist. Icon-plus-label compositions belong to
Chip. A contained Mark uses an authored pill surface with a smaller icon and supports all four
emphases. A full-bleed Mark has no authored background, border, or padding; its artwork fills the
viewport, may be bi-color, and uses the strong intent color without an emphasis option. Icon-only
meaning requires an accessible description on Badge or its associated host.

Text Badge supports `square`, `rounded`, and `pill`; Dot and Mark are forced to `pill`. All three
indicator anatomies support the six Badge scales. `attention` is the portability default intent.
The public intents are `neutral`, `primary`, `novelty`, `positive`, `warning`, and `attention`.

Badge optionally owns a `separation="ring"` outline for overlays. The ring is a distinct visual
owner: its color, width, and radius are Schema-owned, while Structural CSS owns only positioning and
negative inset. If the ring element is absent or unresolved, the complete ring is omitted without a
fallback. Button.Badge never owns this visual treatment.

The initial Badge contract rejects Hover, Pressed, Focus, Selected, Disabled, Pending, Read-only,
Filled, and Effects. A Badge nested in Button or Chip remains in Rest and does not inherit the
host's interaction activators.

### Disabled-host gap

A disabled host does not automatically disable passive metadata. Badge therefore remains visible,
colorful, and in Rest when its Button, Chip, or another host is disabled. The consumer may omit it
explicitly when a product requirement calls for that behavior.

This creates a known visual-consistency gap: a vivid Badge can remain prominent over a muted host.
The first contract preserves information instead of adding interactive semantics to Badge. Revisit
host-state projection only after multiple presets and real host compositions prove the need; never
infer host state from arbitrary DOM ancestry.

## Chip

Chip represents an entity or value. Its supported compositions are:

| Composition | Meaning |
| --- | --- |
| `Chip.Content` | Static value |
| `Chip.Select` | Individually selectable value |
| `Chip.Content + Chip.Remove` | Removable value |
| `Chip.Select + Chip.Remove` | Selectable and removable value |

Exactly one of `Chip.Content` and `Chip.Select` is required. They are mutually exclusive.
`Chip.Remove` is a sibling native button, requires an accessible name, and never toggles selection.
Removal does not update consumer data automatically. Root `disabled` disables both interactive
targets. This composition never produces a button inside another button.

`Chip.Icon` is CP-I. `Chip.Remove` consumes the `close` Essential Icon (E-I), with explicit children
as an override. When neither is available, the entire Remove affordance is omitted and p-react emits
a development warning. `Chip.Badge` is valid only inside `Chip.Content` or `Chip.Select`; it owns
only the Schema-authored relation spacing. The nested Badge preserves its own identity and Rest
state.

Chip does not provide a generic command-only mode. Compact actions remain Button. Chip group
selection semantics are outside the individual Chip contract.

## Badge in Button

`Button.Badge` composes an independent Badge in one of two relations:

- `inline-start` and `inline-end` stay adjacent to the Button label. Button `e7`
  (`button-badge-relation`) owns only the logical gap; Structural CSS groups the relation with the
  label.
- the four block/inline corner combinations are external overlays. Structural CSS owns their
  logical anchoring and displacement relative to the rendered Badge size.

The wrapper is non-interactive, has no pointer events, and does not project Button interaction
states onto Badge. Logical positions work in both LTR and RTL. Button establishes an unclipped
containing block only for external overlays. Badge remains visible and in Rest when Button is
disabled. If an active preset omits `e7`, inline Button Badges are omitted as one unsupported
relation; external placement remains available.

## Surface Context

Independent nested components must consume the semantic surface on which they render without
inferring concrete colors, class names, luminance, or DOM ancestry.

Two concepts remain distinct:

- `surfaceContext` is the surrounding semantic surface consumed by a component;
- `contentSurfaceContext` is the semantic surface a component produces for independent descendants.

The p-react resolution order is:

```text
explicit surfaceContext prop
  -> nearest SurfaceContextProvider
  -> onSubtle portability default
```

The serialized output map is indexed by segment, theme, consumed surface, intent, and emphasis. Its
sparse state precedence is `disabled > pending > selected > rest`. A missing state inherits `rest`;
a missing map branch preserves the consumed context; explicit `inherit` also preserves it.
Unsupported `onVivid` palette authorship remains unsupported and must not fall back to `onSubtle`.

Only components that create a semantic descendant surface publish a Provider. Button and Chip
publish their produced surface. Card publishes its authored content surface. Portaled Dropdown and
BottomSheet surfaces reset descendants to `onSubtle` instead of inheriting the trigger's surface.

## Project ownership

- Core owns component names, intent vocabulary, visual grammar, and serialized surface metadata.
- Presets own concrete Badge and Chip values and authored descendant surface outputs.
- Web Builder lowers contracts into Web class maps, manifests, and metadata artifacts.
- headless-react owns Chip selection, removal, keyboard, and accessible compound behavior.
- p-react owns public composition, Structural CSS, Surface Context runtime, and generated classes.
- Showcase consumes public APIs and validates availability and behavior.

## Source scope

The first implementation is Web-only and authored only by `fluent-2-microsoft`. The Fluent Badge
and Tag sources establish the visual starting point. Kiskadee extensions and adaptations are
identified in the preset evidence documents. Other presets remain explicitly unavailable.

## Related definitions

- [Kiskadee Nomenclature](./nomenclature.md)
- [Composition Strategies](./composition-strategies.md)
- [Project Governance and Responsibility](./project-governance.md)
- [Badge in p-react](../../packages/components/react/docs/definitions/badge/badge.md)
- [Chip in p-react](../../packages/components/react/docs/definitions/chip/chip.md)
- [Surface Context in p-react](../../packages/components/react/docs/definitions/surface-context.md)
