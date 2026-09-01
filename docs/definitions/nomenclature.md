# Kiskadee Nomenclature

Status: canonical cross-package definition.

This document standardizes terms and abbreviations that have a specific architectural meaning in
Kiskadee. It is not a glossary of general software, web, or design-system terminology.

A term belongs here only when Kiskadee defines, narrows, or relies on its meaning as part of a
cross-package contract. General industry abbreviations remain ordinary technical vocabulary and
are intentionally excluded.

## Canonical abbreviations

### AF — Activation Feedback

Kiskadee's visual response to actionable interaction. AF is modeled as an interaction capability
and must not be treated as structural ownership or as an arbitrary component animation.

### CP-I — Consumer-provided Icon

Arbitrary icon content deliberately supplied by the consumer through composition or an explicit
renderer. A Kiskadee component owns the slot, but does not interpret the artwork or choose its icon
family.

### CSC — Complementary Spacing Composition

The composition of an element's always-on spacing with a second, independently authored spacing
that Structural CSS applies only under a local structural condition. CSC never borrows another
element's value or calculates the complement at runtime.

### DSPE — Decorations, Scales, Palettes, and Effects

The four fundamental visual domains available under a schema element. Use **DSPE taxonomy** as the
canonical collective term for this structure:

- **Decorations** define structural, always-on base styling.
- **Scales** normalize size and geometry through reusable references.
- **Palettes** define semantic color by intent, emphasis, and interaction state.
- **Effects** define optional, additive visual treatments.

DSPE is a collective abbreviation, not a fifth schema domain. Its letter order is mnemonic and does
not establish evaluation precedence or serialized object order. Element topology, options, variants,
global catalogs, and recipes are not part of the DSPE taxonomy.

### E-I — Essential Icon

An internal affordance selected from Kiskadee's limited global essential-icon catalog. Components
request the concept from the `EssentialIconProvider` and omit the complete affordance when it cannot
be resolved.

### FRF — Functional Reference First

Kiskadee's preset-authoring policy for solid base colors. An FRF preset starts from a primitive
family's `subtle` or `vivid` functional reference and an ordinal offset whenever the visual decision
is family-relative. A source-mandated fixed stop uses an evidence-backed `exact` locator, while a
physical white or black endpoint uses a `cap` locator.

FRF is reference-first, not reference-only. It governs preset authorship and is fully resolved to a
`SolidColor` before the published Schema reaches builders or runtimes.

### IFP — Icon Family Provider

The optional authority that selects the effective icon family and variant for family-resolved
icons. Components and icon slots must not select another family independently.

### SEP — Style Emission Policy

The build-time policy that defines how a Style Key is materialized in generated CSS and class-map
artifacts, such as direct, token, or mirrored emission.

### SUP — Structural Utility Projection

The build-time mechanism that exposes an already emitted token-only utility so an approved
structural owner can consume the same class reference without copying its value.

## Canonical terms without abbreviations

### Badge

A passive component that represents metadata associated with another entity as a dot, short text or
number, or icon-only Mark. Badge owns no activation, selection, removal, or interaction state.
Icon-plus-label content belongs to Chip, not Badge.

### Badge Mark

The icon-only Badge anatomy. A contained Mark places one Consumer-provided Icon inside an authored
pill surface; a full-bleed Mark lets one artwork fill the Badge viewport. Mark never includes text
or a number.

### Badge Separation Ring

An optional Schema-authored outline outside a Badge that separates overlaid metadata from its host.
Badge owns the ring color and width; Structural CSS owns only its placement and negative inset.

### Button

An actionable component that represents a command or navigation operation. Button owns activation;
it is not a passive metadata carrier or a represented entity. When a preset publishes comparable
scales, Kiskadee-authored official presets should normally keep Chip visually subordinate to Button,
while custom presets remain free to document another hierarchy.

### Chip

A component that represents an entity, filter, choice, or removable value. Chip may be static,
individually selectable, removable, or both selectable and removable. Compact command-only controls
remain Button.

### Content Surface Context

The semantic surface (`onSubtle` or `onVivid`) that a component produces for independent
descendants. It is authored as serializable component metadata and resolved separately from the
surface the component itself consumes.

### Composition Strategy

A documented choice among Kiskadee's established mechanisms for representing a concern, such as a
component, slot, variant, mode, option, profile, Effect, Headless primitive, Provider, Structural
CSS, or Schema-to-Web composition pattern. Composition Strategies preserve the authority and
handoffs of their linked definitions; they do not create new ownership by themselves.

Composition Strategy is not a Schema property, runtime API, or claim that the selected mechanisms
are mutually exclusive. One concern may combine multiple strategies when each owns a different
responsibility.

### Family-resolved Icon

An icon requested by `IconName` and resolved against the effective family and variant selected by
the IFP. `FamilyResolvedIcon` is the React implementation of this resolution mode.

### Schema

Kiskadee's platform-agnostic, serializable visual contract. Core defines its types and validation;
presets provide concrete instances; builders compile those instances into platform artifacts. The
Schema owns visual semantics, including the DSPE taxonomy, but does not own component runtime
behavior, structural layout, resource imports, callbacks, or generated artifacts.

Use **Schema** when referring to this Kiskadee contract. A generated `schema.json` is a reference
snapshot or input artifact; it is not the sole definition of the Schema.

### Style Key

The Web Builder's canonical serialized identity for one style property and value, with any relevant
state, size, breakpoint, or reference context. Style Keys allow equivalent schema values to be
deduplicated and carried into generated CSS and class-map artifacts.

A Style Key is not a Schema property name, generated CSS class name, component prop, or public
runtime API.

### Structural CSS

The p-react styling layer that owns Web DOM composition, layout and flow, stacking and clipping,
structural geometry, and browser-specific rendering mechanics. Structural CSS may decide where and
how a Schema-generated value is consumed, but it is not the authority for design tokens, semantic
colors, responsive thresholds, or preset-authored spacing and dimensions.

Use **Structural CSS** when distinguishing framework-owned Web mechanics from Schema-authored
visual values. A value does not become structural merely because Sass consumes it: for example, a
Dropdown scroll affordance may use Structural CSS to apply an `iconSize` variable as its minimum
block size, while the dimension itself remains owned by the Schema.

### Surface Context

The semantic `onSubtle` or `onVivid` surface received by a component. p-react resolves an explicit
prop, the nearest `SurfaceContextProvider`, and then its portability default in that order. Surface
Context never carries concrete colors, tokens, or generated classes.

### Showcase

The Kiskadee consumer and visual-validation application located at `packages/showcase`. Showcase
demonstrates and inspects framework behavior; it is not the architectural owner of behavior that
belongs to Core, presets, builders, runtimes, or component projects.

### Showcase Content (`s-content`)

The route-owned documentation and example region of Showcase. `s-content` includes the headings,
descriptions, specimens, and inline controls rendered in the route canvas. It excludes the top bar,
lateral controls panel, and other Showcase application chrome.

Every visual entity in `s-content` must be composed from public `p-react` components and the active
Schema-generated artifacts. Component-owned slots, such as `Button.Label`, count as part of their
owning `p-react` component and must not be restyled by Showcase. Native elements and Showcase CSS
may provide semantic landmarks, layout, responsive arrangement, and small composition gaps, but
must not author typography, colors, backgrounds, borders, radii, shadows, or component appearance.

When a required visual capability is absent from `p-react`, `s-content` must expose that gap and
route the work to the owning framework project instead of creating a Showcase-local substitute.
The term names a conformance boundary; it is not a public component, CSS class, Schema property, or
new Composition Strategy. Write the alias exactly as lowercase `s-content`.

## Project aliases

The `p-` prefix identifies a Kiskadee platform component project in project discussions. These are
communication aliases, not package names, import scopes, or filesystem replacements.

### `p-react`

The Web React visual component project at `packages/components/react`. It does not refer to
`packages/headless/react`; use **headless-react** when naming that project.

### `p-android`

The Android component project rooted at `packages/components/android`.

### `p-ios`

The iOS component project rooted at `packages/components/ios`.

## Usage rules

- Use the full term on first mention when the audience may not know the abbreviation.
- Do not create an abbreviation solely to shorten a local implementation detail.
- Add a term here only when its meaning is stable and applies across packages.
- Keep component-local vocabulary in that component's nearest documentation.
- Keep general technical abbreviations out of this document unless Kiskadee assigns them a narrower
  normative meaning.
- Do not name a new Composition Strategy until its recurring problem, eligibility, authority, and
  canonical implementation are documented.
- Use **DSPE taxonomy** when discussing the four visual domains collectively; use the individual
  domain name when ownership or behavior differs between them.
- Capitalize **Schema**, **Style Key**, and **Showcase** when invoking their canonical Kiskadee
  meanings. Capitalize **Structural CSS** when invoking the canonical p-react layer. Lowercase
  remains appropriate for ordinary generic usage.
- Keep the project aliases lowercase and hyphenated: `p-react`, `p-android`, and `p-ios`.
- Use **Showcase Content** on first mention in normative prose and lowercase `s-content` for its
  canonical region alias.

## Related definitions

- [Composition strategies](./composition-strategies.md) defines how to choose among components,
  slots, variants, modes, profiles, Effects, Providers, platform mechanics, and Web composition
  patterns.
- [Schema-to-Web composition patterns](./schema-to-web-composition-patterns.md) centralizes CSC,
  SEP, and SUP and defines when each pattern applies.
- [Icon consumption](./icon-consumption.md) defines the complete E-I, CP-I, family-resolution, and
  icon-size ownership contracts.
- [Project governance and responsibility](./project-governance.md) defines project authority,
  allowed consumption, forbidden ownership, and handoffs.
- [Project purpose](../../PROJECT-PURPOSE.md) defines product context, the Schema, DSPE domains, and
  the summarized platform flow.
- [Schema, build artifacts, and runtime rules](../../SCHEMA-BUILD-RUNTIME-RULES.md) defines the
  boundary between Schema ownership and generated or runtime behavior.
- [Structural CSS](../../STRUCTURAL-CSS.md) defines the complete ownership, naming, and consumption
  rules for the p-react structural styling layer.
- [Structural utility projections](../../packages/web-builder/docs/definitions/structural-utility-projections.md)
  defines the SUP eligibility, registry, and artifact contracts.
