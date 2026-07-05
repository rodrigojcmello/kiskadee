# Preset Evidence Format

Use this format when creating or substantially revising source evidence files under:

```text
packages/presets/docs/design-systems/<preset>/
```

Keep files concise. The goal is provenance and decision traceability, not a full design-system copy.

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

## Local Evidence

- `<path to local evidence image, if any>`

![Short alt text](../evidence/<component>/<source-slug>.png)

## Inspected Variants

- `<variant/state/size inspected>`
- `<variant/state/size inspected>`

## Source-Derived Values

| Source concept | Source value | Kiskadee mapping |
| --- | --- | --- |
| `<upstream token or node>` | `<value>` | `<element/option/scale/palette/effect>` |

## Schema Mapping

- `e1`: <meaning for this component/preset, when relevant>
- `e2`: <meaning for this component/preset, when relevant>
- `components.<component>.options.<option>`: <why this default exists>

## Adaptations

- <Intentional difference from upstream source.>
- <Unsupported upstream behavior and current Kiskadee approximation.>

## Open Gaps

- <Known follow-up or source gap. Use "None known." when there is no gap.>
```

## Minimum Acceptable Evidence

For small changes, the document may be shorter, but it must still include:

- source URL;
- Figma file key and node ID when available;
- the concrete schema decision derived from the source;
- any intentional Kiskadee adaptation.

## Naming

- Use lowercase component filenames matching the component key when possible:
  `components/slider.md`, `components/switch.md`, `components/card.md`.
- Use stable local evidence filenames:
  `evidence/<component>/<source-or-node-slug>.png`.
- Prefer exact source labels over generic names like `screenshot.png`.
