# Select

Select is an independent schema component, presented by p-react and operated by Headless Select.
It does not consume or transform a TextField schema. Presets may share small authoring recipes
for compatible colors, contours, typography and sizes; each component maps them to its own slots.

The initial variant is `standard`, with `outline`, `underline` and `borderless` modes. The default
mode is published in `options.mode` (outline). There is no Floating, emphasis hierarchy, editable
input, filtering, multiple selection or read-only contract in this version.

| Element | Ownership |
| --- | --- |
| e1 | Root stack |
| e2 | Label |
| e3 | Control row |
| e4 | Trigger shell |
| e5 | Confirmed value |
| e6 | Chevron |
| e7 | Bottom indicator |
| e8 | Previous control |
| e9 | Next control |
| e10 | Supporting message |
| e11 | Placeholder |
| e12 | Shared decorative divider recipe for the two sequential boundaries |
| e13 | List positioner geometry |

The [p-react visual anatomy](../../../components/react/docs/definitions/select.md#visual-anatomy)
illustrates how these elements compose in the Web control and how its open list reuses the
independent Dropdown presentation. The diagrams do not change this framework-neutral contract.

`sequential` adds independently focusable Previous/Next buttons; `loop` enables wrapping for those
buttons only and defaults to false. Both apply to every mode. They confirm adjacent enabled values
without opening the list. Focus on these buttons must not project trigger focus or expand e7.
`showChevron` controls only the disclosure glyph, independently of `sequential` and `loop`; hiding
it does not disable the trigger or remove its accessible name.
Headless owns disabled options, boundaries, zero/one enabled option behavior and all keyboard and
selection semantics. Active listbox option and committed selection are distinct.

The visual list composes Dropdown presentation with Headless Select option semantics. Without a
Select recipe, p-react renders the same functional headless root with a raw list, accessible labels
and textual Previous/Next controls. It must not borrow another preset's styles, require Dropdown
or icons, or reset selection when the preset changes. An absent manifest entry is unsupported
styling; a declared artifact failing to load remains a diagnosable resource error.

## Unified control surface and focus presentation

The control row (e3) owns the shared outer surface, contour, radius and total height, whether or
not sequential navigation is present. The trigger (e4) and Previous/Next (e8/e9) remain separate
interactive regions inside that surface. Their focus must never be inferred from focus-within on e3.
The optional bottom indicator (e7) spans the shared control surface. Its paint scope does not change
its activation owner: only trigger focus can expand it or activate its focus color.

`focusIndicator` selects exactly one trigger-focus presentation:

- `underline` (default) expands e7 while the trigger owns focus.
- `inner` paints a keyboard-visible ring around e4, inside the common control surface.
- `outer` paints a keyboard-visible ring around e3 while the trigger owns focus.

Previous/Next always retain their own keyboard-visible rings; their focus does not activate the
trigger's inner ring, outer ring or underline. The three controls remain separate keyboard stops.
The control's internal paint can be clipped, but the shared surface must not clip those focus rings.

`focusRingColorSource` selects `global` (default) or `component`. Global uses the theme's canonical
focus color. Component uses the participating element's authored focus border color (e4 for inner,
e3 for outer), or e7's authored focus box color for underline; focus geometry continues to consume
the canonical global focus width and offset.
A persistent Rest border is independent of focus, committed value and active listbox option. Do not
force a focus state to keep a border visible; author the base border in its element palette.

Presentation options (`focusIndicator`, `focusRingColorSource`, `showDividers`) may be declared on
the component and each mode. Resolution order is explicit public props, active mode options,
component options, then contract defaults. `variant`, the default `mode` and density remain component
options. Mode options choose behavior; concrete colors and geometry stay on their owning elements.

## Sequential dividers

`showDividers` defaults to false. When enabled, sequential composition renders e12 at both
Previous/trigger and trigger/Next boundaries. e12 is a passive, decorative slot without focus,
interaction states or standalone Separator semantics. It references `global.separators` with the
existing `ElementSeparator` grammar; the profile owns thickness and Rest color for every theme and
surface context. Optional `boxHeight` defines the local extent. The slot must not author another thickness or color outside that profile.
Both occurrences share one recipe; no asymmetric boundary contract is introduced.
Without a local extent, the Web line consumes the common control's authored nominal height.
Presets calibrate the local extent to keep the complete line inside the control; structural CSS
does not synthesize or subtract another element's geometry.

Dividers are available only with sequential composition and a declared e12 recipe. Unstyled Select
remains functional without adding replacement divider styles or depending on the public Separator
component. A declared separator profile that cannot be resolved is a build error, not an absent
visual treatment to replace at runtime.

## Slot-specific style grammar

The Zod grammar and exported `SelectElements` type restrict each slot independently. All slots
accept `name`; only the fields below are additionally supported. `padding*` means the four physical
padding sides, and `borderRadius` retains Rounded, Square and Pill scales.

| Slot | Scales | Palettes | Other |
| --- | --- | --- | --- |
| e1 root | None | None | None |
| e2 label | marginBottom | textColor | typography |
| e3 common surface | boxHeight, borderWidth, borderRadius, padding* | boxColor, borderColor, borderBottomColor | decorations.borderStyle |
| e4 trigger | borderWidth, borderRadius, padding* | boxColor, borderColor, borderBottomColor | decorations.borderStyle |
| e5 value | None | textColor | typography |
| e6 chevron | boxWidth, boxHeight, marginLeft | textColor | None |
| e7 indicator | boxHeight | boxColor | None |
| e8 previous | boxWidth, borderWidth, borderRadius, padding*, marginRight | boxColor, textColor | typography |
| e9 next | boxWidth, borderWidth, borderRadius, padding*, marginLeft | boxColor, textColor | typography |
| e10 message | marginTop | textColor | typography |
| e11 placeholder | None | textColor | typography |
| e12 divider | boxHeight | Profile-owned | separator (required) |
| e13 positioner | marginTop, padding* (required when present) | None | None |

This surface is the union of actual Fluent and Sandbox styling needs, not a general CSS property
bag. Effects and unused spacing/paint fields are not reserved for hypothetical presets. Add a field
when a concrete composition needs it, with its consumption and validation documented.

The 2026-10-02 audit removed authored `boxHeight` from e4/e8/e9 in both presets: Web emitted only a
`--k-bxh` token there, while those controls stretch inside e3 and have no consumer for their local
height token. e3 remains the nominal height owner. e7's height paints the resting indicator; e6's
height sizes the glyph; e12's height sizes the separator. Those are independent, consumed dimensions.
The audit also removed unused e12 block margins from the accepted grammar. Generated direct padding,
radius and typography remain supported on their actual owners; absence of a Sass variable read does
not imply absence of a generated CSS consumer. Focus palettes remain available for public focus
presentation overrides even when a preset uses another default.

## List positioner geometry

e13 owns only the list-to-anchor distance (`marginTop`) and physical viewport collision clearances
(`paddingTop/Right/Bottom/Left`). It does not paint the Dropdown surface. All five scales are required
when the optional slot is authored, and support the ordinary size/density maps. The margin names the
anchor gap even when collision handling flips the list above the trigger; it is not a DOM margin.
Web Builder emits these as tokens on the portalled positioner. p-react reads the resolved pixel
geometry and passes it to Headless positioning, without another fallback distance. Without e13,
Select applies no added anchor gap or collision clearance. Dropdown continues to own list paint.
