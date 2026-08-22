# Project Governance and Responsibility

Status: canonical cross-project definition.

This document defines authority, responsibility, and handoff boundaries between Kiskadee projects.
It answers not only where code currently lives, but which project may define a decision, which
projects may transform or consume it, and which downstream layers must not redefine it.

## Scope and precedence

Use this document as the source of truth for cross-project ownership.

The documentation hierarchy is:

1. This document defines authority and handoffs between projects.
2. Domain definitions refine a concern inside those boundaries, such as
   `SCHEMA-BUILD-RUNTIME-RULES.md`, `STRUCTURAL-CSS.md`, icon consumption, or native runtime rules.
3. Project READMEs describe local implementation, usage, and validation.
4. Skills apply and verify the documented rules; they do not create a competing architecture.
5. Code and tests provide implementation evidence but do not silently replace a documented durable
   contract.

If two documents conflict about project authority, resolve the conflict here before treating either
interpretation as canonical.

## Governance vocabulary

- **Authority**: the project that defines the canonical meaning or contract for a concern. Authority
  is exclusive unless this document explicitly splits the concern.
- **Responsibility**: work a project must perform to implement or validate a concern. Multiple
  projects may have responsibilities without sharing authority.
- **Consumer**: a project that selects, composes, renders, validates, or otherwise uses an upstream
  public contract or artifact.
- **Handoff**: the documented public contract, generated artifact, payload, or adapter output passed
  from an authority or transformer to a consumer.
- **Derived representation**: output mechanically produced from an authority, such as generated CSS,
  a class map, or a reduced native payload. It is not a new source of truth.
- **Project boundary**: a governed implementation root listed below. An organizational parent such
  as `packages/components` does not merge the authority of its platform projects.

An import, dependency, fixture, copied artifact, or local implementation does not transfer authority
to the consuming project.

## Repository-governance surfaces

Cross-project definitions, root architecture documents, `AGENTS.md`, `CHAT-CONTEXT.md`, and
`skills/**` are repository-governance surfaces, not implementation projects.

- The nearest normative definition owns the documented rule. This document owns cross-project
  authority and handoffs.
- Domain definitions may refine the rule within its documented scope.
- Overview and bootstrap documents summarize and route readers to normative definitions.
- Skills operationalize and verify those definitions.

The directory containing a governance surface does not grant it product or implementation
authority. Derived summaries and skills must remain consistent with the normative definition they
consume. A change to this document that alters a project's authority, inputs, handoff, prohibited
ownership, or dependency direction is an architecture-contract change and requires architecture
review.

## Cross-project invariants

1. One concern has one documented authority.
2. Consumers may select, adapt, compose, render, and validate upstream meaning. They must not
   reconstruct, infer, repair, duplicate, or replace that meaning locally.
3. Builders transform authoritative input. They must not invent missing design-system semantics or
   silently repair an invalid upstream contract.
4. Generated outputs and copied fixtures never become authoring sources.
5. Missing capability does not authorize a local fallback or parallel contract. It requires an
   explicit upstream change or a documented consumer-owned behavior.
6. Platform adapters may change mechanics required by their host platform while preserving the
   canonical visual and semantic meaning.
7. Showcase code proves consumption and supports inspection. A Showcase-only implementation is not
   automatically a framework contract.
8. Cross-project edits are not governance violations by themselves. A valid change often updates an
   authority, transformer, and consumers together.
9. New authority, a new handoff, or a reversed dependency direction requires an architecture
   decision and documentation in the same delivery.
10. Repository-governance surfaces must preserve the documentation precedence above and must not
    create a second source of architectural truth.

## Contract and visual-identity projects

### `packages/core`

- **Authority:** platform-agnostic Schema shape, validated types and Zod contracts, shared
  identifiers, DSPE taxonomy, and framework-agnostic utilities.
- **Consumes/adapts:** general-purpose libraries that do not carry Kiskadee preset, platform, or
  rendering policy.
- **Produces:** public contracts and serialization grammar used by presets, builders, runtimes, and
  component implementations.
- **Must not own:** concrete design-system instances, source-derived preset decisions, CSS or native
  layout, generated artifact policy, resource loading, or platform component behavior.

### `packages/presets`

- **Authority:** official design-system instances, source-evidence interpretation, concrete Schema
  values, preset recommendations, and preset-owned projection formulas or build-extension
  declarations.
- **Consumes/adapts:** Core contracts, approved source evidence, and shared deterministic generation
  utilities where a preset needs them.
- **Produces:** validated preset modules and schemas for builders and direct Schema consumers.
- **Must not own:** the cross-platform Schema grammar, resource loading, Web or native rendering,
  generated artifact formats, or component runtime behavior.

### `packages/tonal-scale`

- **Authority:** deterministic tonal-family mathematics, generator versions, curve contracts, and
  standalone tonal output formats.
- **Consumes/adapts:** platform-neutral color primitives and generator inputs.
- **Produces:** tonal families and generator APIs consumed by presets, Brands, Runtime, and
  builders, plus its dedicated inspection UI for validating generator output.
- **Must not own:** semantic color aliases, preset identity, third-party brand identity, component
  palette recipes, or component/platform rendering outside that generator-inspection surface.

### `packages/brands`

- **Authority:** third-party brand seed identity, provenance, portable tonal assets, and optional
  pack membership.
- **Consumes/adapts:** Tonal Scale output and platform-neutral contracts needed to describe portable
  brand assets.
- **Produces:** brand definitions and packs consumed by preset-owned projectors, Web Builder,
  `p-react`, Showcase, and applications at explicit resource boundaries.
- **Must not own:** preset primitive or semantic colors, preset component projection formulas,
  component UI, runtime loading policy, or icon/logo geometry owned by the icon catalog.

## Resource projects

### `packages/fonts`

- **Authority:** opt-in online font-provider adapters, the public integration catalog, and selected
  family preparation or loading mechanics.
- **Consumes/adapts:** preset family recommendations and Runtime's font-family descriptor and
  preparation contracts without changing their meaning.
- **Produces:** explicit provider integrations consumed by applications such as Showcase.
- **Must not own:** which family or typography profile a preset recommends, Schema mutation, host
  application selection, or redistributed font binaries.

### `packages/icons`

- **Authority:** canonical icon names, SVG assets, family mappings, source metadata, RTL metadata,
  generated platform adapters, and the limited E-I concept contract/default map.
- **Consumes/adapts:** approved upstream icon-family sources during generation.
- **Produces:** raw and platform-specific icon exports plus interface contracts consumed by platform
  components and applications.
- **Must not own:** React provider/context state, component slot layout or color, effective family
  selection, or the CP-I chosen by an application.

## Build and execution projects

### `packages/css-build`

- **Authority:** shared PostCSS processing mechanics such as prefixing, media-query combination, and
  minification.
- **Consumes/adapts:** CSS text and explicit processing options.
- **Produces:** deterministic processed CSS for Web-facing builders and packages.
- **Must not own:** Schema interpretation, Style Keys, Style Emission Policy, design-system values,
  component structure, or artifact orchestration.

### `packages/web-builder`

- **Authority:** Schema-to-Web lowering, Style Keys, Style Emission Policy, deduplication, CSS and
  class-map generation, manifest/metadata formats, and Showcase artifact sync/generation.
- **Consumes/adapts:** Core contracts, preset instances, and documented optional extensions from
  Tonal Scale or Brands.
- **Produces:** generated Web CSS, JSON class maps, manifests, metadata, and registries consumed by
  `p-react` and Showcase.
- **Must not own:** design-system values, preset interpretation, DOM/layout, headless interaction,
  browser selection state, or component rendering.

### `packages/runtime` (`@kiskadee/runtime`)

- **Authority:** shared browser runtime infrastructure: dynamic color calculation/injection,
  platform detection/classes, and inert registration plus explicit preparation orchestration for
  selected font resources.
- **Consumes/adapts:** Core contracts, Tonal Scale APIs, and explicit application configuration.
- **Produces:** browser runtime APIs, injected variables, preparation state, and platform classes
  consumed by Web applications and `p-react`.
- **Must not own:** preset values, generated class-map policy, component semantics, DOM/layout, or
  arbitrary runtime replacements for missing Schema decisions.

The **runtime execution layer** is a broader phase that includes work performed by `p-react`,
Headless React, and applications. References to that phase do not transfer their responsibilities to
the `@kiskadee/runtime` project.

## Behavior and platform component projects

### `packages/headless/react` (`headless-react`)

- **Authority:** unstyled React behavior, state machines, keyboard and focus behavior, semantics,
  accessibility, and browser structure that is technically required for those behaviors.
- **Consumes/adapts:** platform-neutral public contracts and behavior-focused browser primitives.
- **Produces:** headless React primitives, hooks, props, and state contracts consumed primarily by
  `p-react` and advanced React consumers.
- **Must not own:** design-system appearance, preset values, visual class maps, structural styling,
  icon artwork, or Showcase-specific orchestration.

### `packages/components/react` (`p-react`)

- **Authority:** public visual React composition, component DOM, structural Sass, React presentation
  providers, and the bridge between Headless React, Runtime, generated Web artifacts, and resources.
- **Consumes/adapts:** public outputs from Core, Headless React, Web Builder, Runtime, Brands, and
  Icons.
- **Produces:** styled React component APIs, types, JavaScript, and CSS consumed by Web applications
  and Showcase.
- **Must not own:** concrete preset values, Schema grammar, Web generation policy, duplicated
  headless semantics, or reusable framework behavior that exists only to satisfy Showcase.

### `packages/components/android` (`p-android`)

- **Authority:** Android loader/resolver mechanics, Jetpack Compose components, native interaction
  and accessibility, Android platform adaptation, and its local Android showcase application.
- **Consumes/adapts:** canonical Schema or derived native payloads plus portable resources.
- **Produces:** the reusable Android component library and Android validation application.
- **Must not own:** an Android-specific design-system Schema, fixture values as authority, Web
  artifacts or assumptions, or hardcoded replacements for design-system values.

### `packages/components/ios` (`p-ios`)

- **Authority:** iOS loader/resolver mechanics, SwiftUI components, native interaction and
  accessibility, iOS platform adaptation, and its local iOS showcase application.
- **Consumes/adapts:** canonical Schema or derived native payloads plus portable resources.
- **Produces:** the reusable iOS component library and iOS validation application.
- **Must not own:** an iOS-specific design-system Schema, fixture values as authority, Web artifacts
  or assumptions, or hardcoded replacements for design-system values.

`packages/components` is an organizational root, not one implementation authority. Cross-platform
component rules may live in its documentation, while each platform project owns its implementation.

## Inspection project

### `packages/showcase` (Showcase)

- **Authority:** the Next.js inspection application, demonstrations, scenario composition, viewer
  controls, consumer integration examples, and Web visual-validation surfaces.
- **Consumes/adapts:** public package APIs and artifacts synchronized by Web Builder.
- **Produces:** inspection routes and evidence that real consumer scenarios work.
- **Must not own:** reusable framework contracts, Schema or preset values, generated artifacts,
  component fixes, or fallback behavior that masks a missing upstream capability.

The local applications under `p-android` and `p-ios` may also be named showcase, but **Showcase** as
a canonical project name refers only to `packages/showcase`.

## Canonical handoffs

### Visual contract

```text
Core contract -> preset instance -> builder or direct platform consumer
```

Presets instantiate Core. They do not extend the grammar locally. Builders and platforms consume a
validated instance; they do not repair its meaning.

### Web

```text
Core + Presets -> Web Builder -> generated artifacts -> p-react -> Showcase/application
Headless React ---------------------------------------> p-react
Runtime + Fonts + Icons + optional Brands ----------> p-react/application
```

Web Builder owns transformation, `p-react` owns visual DOM composition, Headless React owns
behavior/accessibility, and Showcase owns inspection.

### Native

```text
canonical Schema or derived payload -> native loader -> resolver -> native component -> local showcase
```

A derived payload may narrow data for a platform but must remain reproducible from the canonical
Schema. Native mechanics may diverge; design-system meaning may not.

### Optional resources

```text
Tonal Scale -> Brands -> preset-owned projection -> Web Builder -> explicit resource boundary
preset font recommendation -> Fonts integration -> application selection/loading
Icons catalog -> platform adapter/provider -> component or application composition
```

Optional resources remain explicit. Their absence must not cause a downstream project to invent a
replacement contract.

## Governance change protocol

For every durable cross-project change:

1. Identify the concern and its current authority.
2. Identify every transformer and consumer affected by the same concern.
3. Change the authoritative contract first or in the same delivery as downstream adaptations.
4. Validate the published handoff, not only private implementation details.
5. Update this document when authority, allowed inputs, published output, or dependency direction
   changes.
6. If no documented authority exists, make an architecture decision before implementation.

A governance finding in code review requires all of the following:

- changed code or a required companion change;
- a cited normative rule and documented authority;
- confirmation of the current producer-to-consumer flow; and
- a concrete consequence such as duplicated sources, semantic drift, inverted dependency, manual
  generation, or a broken handoff.

Architectural preference without a rule and concrete consequence is not a governance finding.
Document ambiguity as a governance gap instead of accusing the implementation speculatively.

## Related definitions

- [Project purpose](../../PROJECT-PURPOSE.md) provides product context and a concise architecture
  overview.
- [Schema, build artifacts, and runtime rules](../../SCHEMA-BUILD-RUNTIME-RULES.md) refines Schema,
  Web artifact, and runtime-execution responsibilities.
- [Structural CSS](../../STRUCTURAL-CSS.md) defines structural ownership inside `p-react`.
- [Native runtime pattern](../../packages/components/docs/definitions/native-runtime-pattern.md)
  defines the shared native flow.
- [Icon consumption](./icon-consumption.md) defines E-I, CP-I, and family-resolution ownership.
