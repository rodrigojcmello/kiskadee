# iOS 27 Icon Evidence

## Sources And Coverage

- [Apple SF Symbols](https://developer.apple.com/sf-symbols/) and
  [SF Symbols HIG](https://developer.apple.com/design/human-interface-guidelines/sf-symbols).
- [Apple label and accent evidence](../colors/ios-27-color-evidence.md).
- [Existing interface icon provenance](../source-evidence.md#interface-icon-evidence).

**Official adapted:** recommend `sf-symbols.regular`, preserve the approved size catalog, and
use Primary Label or the active Accent for monochrome artwork. **Kiskadee extension:** the existing
Web Iconoir fallback, normalized 14/16/20/24/32 viewport sizes, and colors on vivid surfaces.

## Schema Mapping And Color Provenance

`icon.e1.iconSize` references existing global size IDs; it authors no independent box metrics.
`icon.neutral` resolves Labels/Primary with physical black L100 / white D100 from approved Apple
Gray. `icon.primary` resolves the Primary family's `vivid` reference independently in Light/Dark.
Darker reuses Dark foregrounds. On vivid surfaces, Neutral is physical white (L0), and Primary
uses its Light `subtle -2` reference. These recipes target the canonical strong blue canvas and
are **Kiskadee extensions**. Literal colors never appear in the schema.

The existing `foreground="inherit"` remains consumer-owned and can inherit Text's emphasis.
Multicolor symbols, variable symbol rendering, genuine SF Symbols Web assets and scene-relative
vibrancy are **Deferred**; this change does not replace the icon implementation or import assets.

## Validation

Check every size reference, emitted palette for all three themes and both contexts, and standalone
Icon plus icons inheriting foreground from text. See [verification ledger](../polish-verification.md).
