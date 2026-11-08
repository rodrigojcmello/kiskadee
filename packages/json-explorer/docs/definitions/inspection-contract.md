# Type and JSON inspection contract

Status: canonical contract for the JSON Explorer. Repository governance owns its cross-project
boundaries; this document owns its inspection and navigation behavior.

## Sources and derived model

A TypeScript contract is required. A JSON reference is optional and supplies values and presence
information without hiding properties declared by the type. The sources remain authoritative;
the generated inspection document is a derived representation used only by this tool.

The Node extractor accepts an entry file, exported symbol, TypeScript configuration and selected
property path. It reads resolved types and JSDoc without executing inspected modules. The root
uses the last selected property key, or the exported type/symbol name when no path is selected,
preserving case. Indexed property access is not evidence of an array.

Definitions are reused by reference rather than expanded into every possible path. Preserve
properties and optionality, primitive and literal types, unions/intersections, array and tuple
items, finite mapped keys and open index signatures. Recursive occurrences stop at a type
reference. Unresolved forms remain named and diagnosed; they must not silently become empty
objects. Resolution failures that prevent a meaningful root must fail extraction.

The Fluent example selects the typed final preset export and `components -> button`, equivalent
to `NonNullable<Schema<'teams'>['components']['button']>`. Preserving `teams` is necessary to
describe the complete preset. A separate Node adapter supplies its authored Button JSON. No
Web Builder dump, artifact generation or runtime color resolution is involved.

The browser consumes only the derived document and optional reference. It must not import the
TypeScript compiler, Core or Presets. Generated documents are ignored local outputs, not preset
assets or a new source of component meaning.

## Documentation, names and identity

- The primary label is the exact property key or array index.
- Prefer the property's own documentation; use referenced-type documentation when the property
  has none, retaining source provenance.
- An undocumented union does not inherit an arbitrary member's summary. Member documentation is
  a fallback only when there is one concrete candidate, such as an optional object plus `undefined`.
- The secondary line prefers JSDoc `@summary`, then a configured textual field from the reference
  object. Omit it without either. `name`, `title` and `label` have no implicit special meaning.
- Full descriptions are independent of the secondary label. No description produces an explicit
  empty-documentation state rather than authored explanatory prose.
- Occurrence identity uses its parent and exact property/index/type-alternative segment. A key
  containing punctuation must not collide with a nested path. Breadcrumbs are display text.
- Origin badges or source labels require explicit context; they are not inferred preset identity.

## Type and reference states

Distinguish no active reference from a property not supplied in a loaded reference. Neither is a
synonym for explicit `null`, present empty values (`""`, `[]`, `{}`), or concrete values including
`false` and `0`. Preserve `undefined` as type information, never as a JSON value.

Keep union alternatives visible when a reference uses one form. Finite maps expose their allowed
keys, including unfilled optional keys. Open maps expose the key/value contract and observed keys
without claiming a finite possible-key count. Arrays expose their item contract and supplied
indices. An empty collection is still present; the type remains inspectable.

The reference overlay distinguishes possible union forms by outer value shape and object keys;
it does not perform deep TypeScript assignability validation. Open-key matching supports string,
number and extracted string-template patterns. Other key domains remain identified and diagnosed.

The tool explains declaration and presence. It does not claim complete runtime validation of a
reference, detect every manually authored validation constraint, or prove consumption of a field
by a component implementation.

## Graph and Columns

Both presentations use the same model and reference. Changing modes resets selection, expansion
and navigation/scroll positions, retaining loaded inputs and the reference choice. Toggling the
reference preserves valid navigation; if an observed key disappears, select its nearest available
ancestor.

**Graph:** body selection updates the Inspector; separate `+`/`-` controls expand and collapse
children. HTML/CSS cards have natural content height, symmetric padding and no reserved blank
lines. Dagre receives measured dimensions; SVG connections curve between cards with a hollow
output circle centered on the source edge and no input circle. Scrolling and Space + drag move
through a fixed-scale area. There is no zoom, Fit or individual node dragging.
The heading overlays the canvas with slightly rounded, solid canvas-colored backgrounds only behind its text
fragments and metadata items. The surrounding space stays transparent and allows interaction
with the graph underneath.

**Columns:** reserve four desktop positions for the current branch. Selecting a card moves it
first, reveals its description and opens its children in the next column. Siblings retain their
relative order. Selecting another ancestor discards descendants. Shift the visible four-column
window as needed; arrows revisit levels of that branch without history. Each column scrolls
vertically, without horizontal window scrolling. Leaves do not create child levels.

Controls must remain keyboard-operable. Space used to activate a control must not simultaneously
start canvas panning.

## Initial application and delivery boundary

Preload Fluent Button with Graph active, the root selected and expanded to its four properties,
`name` as the configured secondary field, and Reference JSON enabled. The local application uses
port 3002. `dev` prepares current data before starting; `inspect` regenerates it and the UI reloads
the document without per-node requests.

The reference status chip sits next to the root name in the document identity group in both modes;
view and reference controls remain together on the right.

The saved OpenPencil file is the visual reference, including the natural-height correction. Its
synthetic value/type examples are test cases, not added Button properties. This delivery is a
private local desktop application; npm publication, browser file selection, editing, mobile
refinement and upstream build integration remain outside it.
