# Card Showcase

The `/card` content is an inspection sequence for the existing public Card contract. It must make
missing or similar visual treatments visible before a new border or surface mechanism is designed.

## Reading order

1. **Surfaces** groups Neutral and Primary separately, with the same ordered emphasis positions
   and repeated specimen content. An unavailable position says "Not published" instead of
   substituting a neighboring emphasis. Unavailable articles are hidden in the single-column layout
   below 480px of route width. The active canvas context determines availability.
   Independent controls inside the supporting Card select border and shadow for this matrix only.
   Border starts at **Adaptive** and offers Show, Hide and Preset default. Adaptive passes
   `border="adaptive"` explicitly, regardless of `options.border.defaultMode`.
   Shadow starts at **Default** (omitted, so the optional effect stays off) and offers Show and
   Hide. Changing either control preserves the other. A published shadow recipe identifies which
   effect Show activates; publishing the recipe does not enable it automatically. The controls
   do not affect Composition, other comparisons or CardAction.
   Controls align with the bottom of the heading/description block. The sidebar's Descriptions
   switch uses the shared display preference and hides explanatory copy, not specimen content.
   Surfaces specimens use Title and identical Lorem ipsum copy. Missing combinations show a
   circle-minus glyph through p-react Icon alongside Not published, without a fake Card surface.
   Intent headings use Text Low; missing-combination captions use Lowest. The repeated
   intent.emphasis footers are omitted because group and column headings identify each sample.
   Icon emphasis remains unchanged pending a separate foreground-inheritance contract.
2. **Composition** adapts the supplied Fluent UI Preview with real Card, Text, Switch, Slider,
   Badge and Button components. Neutral Low hosts the base Neutral Lowest panel, paired Neutral
   and Primary Medium tiles, a Neutral Low state strip and a Primary Highest action region.
   The tall Neutral Lowest panel explicitly enables its border to separate it from the outer band.
   Buttons replace tabs and the select in the reference rather than inventing local lookalikes.
   Presets missing required surfaces show an availability message. The shared theme and canvas
   remain active; each filled Card publishes its own content context.
   Slider is displayed only when its default palette is published for the active theme; Fluent
   currently has no Dark/Darker Slider palette. Those modes display an explicit availability note.
3. **Surface contexts** places the same published samples on canonical subtle and vivid Card
   hosts. These comparisons omit shadows. Hosts publish their own child context; Text and nested
   Cards consume it without local foreground or border overrides.
4. **Border & shadow** compares preset default, surface only, border only, shadow only,
   and border plus shadow through public Card props. The comparison prefers the first
   published canonical surface (Neutral Lowest in Fluent) and
   the selected static shadow level (otherwise the published medium or first fixed level).
   Its explicit cases remain independent of the Interaction controls.
5. **Shadow scale** previews only levels exposed through the public Card shadow artifact. Other
   global recipes remain textual documentation, never inline CSS shadow replicas.
6. **Interaction** distinguishes a passive Card containing a Button from CardAction selection,
   selected, disabled, selected-plus-disabled, visual Pending and interaction-locked examples.
   Interactive CardAction examples do not contain or visually overlay another Button. Local
   controls choose intent, emphasis, independent border and CardAction shadow. The passive Card's
   Button has its own shadow control, disabled when the active preset publishes no Button shadow.
   Only published surface combinations are offered; an unavailable choice after a
   theme/preset/intent change resolves to a published Medium or the first valid recipe.
   Pending is explicitly a visual preview: its activation counter continues to respond.
   Short property/value captions explain state without making JSX the primary documentation.

## Fluent scale migration (2026-09-04)

Transparent Lowest is removed. Old Low becomes Lowest for both intents; old Neutral Medium
becomes Low and old Neutral High becomes Medium. Primary Medium and Highest stay unchanged.
Primary Low and both High slots are absent. The ordered canonical surface catalog preserves
its colors and order, so the global default remains the light neutral canvas with base cards.
This intentionally changes the meaning of explicit Fluent Card emphasis props; it is not a
global change to Button, Text, or other presets' emphasis contracts.

## Ownership

The Base and complementary surfaces section has a local `Separators` switch,
off by default and wrapped in the same example Card as the other section controls.
A public Separator remains at each junction between the complementary header/footer
and the Card body; when off, visibility is hidden and the line keeps its layout space.
Primary examples choose the published Primary separator when available, preferring
Low for subtle surfaces and Medium for the Primary Highest vivid composition; other cases use a published
Neutral line. The switch appears only when the active preset publishes both
Separator and Switch for the section context. Route CSS only positions these
components; it does not author their line colors.

All content text uses `p-react` Text with preset typography and foreground profiles. Component
labels use their public slots. Route CSS owns only layout, comparison sizing, gaps and wrapping;
it does not author fill, stroke, radius, foreground, opacity or shadow recipes.

The shared background controls continue to own the canvas. Card specimens retain their explicit
intent and emphasis so choosing another canvas does not replace the recipe being inspected.
Radius is shared by the Card specimens. Surface matrix border and shadow controls stay local to
that section; Interaction has independent border, shadow and interaction-lock controls.
Card and CardAction own no padding. Content composes public Layout frames explicitly;
`clipContent` clips edge-to-edge compositions without supplying spacing.

The page consumes the independent static Card border contract. It does not infer border
colors from contrast or implement stroke recipes locally.

Quick settings follows the selected surface context. On subtle, a Neutral High (or the
next published neutral) Container band hosts a Neutral Card. On vivid, a Primary
Complementary Highest (or Primary Highest) band hosts a Primary Highest Card.
On subtle, both dividers use Neutral Low. On vivid, the upper divider uses
Neutral Medium, matching the Fluent Light Card's white 15% border. The lower
divider uses the published Primary Medium recipe when available, retaining
the dark line above the footer in Fluent Light. On vivid, the action and Settings
Buttons prefer Medium instead of High.
The volume area is layout inside the Card, separated by lines without painting another
surface. Fluent currently has no onVivid Slider recipe; its appearance there awaits
calibration. Action Buttons paint their own rounded surfaces without surrounding
Containers. The composition checks the published Card, Container, Button, Separator
and Text recipes for the selected theme and segment.

See [Showcase Content](./showcase-content.md) and
[Background Surface Catalogs](./background-surface-catalogs.md).

The Background picker is hidden on `/card`; Surface Context remains available. The Shell still
resolves the shared preset-derived canvas, including the default subtle surface when returning
from On vivid. The inline border and shadow controls remain independent.
