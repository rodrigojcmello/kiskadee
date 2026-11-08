# JSON Explorer visual proposal

Status: visual design archive for the [JSON Explorer application](../README.md).
The [package inspection contract](../docs/definitions/inspection-contract.md)
is the source of intended behavior. [Technical refinement](refinement.md) retains the preceding
design discussion; this archive is visual reference rather than a second implementation contract.

Open `json-explorer.fig` in OpenPencil. The two pages are complementary presentations of the same
required type contract and optional JSON reference. Pages use numbered prefixes; artboards use
that prefix plus a letter for unambiguous review. All current artboards are 1600 x 1000 desktop views.

## Page 01 - Graph view

- `01A - Type only`: Button structure without concrete reference values.
- `01B - With reference`: the same contract with values/presence from a Button JSON reference.
- `01C - Typed values`: type information and concrete values shown together.
- `01D - Value states`: a separate generic Example illustrating value and absence states.
- `01E - Complex types`: generic type alternatives, free-key maps and recursive references.
- `01F - Primitive root`: a `Message` root of type `string | null` with reference value `"Ready"`,
  without child expansion.

Graph uses rounded nodes, curved connections and a side inspector. Clicking a card body selects
it and shows details; `+` / `-` independently expand or collapse children. Centered vector glyphs
are used for those controls. Outgoing connections share a white, outlined circular port centered
on the node's right edge; incoming connections have no port. Ports and lines use a two-pixel stroke.
Cards use vertical HUG sizing: their natural height follows the visible content with symmetric
padding, without reserving blank lines for absent content. Output ports remain vertically centered
when card heights change.
Graph uses fixed scale, horizontal/vertical scrolling and Space + drag, without zoom or Fit controls.

## Page 02 - Column view

- `02A - Type only`: four-column exploration of the Button type contract.
- `02B - With reference`: the same exploration with a concrete Button JSON reference.
- `02C - Typed values`: values displayed alongside their allowed types.
- `02D - Value states`: the separate generic Example in the column presentation.
- `02E - Primitive root`: the same `Message` root at level 1; remaining column positions are
  unopened placeholders, not additional levels in the type.

Columns reserve four desktop positions and show up to four levels of the branch. Selecting a property moves it to the top, reveals its
available description and opens its children in the next column. Siblings stay compact and retain
their relative order. Long stacks scroll vertically. The window advances as needed; arrows visit
only levels of the current branch, without history or a horizontal scrollbar. Choosing another
ancestor discards the descendant columns and opens the new branch.

A shared Graph / Columns selector resets selection, expansion and navigation/scroll positions
when switching modes. Already loaded type/reference inputs remain loaded; switching presentation
does not extract or load them again. The artboards are illustrative states, not executable transitions.

## Data, labels and examples

The type contract supplies structure. A JSON reference optionally adds concrete values and
presence information, without hiding contract properties. The root uses the type name or last
explicitly selected indexed property key, preserving case. Header source labels are explicit
context, not inferred facts about arbitrary JSON.

The primary label is the exact property key. A secondary line prefers extracted JSDoc `@summary`,
then a configured textual field from the reference object; it is omitted without either. The
Button source currently has no `@summary` tags, so type-only Button cards have no fabricated
semantic subtitles. Reference examples configured with `name` show actual values such as
`e1.name = "button"` and `e2.name = "button-text"`. The expanded description remains separate.

A separate synthetic `Example` demonstrates strings, arrays and indices, `false`, `null`, `""`,
`[]`, `{}`, an absent optional property and long text. Its authored JSDoc `@summary` labels
illustrate short labels versus full descriptions. `number | SizeMap`, a free-key `Record` and
recursive `ComplexExample[]` illustrate complex-type proposals in a separate `ComplexExample` contract. Their exact behavior remains subject to
visual review; these examples must not be confused with fields of the actual Button contract.
The primitive-root views show that a root need not be an object or expose children.

The absence states distinguish no reference JSON from a property absent in a supplied JSON,
explicit `null`, empty-but-present values and concrete values. JSON text cannot contain
`undefined`; an allowed `undefined` belongs to type information. These distinctions do not
implicitly represent validation errors.

Source content was checked against the Core Button contract and the Fluent Microsoft Button
reference on 2026-11-08. Mockups contain authored descriptions and synthetic example metadata;
they do not prove live JSDoc extraction, complete validation or runtime consumption. The sources
remain separate, and derived inspection files do not enter Kiskadee builds, artifacts or Showcase.
The approved implementation uses HTML/CSS cards, SVG connections and Dagre layout; see the
package-local contract for its current behavior.

## Preview inventory

Page 01 previews: `json-explorer-overview.png`, `json-explorer-graph-reference.png`,
`json-explorer-values.png`, `json-explorer-graph-value-states.png`, `json-explorer-graph-complex-types.png` and
`json-explorer-graph-primitive-root.png`.
Page 02 previews: `json-explorer-columns.png`, `json-explorer-columns-reference.png`,
`json-explorer-columns-values.png`, `json-explorer-columns-value-states.png` and
`json-explorer-columns-primitive-root.png`.

OpenPencil MCP operations must target the document and page explicitly. Raster exports also need
the target canvas to be active while other projects use the editor. The eleven previews above
were exported and visually inspected before the card-sizing follow-up. They do not yet show that
latest correction: the renderer became unavailable and reopening through MCP timed out.

The card-sizing follow-up was saved to the canonical file. Structural checks confirmed natural
heights and symmetric vertical padding for all 36 Graph cards, centered output ports, preserved
connection axes and an unchanged Column page. The saved archive passed its integrity check.
New raster verification remains pending recovery of the OpenPencil renderer. Original artboard
and card IDs were preserved. These checks concern the saved design, not browser implementation
validation; application checks are reported separately in the implementation handoff.
