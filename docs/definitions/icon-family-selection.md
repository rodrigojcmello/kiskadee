# Icon Family Selection

Kiskadee separates recommendation, availability, selection, preparation, rendering, and component
styling.

1. A preset may recommend one semantic family ID through `global.icons.family`.
2. An application registers direct definitions or a lazy catalog.
3. `IconFamilyProvider` resolves explicit selection, preset recommendation, application default,
   then a sole registered family.
4. The selected module and optional preparation run only in the browser and only when needed.
5. `Icon` or `IconGlyph` resolves a semantic name against the effective family.
6. The consuming component keeps ownership of all color, size, surface, semantics, and slot style.

For example, Button may place a direct brand mark inside its optional `e4` contrast surface.
Changing the interface icon family still changes only glyph geometry; it never enables, colors, or
removes that Button-owned surface.

The schema contains no imports, URLs, components, glyphs, variants, or loaders. Build artifacts
preserve the recommendation in `global.kiskadee.json` and publish only the selected ID in
`manifest.icons.family`.

The provider preserves the previous effective family while a new family loads or when preparation
fails. Concurrent work is deduplicated, successful work is reused, and failures can be retried.
There is no implicit per-glyph fallback or family mixing.

Applications with one family can register it statically. Applications with segment- or
preset-specific families can provide their own definitions and lazy entries without modifying
Kiskadee. Arbitrary direct glyph nodes remain supported for concepts outside the canonical map.

Font families and icon families intentionally share this vocabulary and lifecycle but keep
separate implementations. Fonts project semantic CSS variables; icon families resolve executable
presentation renderers and therefore do not use CSS variables for family selection.
