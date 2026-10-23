# Button Showcase

Surface contexts places each title and optional description inside its own Card, using the same
header and content layout as Intents. Titles and descriptions consume the context produced by
that Card; descriptions use the active caption profile and Medium emphasis and follow the
Descriptions preference.

The Button route preserves comparison positions for unpublished sizes and optional interaction
states. These positions use a route-local `ButtonUnavailableExample` rather than a substitute
Button. Existing availability rules remain responsible for deciding when to show the indicator.

The indicator composes public Text and Icon components: the active caption profile, neutral Low
foreground, an inherited icon color and preset-owned icon dimensions. The canonical `ban` artwork
resolves through the selected icon family and variant. Showcase CSS owns only layout and gaps.

The visible label is `Not published`. The Icon exposes a contextual accessible description naming
the absent size or state; the visible label is hidden from assistive technology to avoid duplicate
announcements. The indicator adds no focus stop. Theme, Surface Context and family changes follow
the same public component contracts as the surrounding examples.

The `Sizes` section appears immediately before `Activation Feedback Profiles`. Its section title
and the subtler Text only, Text and icon, and Icon only composition headings use the active
preset's public Text profiles. Two public horizontal Separators divide the composition
subsections, using Neutral intent and Low emphasis when that recipe is published for the active
segment, theme and Surface Context. Showcase CSS owns the spacing around headings and Separators;
their visual presentation remains preset-owned.

Sizes uses shared control and inspection-detail rows, keeping unavailable indicators
vertically centered against the Buttons rather than their inspection descriptions. Icon-only
Buttons remain compact and centered horizontally within their columns, with the ruler at logical
end. These examples use High Button emphasis; the ruler stays at Lowest and the indicator at Low.

Ruler labels use the next smaller published typography profile with the same font and weight as
the active caption. When no compatible smaller profile is published, they retain that caption.
The typography artifact is loaded once by the route. Measurement details keep their caption
profile; the ruler's reference height and the measured Button geometry are unchanged.

## Icon format fixtures

`public/fixtures/button/icon-formats/` contains 128 x 128 rasterizations of the public
`@kiskadee/icons/social/GoogleIcon` brand/mark renderer, including its normalized viewBox.
Canonical artwork and provenance remain in `packages/icons/assets/social/google.brand.svg`
and `packages/icons/metadata/icons.json`; raster files are derived consumer fixtures.

Regenerate from the repository root with
`node packages/showcase/scripts/generate-button-icon-fixtures.ts` after building Icons.
The script uses React server rendering and Sharp supplied by Next.js (currently 0.34.5).
PNG and lossless WebP preserve transparency; JPEG uses white backing at quality 95.
The Showcase performs no additional resizing or color adjustment; Button.Icon consumes the
active preset's viewport. Provenance lives here rather than being served from `public/`.
