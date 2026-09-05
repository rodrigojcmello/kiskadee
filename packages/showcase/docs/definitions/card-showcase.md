# Card Showcase

The `/card` content is an inspection sequence for the existing public Card contract. It must make
missing or similar visual treatments visible before a new border or surface mechanism is designed.

## Reading order

1. **Surfaces** groups Neutral and Primary separately, with the same ordered emphasis positions
   and repeated specimen content. An unavailable position says "Not published" instead of
   substituting a neighboring emphasis. The active canvas context determines availability.
2. **Composition** adapts the supplied Fluent UI Preview with real Card, Text, Switch, Slider,
   Badge and Button components. Neutral Low hosts the base Neutral Lowest panel, paired Neutral
   and Primary Medium tiles, a Neutral Low state strip and a Primary Highest action region.
   The base border remains visible; this is not a pixel-exact copy of the borderless reference.
   Buttons replace tabs and the select in the reference rather than inventing local lookalikes.
   Presets missing required surfaces show an availability message. The shared theme and canvas
   remain active; each filled Card publishes its own content context.
   Slider is displayed only when its default palette is published for the active theme; Fluent
   currently has no Dark/Darker Slider palette. Those modes display an explicit availability note.
3. **Surface contexts** places the same published samples on canonical subtle and vivid Card
   hosts. These comparisons omit shadows. Hosts publish their own child context; Text and nested
   Cards consume it without local foreground or border overrides.
4. **Border & shadow** compares the same base surface with no shadow, shadow with its border
   hidden, and shadow with its authored border preserved. The comparison prefers the first
   published canonical surface (Neutral Lowest in Fluent) and
   the selected static shadow level (otherwise the published medium or first fixed level).
   Its three explicit cases remain independent of the panel's preserve-border toggle.
5. **Shadow scale** previews only levels exposed through the public Card shadow artifact. Other
   global recipes remain textual documentation, never inline CSS shadow replicas.
6. **Interaction** distinguishes a passive Card containing a Button from CardAction selection,
   selected, disabled and interaction-locked examples. Interactive CardAction examples do not
   contain or visually overlay another Button. Local p-react Button controls choose intent and
   emphasis for all five specimens. Only published combinations are offered; an unavailable choice
   after a theme/preset/intent change resolves to a published Medium or the first valid recipe.

## Fluent scale migration (2026-09-04)

Transparent Lowest is removed. Old Low becomes Lowest for both intents; old Neutral Medium
becomes Low and old Neutral High becomes Medium. Primary Medium and Highest stay unchanged.
Primary Low and both High slots are absent. The ordered canonical surface catalog preserves
its colors and order, so the global default remains the light neutral canvas with base cards.
This intentionally changes the meaning of explicit Fluent Card emphasis props; it is not a
global change to Button, Text, or other presets' emphasis contracts.

## Ownership

All content text uses `p-react` Text with preset typography and foreground profiles. Component
labels use their public slots. Route CSS owns only layout, comparison sizing, gaps and wrapping;
it does not author fill, stroke, radius, foreground, opacity or shadow recipes.

The shared background controls continue to own the canvas. Card specimens retain their explicit
intent and emphasis so choosing another canvas does not replace the recipe being inspected.
Radius, static shadow and border-preservation controls apply to the surface matrix and passive
example; CardAction keeps its existing independent shadow and interaction-lock controls.

The page demonstrates current behavior. It does not infer borders from contrast or add an
independent border option to Card.

See [Showcase Content](./showcase-content.md) and
[Background Surface Catalogs](./background-surface-catalogs.md).
