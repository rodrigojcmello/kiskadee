# Typography Artifacts

## Build boundary

The schema owns semantic typography profiles and element references. The Web Builder resolves those
references before the normal style-key phases and emits the result as ordinary atomic utilities:

- `textSize` becomes `font-size` in `rem`;
- `textHeight / textSize` becomes a unitless `line-height`;
- `textLetterSpacing / textSize` becomes `letter-spacing` in `em`.

Computed numbers are rounded to at most six decimal places. A responsive transition from a profile
with letter spacing to one without it emits `letter-spacing: normal` at that breakpoint so the
previous media-query value cannot leak forward.

Unitless line height preserves the authored ratio when users or hosts increase font size. The
Builder does not invent a minimum ratio: accessibility depends on content and layout continuing to
work when users override line height, letter spacing, and word spacing, rather than rewriting the
design-system metric during compilation.

Typography does not add a class-map bucket or a composite CSS rule. Metrics always remain in the
existing `s` bucket. `textFont` and `textWeight` are hoisted to `d` only when their value is invariant
for the entire element slot; otherwise one atomic class is stored in each applicable size bucket.

## Catalog utilities

Every declared profile contributes its atomic utilities to `core.kiskadee.css`, including profiles
that are not referenced by a component. This is intentional: `typography.kiskadee.json` is a real
catalog consumer used to render typography specimens. Identical property/value utilities remain
deduplicated by the normal style-key and class-shortening pipeline.

The artifact preserves authored profile order and has this shape:

```json
{
  "profiles": {
    "body-medium": {
      "decorations": { "textFont": "body", "textWeight": "normal" },
      "scales": { "textSize": 14, "textHeight": 20 },
      "className": "preset-a preset-b preset-c preset-d"
    }
  },
  "usage": {
    "body-medium": [
      {
        "component": "button",
        "element": "e2",
        "elementName": "button-text",
        "scale": "s:md:1"
      }
    ]
  }
}
```

`className` is a space-separated list of atomic classes, not the name of a generated composite
class. Usage records retain the technical slot, its authored readable name, variant/mode when
present, scale, and non-base breakpoint.

## Manifest and global metadata

`manifest.typography` contains only the artifact pointer:

```json
{
  "typography": {
    "artifact": "typography.kiskadee.json"
  }
}
```

The typography catalog is not copied into `global.kiskadee.json`. The authorial schema remains in
`schema.json`, while the dedicated artifact owns Web classes and resolved usage.

The Builder uses the active schema's breakpoint values for responsive typography and existing scale
utilities. Core rules are emitted base-first and then by ascending `min-width`, so a smaller
breakpoint cannot win over a larger one merely because its shortened class sorts later. This changes
only CSS rule order, not style-key identities or generated class names. There is no runtime
resolution or CSS custom-property indirection for profiles.
