# Carbon Icon Evidence

## Sources

- [Carbon icon usage](https://carbondesignsystem.com/elements/icons/usage/) and [code](https://carbondesignsystem.com/elements/icons/code/).
- [Preview color tokens](https://preview.carbondesignsystem.com/building-blocks/foundations/color/tokens).
- [Carbon v11 community file](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/-v11--Carbon-Design-System--Community-?node-id=58-2763): file `MfGzFa79SfhHQ2mKpC3ss4`, supplied node `58:2763`; [captured theme variables](../colors/figma-theme-tokens.json).

## Source Coverage

| Area | Status | Decision |
| --- | --- | --- |
| Official Carbon icon family and 16/20/24/32 source sizes | **Official adapted** | The existing canonical Kiskadee family adapter selects Carbon glyphs. |
| Monochrome primary, interactive and on-color paint | **Official adapted** | Resolve the respective theme token through the strict preset color resolver. |
| 12/28/48 icon output sizes | **Kiskadee extension** | Scale the existing artwork for Kiskadee's complete public size vocabulary. |

## Color And Token Provenance

| Token | White | G90 / G100 | Kiskadee mapping |
| --- | --- | --- | --- |
| icon-primary | Gray 100 `#161616` | Gray 10 `#f4f4f4` | `e1.onSubtle.neutral.medium`, role `icon.neutral` |
| icon-interactive | Blue 60 `#0f62fe` | physical white | `e1.onSubtle.primary.medium`, role `icon.primary` for the chromatic source |
| icon-on-color | physical white | physical white | both intents onVivid medium |

Theme tokens use evidence-backed `exact` lookups registered as `source.tokens`; white is a physical light `cap`. Exact tonal positions and generated color distances are retained by the preset's color mapping. No color literals are authored in Icon or its semantic roles.

## Schema Mapping

`e1` owns glyph color and size. The global recommendation remains `carbon` / `regular`; that variant name is Kiskadee's existing normalized Carbon adapter profile. Brand and multicolor artwork retain their own paint under the existing Icon behavior. No new icon mapping or runtime functionality is introduced.

Icon does not author interactive states merely to fill a matrix. Containing components own their state-dependent foregrounds. Both neutral and primary medium are available in Light, Dark, Darker and onSubtle/onVivid contexts.

## Validation

Theme tokens were checked against the captured Figma variables and preview documentation. Full preset generation and rendering are integration checks, not independent visual certification of every glyph.
