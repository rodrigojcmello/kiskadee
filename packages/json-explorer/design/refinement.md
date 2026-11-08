# JSON Explorer technical refinement

Status: historical OpenPencil refinement, retained as design context. The implementation contract
has moved to [JSON Explorer inspection contract](../docs/definitions/inspection-contract.md).
That package-local definition is the source of intended behavior; update it rather than adding
new implementation rules here. The [package README](../README.md) describes
the executable workflow. The notes below record the visual-refinement stage, not live extraction.

## Inputs and source of truth

- The type contract is the required structural input. A concrete JSON reference is optional and
  adds values and information about which properties were supplied; it does not hide properties
  allowed by the type contract.
- Extraction reads types and JSDoc together and produces a derived inspection model. Source types,
  comments and reference data remain the sources of truth. The derived file does not modify the
  original Kiskadee schema or participate in preset builds, artifacts or Showcase.
- Type shape does not automatically describe arbitrary manual/runtime validation. The viewer must
  not imply that it proves consumption of an attribute or complete validation of a reference JSON.
- The root uses the type name, or the last explicitly selected property key when inspecting an
  indexed property type, preserving case. Examples: `Schema` -> `Schema`,
  `Schema["components"]` -> `components`, and `Schema["components"]["button"]` -> `button`.
  These brackets are indexed property access, not evidence that the source is an array.
- The root is the entry node/card and opens its properties. An optional generated filename is
  separate from the displayed type name; a reference JSON file is not required to name the root.

## Labels and documentation

- The property key remains the primary label. The secondary line prefers JSDoc `@summary`,
  then a configured text field such as `name`, `title` or `label` from the concrete reference
  object; without either it is omitted.
  An ordinary JSON `name` property is not intrinsically a display label.
- The expanded description is separate from the secondary line. The checked Button source has no
  `@summary` tags, so type-only Button cards show exact keys without invented semantic subtitles.
  Reference examples configured with `name` use concrete values such as `e1.name = "button"`
  and `e2.name = "button-text"`.
- A separate synthetic `Example` illustrates authored JSDoc `@summary` labels and full descriptions.
  These examples are not additional fields in the Button contract or evidence of live extraction.
- Each node retains its own key and parent so punctuation in a property name cannot be confused
  with a hierarchy separator. The readable breadcrumb is presentation, not the internal identity.
- Data-specific origin badges such as Fluent 2 / Microsoft need explicit supplied context; they
  are not generic facts inferred from an arbitrary type or JSON object.

## Reference-value states

Both pages now include paired type-only and populated-reference views for visual review.
Within those scenarios, distinguish these concepts without automatically presenting them as errors:

| State | Meaning |
| --- | --- |
| No JSON reference | The type contract is being inspected without concrete values. This does not mean that every property was left unfilled. |
| Property not supplied | A reference JSON exists, but that property is absent. |
| Explicit null | The JSON contains `null` for that property. |
| Empty value | `""`, `[]` or `{}` is present; each needs its own visual representation. |
| Concrete value | Display the supplied value alongside the type information. |

JSON text has no `undefined` value. A type that permits `undefined` is type information, not a
concrete JSON value or a synonym for an absent property.

## Graph and Columns

- Graph and Columns are complementary presentations of the same type and optional reference data.
  The shared segmented selector changes presentation.
- Changing modes resets selection, expansion, navigation position and scroll state, as if opening
  that view for the first time. The already loaded inputs remain available; they are not extracted
  or loaded again merely because the user changes views.
- In Graph, clicking a card body selects it and shows its details in the side inspector. The `+`
  and `-` controls independently expand and collapse its children.
- Graph starts at a fixed scale without zoom or Fit controls. Horizontal and vertical scrolling
  locate content; Space + drag provides an additional way to move through that area.
- The pages are `01 - Graph view` and `02 - Column view`; current desktop artboards are 1600 x 1000.
- Columns reserve four desktop positions for up to four levels, move each selected ancestor to the top, reveal its
  description and open children in the next column. Remaining siblings retain their order.
  The window advances as needed; arrows revisit only the existing columns of the current branch,
  without history. Long columns scroll vertically, without a horizontal scrollbar for the window.
- Selecting a different property in an ancestor column discards the descendant columns and opens
  the new branch. Returning to an old branch does not restore its previous navigation state.

## Current visual-review inventory

- Both pages pair the Button type contract with a populated-reference view and include a typed-values
  view. The README lists their numbered artboards and preview files.
- The separate generic `Example` covers strings, arrays and indices, `false`, `null`, `""`, `[]`, `{}`,
  an absent optional property and long text. It also demonstrates a short `@summary` label separately
  from a full description. It does not claim those properties belong to Button.
- Graph additionally uses a separate `ComplexExample` to illustrate `number | SizeMap`, a free-key `Record` and recursive `ComplexExample[]`.
  Their exact visual representation remains a proposal; free-form keys cannot be presented as a
  finite list of all possible properties. Reference JSON may supply concrete examples of such keys.
- Both pages illustrate a primitive `Message` root typed as `string | null`, with reference value
  `"Ready"` and no child expansion. Columns shows only level 1; unopened placeholders do not imply
  extra levels in the type.

Button source and reference content were checked on 2026-11-08. These are authored mockups, not an
implemented extractor or proof of source consumption. The current design was saved and its
exports were inspected; user visual validation remains the next step. The README records the
verification boundary.

The implementation plan subsequently selected HTML/CSS cards, SVG connections and Dagre for
layout. The package-local contract governs these choices. The visual variants above do not add
validation rules, new data sources or Kiskadee-specific assumptions.
