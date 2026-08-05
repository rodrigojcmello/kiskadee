# Rejected: Consumer-Owned Interface Glyphs Only

The previous contract restricted `@kiskadee/icons` to brand marks and required every application
to import interface glyphs directly from Lucide or another provider. The Showcase kept a local
Lucide sample, and Kiskadee had no name-based lookup, family recommendation, or runtime selection.

That boundary was useful while Icon only demonstrated size, color, surface, and accessibility. It
was replaced because presets need to express their native icon-family recommendation and
applications need an optional, consistent way to switch complete families without embedding
provider-specific imports throughout component composition.

The replacement preserves the valuable parts of the old decision:

- direct arbitrary glyph composition remains supported;
- brand icons remain independent;
- the canonical catalog is intentionally curated rather than mirroring every upstream library;
- no preset imports, installs, or downloads an icon family;
- no missing glyph silently falls back to Lucide.
