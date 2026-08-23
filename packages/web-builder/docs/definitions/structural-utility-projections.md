# Structural Utility Projections

## Definition

A structural utility projection is an explicit Web Builder reference that makes an already emitted
token-only scale utility available to a different structural owner.

The projection exists for the narrow case where:

- a preset already authors the visual value on a component element;
- the normal class-map bucket correctly serves that element;
- a visual component must apply only that utility conditionally to a wrapper or another structural
  node; and
- copying the raw value, inspecting a child class, or applying the element's complete class list
  would violate ownership.

A projection does not create a design token, CSS declaration, selector, effect recipe, component
option, or public prop. It publishes another reference to an existing utility class.

## Ownership boundaries

The participating layers retain distinct responsibilities:

- Schema elements and presets author visual values.
- Normal class-map buckets resolve the classes applied to the element that owns those values.
- Style Emission Policy decides the Web shape of a utility, such as direct, mirrored, token, or
  compensated emission.
- The Structural Utility Projection Registry explicitly allows one existing utility to be
  referenced by a structural consumer.
- Visual component runtime decides when the projected class is active and on which approved node it
  is applied.
- Structural Sass defines the layout relationship and may consume variables exposed by the utility.

Projection never transfers schema ownership to the structural node. The source element remains the
authoritative visual owner.

## Registry

The Web Builder owns one explicit allowlist of structural utility projections. The registry is not
part of Core or preset schema because it describes a Web artifact relationship, not cross-platform
visual identity.

Every future registry entry must identify, without runtime inference:

- the component and source schema element;
- the existing scale property being referenced;
- the target element branch in the generated component class map;
- a stable artifact key.

Scale keys are derived from the source element's authored utility. Registry entries must not repeat
or override that scale authorship.

The Registry accepts only the `scales` channel and an existing standard scale property. The source
must use `token` emission so its class exposes a structural CSS custom property without applying an
unrelated direct physical declaration.

The Registry must reject:

- IDs that are not lowercase kebab-case;
- artifact keys outside the compact one-to-three-character contract;
- source or target elements that do not use `e<n>`;
- cross-component projections;
- source and target locations in different variant or mode branches;
- duplicate IDs, target artifact keys, or target scale properties;
- projection chains;
- a target that already emits the projected CSS custom property from another scale property;
- missing required sources or targets; and
- projections that would require a raw value.

A source may be marked optional so presets that omit that element or scale property omit the
projection. The target remains required whenever the source exists. The Registry must not discover
projections by scanning component code, DOM children, class strings, or CSS declarations.

The canonical registry contains only explicitly reviewed structural relationships. Presets that
omit an optional source still emit no projection bucket for that relationship.

## Artifact contract

Structural utility references use the optional compact `p` bucket on a component element:

```text
element.p[artifactKey][scaleKey] = className
```

Conceptual example only:

```json
{
  "e1": {
    "p": {
      "ex": {
        "all": "k-a",
        "md:1": "k-b"
      }
    }
  }
}
```

Rules:

- `p` is optional and omitted when the element has no registered projection.
- `artifactKey` starts with a lowercase letter and contains one to three lowercase alphanumeric
  characters. It identifies one approved structural use and must not be treated as a style
  property.
- `scaleKey` uses `all` or an existing component scale key.
- Runtime resolves the `all` entry plus the active scale entry. It does not invent nearest-scale
  fallback or evaluate breakpoints.
- `className` contains only references to atomic utilities already emitted by the normal pipeline.
  It may contain a space-separated atomic class list when the source utility already resolves that
  way.
- `p` never contains a number, color, shadow tuple, CSS declaration, option, state, or metadata.
- Projections are scale-only and palette-independent. Intent, emphasis, surface context, theme,
  effects, and interaction state continue through the normal component class-map grammar.

Each Registry rule explicitly selects whether the projected class remains in the source element's
normal `s` bucket. Retaining it copies only the class reference. Not retaining it removes only that
utility reference from the source `s` bucket; the atomic CSS rule remains shared and is not
regenerated.

The bucket is published inside the existing aggregate and component-scoped core class maps. It does
not create another JSON artifact, stylesheet, provider, request, or runtime module.

## Eligibility test

Add a projection only when every answer below is yes:

1. Does a schema element already author the canonical visual value?
2. Does the normal build pipeline already emit the required scale utility with `token` emission?
3. Must a structural owner apply that utility independently from the source element's complete
   class list?
4. Is the relationship Web-specific and inappropriate as a new cross-platform schema concept?
5. Can the artifact contain only existing class references keyed by existing scales?
6. Can runtime activate it without reading raw schema values or inspecting descendants?
7. Are source and target in the same component, variant, and mode branch?
8. Can the target receive the emitted custom property without colliding with one of its own token,
   mirrored, or compensated scale utilities?

If the value is missing, author it in schema. If its CSS shape is wrong, change Style Emission
Policy. If the issue is layout mechanics, solve it in structural Sass. If the issue is which mode is
active, use component options and runtime composition. A projection is not a shortcut around those
owners.

## Current registry and candidates

The canonical Registry currently contains these projection families:

- `button-group-divider-thickness` projects optional `Button.e6.scales.boxWidth` to `Button.e1`
  under artifact key `gd`, with `retainSource: true`.
- Dropdown independent leading-track projections expose `e3` icon width/gap under `e3.p.iw/ig`
  and `e10` selection width/gap under `e10.p.sw/sg`, all with `retainSource: true`.

`Button.e6` remains the only visual author. Its normal `s` bucket continues to size the decorative
line, while `Button.e1.p.gd` lets grouped Button roots expose the same `--k-bxw` utility for logical
seam-overlap compensation. Runtime activates that projection only when `groupDivider` has
compatible paint, the projection exists, and the group contains more than one Button.

Dropdown keeps `e3` and `e10` as the only visual authors. p-react applies the projected width and
gap utilities to empty structural track nodes only when another direct item in the same independent
group renders the corresponding leading slot. The projection emits no placeholder glyph or value.

Tabs fixed width remains a future candidate for migration from its specialized width bucket. It
must not be described as using `p` until a dedicated migration is implemented and validated.

## Validation for a future entry

A projection implementation must verify:

- invalid registry sources and key collisions fail at build time;
- the generated `p` branch contains only class-name references;
- only token-emitted scale utilities can be projected;
- `all` and active-scale resolution is deterministic;
- projected utilities reuse the same atomic classes as their source;
- the generated CSS declaration set does not grow for an already emitted utility;
- presets without the source utility omit the projection instead of receiving a fallback;
- the registry does not add a component artifact, manifest capability, provider, or browser chunk;
  and
- component tests prove that the class is applied only to the intended structural owner and only
  while the corresponding behavior is active.
