# Preset Evidence Format

Use this format when creating or substantially revising source evidence files under:

```text
packages/presets/docs/design-systems/<preset>/
```

Keep files concise. The goal is provenance and decision traceability, not a full design-system copy.

## Contents

- [Canonical statuses](#canonical-statuses)
- [`source-evidence.md`](#source-evidencemd)
- [`components/<component>.md`](#componentscomponentmd)
- [Minimum acceptable evidence](#minimum-acceptable-evidence)
- [Naming](#naming)

## Canonical Statuses

Use these terms consistently. Do not replace them with ambiguous labels such as "supported" or
"custom" without one of these statuses.

- **Official exact**: represented without a meaningful visual or behavioral change.
- **Official adapted**: derived from an upstream source but translated into Kiskadee's existing
  schema, scale, or platform-neutral contract.
- **Kiskadee extension**: supplied by the framework where the upstream design system does not
  define an equivalent.
- **Deferred**: confirmed upstream capability that is intentionally outside the current schema or
  task scope.
- **Not inspected**: source area whose behavior is still unknown; never infer it as official.

Keep source provenance separate from implementation status. A generated bundle may retain a
diagnostic status such as `review` while an explicitly selected subset of its source-backed assets
is approved and promoted into a preset.

## `source-evidence.md`

Use this for design-system-level evidence.

```md
# <Design System> Source Evidence

This file records source evidence and preset-level decisions for
`packages/presets/src/presets/<preset>/`.

## Primary Sources

- Figma community file:
  [<File name>](<url>)
  - file key: `<figma file key>`
  - relevant page or node: `<node id or page name>`
- Official documentation:
  [<Page title>](<url>)

## Source Notes

- <Broad source note or known gap.>
- <Example: Figma lacks dark mode, so the official site is used for dark treatment.>

## Source Coverage

| Source area | Evidence | Status | Notes |
| --- | --- | --- | --- |
| `<page, section, or component>` | `<node ID or URL>` | `<canonical status>` | `<coverage boundary>` |

## Preset-Wide Color And Token Provenance

- <Canonical token source and any local evidence artifact.>
- <Generated asset/version provenance and which assets are promoted.>

## Supported And Deferred Capabilities

- **Official exact/adapted**: <capabilities represented now.>
- **Kiskadee extension**: <preset-wide framework additions, if any.>
- **Deferred**: <confirmed upstream capabilities intentionally omitted.>

## Preset Decisions

- <Decision derived from the sources.>
- <Kiskadee adaptation or intentional divergence.>

## Component Evidence

- [<Component>](components/<component>.md)
```

## `components/<component>.md`

Use this for component-level evidence.

```md
# <Design System> <Component> Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/<preset>/components/<component>.schema.ts`.

## Sources

- Figma reference:
  [<File/node label>](<url>)
  - file key: `<figma file key>`
  - node id: `<node id>`
- Official documentation:
  [<Page title>](<url>)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| `<variant group>` | `<node ID>` | `<variants, modes, or states>` | `<canonical status>` |

## Local Evidence

- `<path to local evidence image, if any>`

![Short alt text](../evidence/<component>/<source-slug>.png)

## Official Contract

- <Official variants, states, sizes, and behavior actually present upstream.>
- <Explicit statement for interaction states or variants that are absent upstream.>

## Color And Token Provenance

| Source concept | Source value | Lookup | Kiskadee mapping | Rationale |
| --- | --- | --- | --- | --- |
| `<upstream token or node>` | `<value>` | `functional reference: <subtle|vivid> <offset>` or `exact tone: <L/D>` | `<element/option/scale/palette/effect>` | `<why this lookup kind is correct>` |

Use `functional reference` when a shared or remappable formula follows the participating primitive
family. Use `exact tone` for an upstream stop selected independently per theme or an explicitly
documented absolute/structural decision. Do not list the current numeric position of a functional
reference as if it were an exact-tone decision.

## Kiskadee Mapping

| Kiskadee appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| `<intent/emphasis>` | `<upstream style or none>` | `<canonical status>` | `<mapping>` |

## Kiskadee Extensions

- <Framework-provided appearance or state not defined upstream.>
- <Why the extension exists and how it avoids claiming upstream fidelity.>

## Shared Formula

- <Role-agnostic rule used across intents, themes, emphases, and interaction states.>
- <Whether values resolve at schema authoring/build time or require runtime behavior.>

## Deferred Or Unsupported

- <Confirmed upstream capability intentionally deferred.>
- <Current approximation, or "No approximation is emitted.">

## Schema Mapping

- `e1`: <meaning for this component/preset, when relevant>
- `e2`: <meaning for this component/preset, when relevant>
- `components.<component>.options.<option>`: <why this default exists>

## Validation

- <Source/schema checks performed.>
- <Build, generated-artifact, or visual validation performed.>

## Open Gaps

- <Known follow-up or source gap. Use "None known." when there is no gap.>
```

## Minimum Acceptable Evidence

For small changes, the document may be shorter, but it must still include:

- source URL;
- Figma file key and node ID when available;
- the concrete schema decision derived from the source;
- any intentional Kiskadee adaptation;
- a canonical status for official, adapted, extended, deferred, or uninspected behavior.

## Naming

- Use lowercase component filenames matching the component key when possible:
  `components/slider.md`, `components/switch.md`, `components/card.md`.
- Use stable local evidence filenames:
  `evidence/<component>/<source-or-node-slug>.png`.
- Prefer exact source labels over generic names like `screenshot.png`.
