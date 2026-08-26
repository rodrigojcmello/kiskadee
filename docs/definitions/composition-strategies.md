# Composition Strategies

Status: canonical cross-package decision guide.

## Purpose and precedence

This document helps Kiskadee contributors choose the mechanism that best represents a concern
before designing its implementation. It routes decisions among established contracts; it does not
create a second source of authority for those contracts.

Use the following precedence:

1. [Project governance and responsibility](./project-governance.md) defines project authority,
   allowed inputs, published handoffs, and forbidden ownership.
2. The nearest domain definition defines the complete contract for a selected mechanism.
3. This guide helps select that mechanism and records why it fits.
4. Code and tests provide implementation evidence; they do not silently redefine the decision.

If this guide conflicts with a normative domain definition, resolve the conflict in the owning
definition before treating either interpretation as canonical.

## Strategies compose

Composition strategies are not mutually exclusive. One concern may require a public component, a
Headless primitive, Schema-authored DSPE values, generated artifacts, and platform structure at the
same time. Classify each responsibility separately and preserve one authority for each concern.

Two cautions apply throughout the decision:

- reuse across components does not automatically make something global; and
- rendering something inside another component does not automatically make it an internal slot.

The deciding factors are semantic identity, public use, data ownership, runtime behavior, and the
handoff required between projects.

## Decision sequence

Evaluate a proposal in this order:

1. Determine whether the concern has an independent semantic identity or public use.
2. Decide whether it is a new public component, composition of existing components, or anatomy of
   one existing component.
3. Separate behavior and accessibility from visual presentation.
4. Decide whether a presentation difference is a variant, mode, or component option.
5. Classify concrete visual values through the DSPE taxonomy.
6. Check whether repeated visual data is a serializable profile or catalog rather than duplicated
   component authorship.
7. Check whether an optional visual treatment is an Effect.
8. Use a Provider only for contextual runtime selection that cannot belong to serialized Schema.
9. Assign platform composition and rendering mechanics to the owning platform project.
10. Evaluate SEP, SUP, or CSC only when the Web artifact relationship requires one of them.
11. Keep inspection controls and scenarios in Showcase when no framework contract is required.
12. Recheck authority, handoffs, consumers, and validation before implementation.

## Strategy catalog

| Strategy | Use when | Do not use when |
| --- | --- | --- |
| Existing component composition | Public components already express the intended semantic entities and only need consumer-owned assembly. | The framework must guarantee new shared semantics, behavior, or anatomy. |
| New public component | The entity has independent meaning, public use, anatomy, or a stable accessibility contract. | The concern is only a style recipe, optional treatment, or internal part of one parent. |
| Compound slot and Schema element | A part exists only inside its parent and the parent owns its lifecycle and composition. | The part must also be instantiated and understood independently. |
| Variant or mode | One public component identity has a named presentation family or a meaningful presentation branch. | The difference is only one behavioral switch or one visual value. |
| Component option | The contract must choose which behavior, structure, or canonical mode is active. | The property answers what visual value the active mode uses. |
| DSPE on an element | A component element owns concrete decorations, scales, palettes, or effects. | The value is runtime behavior, platform mechanics, or a resource import. |
| Global profile or catalog | Consumers reference the same serializable visual recipe or limited shared catalog without sharing DOM or behavior. A complete source-backed recipe may begin with one consumer when its name and contract remain component-agnostic. | Reuse is merely speculative, the recipe is component-named or incomplete, or the concern requires a public entity. |
| Effect | A visual treatment is optional and additive without replacing semantic color or base geometry. | The content communicates independent information or is mandatory anatomy. |
| Headless primitive or hook | The concern owns semantics, native behavior, focus, keyboard flow, state, or accessible event composition. | It is purely visual or platform-specific layout. |
| Provider | A subtree needs contextual runtime selection of a non-serializable resource or integration. | Static design-system values can be authored in Schema or passed directly by the consumer. |
| Structural CSS or native platform mechanics | The concern is DOM/native composition, layout, flow, stacking, clipping, or rendering mechanics. | It would invent design tokens, semantic colors, or preset policy. |
| [Shared structural primitive](../../STRUCTURAL-CSS.md#shared-structural-primitive-namespace) | Repeated platform mechanics need one internal implementation but do not form a public component, Schema element, or Effect. | Component-scoped structure can express the ownership clearly. |
| SEP, SUP, or CSC | A Web concern needs a defined emission shape, utility projection, or complementary spacing composition. | Ordinary generated class consumption already attaches the authored value to its owner. |
| Showcase-only composition | The concern exists only to inspect, control, or demonstrate public framework behavior. | Applications need the behavior or presentation as a supported framework contract. |

## Distinguishing related strategies

### Component, slot, and profile

A component shares a public entity. A slot shares anatomy owned by a parent. A profile shares data.

Do not create a component merely to reuse paint, and do not reduce a public entity to a profile
because several host components render it. When a component uses a shared profile, the profile owns
the reusable recipe while the component still owns DOM, semantics, and composition.

### Variant, mode, and option

Use a variant for the primary public presentation family of one component identity. Use a mode for
a named presentation inside a variant when that second level is durable and meaningful. Use an
option for a behavioral or structural choice whose concrete values remain on participating Schema
elements.

Do not introduce a variant or mode solely because one scale value changes. Do not put numeric or
visual values directly in options.

### Profile and Effect

A profile is a reusable serializable recipe. An Effect is an optional additive treatment activated
by a component or element. A global Effect may contain profiles, but that does not turn every global
profile into an Effect.

### Provider and Schema

A Provider selects contextual runtime resources or integrations for a subtree. It must not become a
parallel transport for static tokens, preset values, or generated artifacts that already have a
Schema-to-platform handoff.

### Structural mechanics and authored values

Structural CSS and native component projects decide how participating values are composed on their
platform. Presets remain responsible for concrete design-system values. Platform structure may
consume emitted variables and classes but must not synthesize missing visual authorship.

For Web-specific artifact relationships, use the complete
[Schema-to-Web composition patterns](./schema-to-web-composition-patterns.md) definition before
introducing SEP, SUP, CSC, or another named mechanism.

## Decision questions for humans and AI

Answer these questions before proposing a contract:

1. Does the concern have independent meaning or a valid standalone use?
2. Must consumers instantiate, name, configure, or replace it directly?
3. Does it own semantics, focus, keyboard behavior, state, or accessible announcements?
4. Does it make sense only as anatomy of one parent component?
5. Is the difference still the same component identity with another presentation?
6. Does the decision choose an active behavior, or define the visual value used by that behavior?
7. Is the value a reusable, serializable recipe without DOM or behavior?
8. Is the treatment optional and additive?
9. Must a non-serializable runtime choice apply consistently to a subtree?
10. Is the problem only a platform layout, stacking, clipping, or rendering mechanic?
11. Does the Web Builder need a special emission or class-consumption relationship?
12. Does the need exist in the framework, or only in Showcase inspection?
13. Which project is the authority, what handoff does it publish, and which consumers validate it?

Stop for architecture review when the answer creates a new authority, a new cross-project handoff,
a Provider, a dependency-direction change, or a named composition mechanism. Do not resolve an
unclear owner through a local fallback.

## Naming a new strategy

Name a new composition strategy only when all of these conditions hold:

- the problem recurs beyond one local implementation;
- existing strategies cannot express it without losing a stable distinction;
- its eligibility and non-eligibility rules can be stated clearly;
- authority, transformers, consumers, and artifacts remain explicit; and
- at least one canonical implementation can validate the contract.

Record the full term in [Kiskadee Nomenclature](./nomenclature.md) only after the meaning is stable
across packages. Do not create an abbreviation merely to shorten discussion.

## Decision record

A durable architecture decision should record:

- the problem and observable use cases;
- the selected strategy or combination of strategies;
- why plausible alternatives were rejected;
- the authority, handoff, transformers, and consumers;
- public API, Schema, artifact, runtime, and platform impact;
- source-evidence requirements for official presets; and
- validation that proves the producer-to-consumer flow.

## Stable examples

- `global.typography.profiles` shares serializable text recipes; textual component elements retain
  ownership of their local geometry and consume those profiles.
- `global.separators.profiles` shares neutral line recipes; the public Separator component and
  internal component dividers do not share DOM.
- Activation Feedback is an optional shared Effect; components select a recipe and provide the host
  mechanics without re-authoring the global effect library.
- `tabs.options.tabWidth` selects a behavior while the participating Tabs element authors the
  fixed width value.
- The Icon Family Provider selects the effective family and variant for family-resolved icons in a
  subtree. `EssentialIconProvider` separately maps E-I concepts to `IconName`; neither moves preset
  recommendations or icon-size values out of Schema.
- Button connected-divider thickness uses SUP because another structural owner needs an existing
  token-only utility. Dropdown group-label spacing uses CSC because one element owns both additive
  spacing values.
- Badge is an independent Rest-only component because its metadata remains meaningful outside any
  one host. `Button.Badge` is a compound relation: Button `e7` owns an inline relation gap, while
  Structural CSS owns logical-corner overlays. Badge preserves its identity and does not inherit
  Button interaction states in either composition. An optional Badge shadow is a preset-authored
  static Effect, disabled by default; it does not make Badge interactive.
- Chip composes a primary content or selection control with an optional sibling Remove control.
  headless-react owns the non-nested interaction contract; p-react owns the Web structure; a nested
  Badge remains an independent passive component.
- Surface Context uses a Provider because independent descendants need a subtree-scoped semantic
  runtime input. Presets still author the serialized produced-surface map; the Provider does not
  replace Schema data.

## Related definitions

- [Project governance and responsibility](./project-governance.md)
- [Kiskadee Nomenclature](./nomenclature.md)
- [Schema-to-Web composition patterns](./schema-to-web-composition-patterns.md)
- [New Component Starting Definition](./new-component-starting-definition.md)
- [Schema, build artifacts, and runtime rules](../../SCHEMA-BUILD-RUNTIME-RULES.md)
- [Structural CSS](../../STRUCTURAL-CSS.md)
- [Global effects](./global-effects.md)
- [Icon consumption](./icon-consumption.md)
