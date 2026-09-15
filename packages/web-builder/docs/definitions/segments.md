# Segments

Kiskadee no longer uses a `schema.segments` object as a source of truth.

## Source of truth

Segments are defined and discovered in presets through:

- `schema.colors.globalSemanticsBySegment`

This is a segment registry with metadata and optional overrides:

- `meta.name` is the human-friendly segment label shown in tooling.
- `themes` is optional and only exists when a segment overrides Layer 2 mappings.

Conceptually, runtime resolution works like this:

1. Segment override, if present.
2. Fallback to the global baseline.

In code terms:

```ts
override = colors.globalSemanticsBySegment[segment].themes?.[theme]?.[semantic]
base = colors.globalSemantics[theme][semantic]
resolved = override ?? base
```

## Build artifact (version 1)

Web Builder owns `segments.json`, referenced by `manifest.segmentMetadata`. It publishes:

- `version`: 1.
- `defaultSegment`: the registered `default` ID.
- `sectorOrder`: Tonal Scale's circular Munsell sector sequence, once per registry.
- `segments`: entries containing `id`, authored `name`, optional primary `classification`,
  and `vivid` (a theme-to-HEX map).

The builder resolves each primary through segment overrides and global semantics, then reads
classification and functional vivid references from `colors.primitiveColors`. It does not classify
colors or invent missing reference tones. Classification uses the Light reference and remains
stable across themes. Darker uses the Dark primitive reference under the existing theme contract.
The artifact contains no full scales, expanded semantic maps or component data.

`meta.name` must be a non-empty string. Missing primary mappings/assets and invalid classification
produce explicit build errors. Dynamic primitives deliberately have no static swatch; legacy assets
without functional references may also omit swatches/classification. These cases emit a diagnostic
and remain selectable. Consumers omit unavailable swatches rather than guessing colors.

The resource revision includes the segment file's bytes. A declared but unreadable file fails before
component resource publication with a diagnostic identifying the file and required preceding phase.

Showcase owns presentation: rotate sectors around the default primary, keep Default first, sort
peers by position and stable ID, and place unclassified entries last. Swatches follow the active
theme, while the order remains stable. Generator mathematics stay in Tonal Scale; labels and
primary mappings stay in Presets.
