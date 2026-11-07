# Button Showcase

Surface contexts places each title and optional description inside its own Card, using the same
header and content layout as Intents. Titles and descriptions consume the context produced by
that Card; descriptions use the active caption profile and Medium emphasis and follow the
Descriptions preference.

The eight Surface contexts samples are ordinary action Buttons. They do not receive `toggle`,
`controlState`, `selectionEmphasis` or a local selection handler. Clicking them retains the normal
Hover, Focus and Pressed feedback without persistent selection or a selection indicator.

Surface contexts exposes a compact Alt Switch in each Card header, aligned to the right of its
title and description. Both start off and independently switch the color variant of their Card's Primary examples.
Each inherits its Card's produced Surface Context for paint and coverage checks. Without
Alternative coverage for Primary at any displayed emphasis, that Switch stays visible, disabled
and off. Each requested variant choice survives temporary loss of coverage.
Intents also exposes an independent Alt Switch in each intent Card header, initially off.
Coverage uses the Card-produced context and each emphasis; unsupported rows keep Standard.
When no displayed intent has Alternative coverage in that context, none of the Alt switches
render. If any displayed intent has coverage, all cards render a switch and unavailable
intents remain disabled. Restoring coverage preserves previously requested choices.
The switches preserve the Selected examples and their independent selection state.
Selection indicator retains its Small looping sequential Color variant Select, starting at Standard. Alternative availability comes from
`capabilities.colorVariants` in component metadata, scoped to the current segment, theme, surface,
intent and emphasis. Metadata discovery shares the JSON cache and does not load CSS or class maps.
The intent controls use the compact Standard and Alternative coordinate summaries; complete
per-state availability is consumed only from the active palette's descriptor.
Unavailable choices display Standard while preserving the requested variant for a supported
coordinate. The control qualifies the public Button intent (`primary-alt`, for example); there is
no public variant prop or independent indicator color selector. Indicator paint stays Standard
while following the effective semantic intent, emphasis and ambient context. Selections in the
other demonstrations stay intact.

Rich text, Pagination and Videoconferencing retain their four existing controls. Button intent and
Selection intent offer qualified choices such as Primary alt when metadata publishes the active
coordinate. Medium/High selection checks High coverage. Original preserves each example's full
base intent and variant; Same as button copies that effective pair. Changes to visual controls,
presets and surface contexts preserve the examples' behavior and stored selection.
An unavailable qualified selection intent falls back to Standard of the same semantic intent,
not to the base Button intent. Metadata requests wait for the matching preset manifest, so switching
presets cannot combine the previous preset's resource paths or revision with the new preset.
Pagination also retains its Radius control alongside the four paint controls.

Intents places the Rest only and Focus ring switches to the right of its description, vertically
centered, without a Card. If descriptions are hidden they move alongside the heading. A vertical
Separator sits between the switches when the current preset publishes it.
They use the surrounding surface context. Rest only disables and resets Focus ring; when enabled,
Focus ring projects the Focus sample. Selected examples use the default Lowest selection emphasis,
including in grouped examples. Simplified Rest samples do not opt into selection paint.

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
and the subtler Text only, Text and icon, Icon only, and Stacked composition headings use the active
preset's public Text profiles. Three public horizontal Separators divide the composition
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

Stacked presents Small, Medium, Large, and Large 2 with an icon above a single-line label.
Each size requires published scale recipes in all three optional anatomy elements: container
`e8`, label `e9`, and icon `e10`. Capability checks require the effective compact size in the
Builder-derived `layouts.stacked.sizesByRadius` metadata filtered by the effective radius, plus
the corresponding classes or shared `all` classes in all three elements and the matching `e8`
radius bucket (`rr`, `rp`, or `rs`), independently of preset identity. Shared classes alone cannot
prove that required geometry was published for a size. Missing recipes use the same Not published
indicator, preventing a horizontal fallback from appearing as a stacked example.

Stacked Buttons remain content-sized and centered in their comparison columns. Their rulers read
`inspection.elements.e8.scales._boxHeight`; the horizontal examples continue reading `e1`.
A Medium Neutral Low action with the canonical `plus` icon demonstrates activation and announces
the added-item count through preset Text. It is available only when that Medium stacked recipe
is published. The optional explanation follows the Descriptions preference.

## Videoconferencing option-bar examples

A Videoconferencing subsection of Compositions follows Rich text editor and presents Stacked and
Icon only option bars. Their English labels are Record, Chat, Share, People, Raise, React,
View, More, Camera, Mic, and Leave. Their canonical icons are `record`, `chat`, `screen-share`,
`users`, `hand`, `smile`, `grid`, `ellipsis`, `video`, `mic`, and `phone-hangup`, respectively.
Each resolves through the selected family and variant. Actions initially use Neutral Low, except
Share, which uses Positive Low, and Leave, which uses Destructive Low. Each bar is wrapped in
the shared Showcase example Card with Medium Layout padding. Buttons inherit that Card's produced
Surface Context rather than overriding it with the surrounding page context.

The example consumes the public Button API, the selected size (Medium by default), radius,
Surface Context, and fonts. It requires the effective size in the Builder-derived stacked-size
metadata filtered by the effective radius, the corresponding `e8`, `e9`, and `e10` class recipes,
and the matching `e8` radius bucket. Changing radius updates both Stacked demonstrations; recipes
published only for another radius remain unavailable. The option bar uses equal-width columns with a
four-rem minimum and intrinsic growth for the widest label at the selected size. Buttons fill
their cells without stretching to fill the Card. This is a Showcase composition constraint,
not a Button width recipe. A single row scrolls horizontally inside the Card instead of wrapping,
including on mobile. The scrollport leaves clearance for focus rings and remains a named group,
preserving native Tab navigation without introducing toolbar semantics or a new keyboard model.
Focusing an option scrolls its complete box into the nearest visible position, including inline
clearance for its focus ring; the browser's default focus scroll can otherwise reveal only part
of a cell.
Each option uses the public Button `toggle` and `controlState` APIs to expose its selection visually
and through `aria-pressed`. Stacked starts with Share and Raise selected; Icon only starts with
React and Leave selected, in those FIFO orders. Their selections are independent. Clicking an option
toggles it. At most two stay selected; selecting a
third removes the oldest selection. Deselecting and selecting an option again makes it the newest
selection. This route-local simulation applies to every option without implementing meeting
functionality, and displays no last-action status. The existing Stacked comparison in Sizes remains
independent.

## Selection indicator examples

The final Selection examples group appears after Async pending. It contains Selection behaviors,
which demonstrates Lowest, Low, Medium and High through `selectionEmphasis`, followed by
Selection indicator. Selection indicator availability comes from the active Button
artifact's complete indicator-size coverage for the selected radius, independently of preset ID.
Presets without a recipe use the existing Not published presentation.

Inside and Outside Cards demonstrate the same four intents at Low and High emphasis. Their Buttons
start selected and toggle independently, explicitly opting in with `selectionEmphasis="low"`. A Preset default
horizontal action follows the preset policy, while an I action opts in and demonstrates shrinking
below the nominal fixed line width in a narrow host. The Cards also contain a stacked action when supported,
a connected Group, and selected Disabled, Pending, and aria-disabled actions. Unavailable controls
preserve their semantic selection but suppress the indicator. The existing Stacked option bar
retains its two-selection FIFO simulation and receives the preset's default indicator placement.

All indicator colors, dimensions, and radii come from the Button recipe. Showcase CSS owns only
the comparison layout and clearance around the external paint. It does not measure or resize
the Button to accommodate the indicator. Themes, segments, fonts, contexts, and radius controls
remain ordinary public component inputs. Inside selects `e11` and Outside selects `e12` for one
indicator. Both keep Standard paint; the Color variant control changes the Button body only.
The Showcase does not force a context from placement or author palette colors. Availability is
checked independently for each recipe.

See the [state-indicator definition](../../../../docs/definitions/state-indicators.md).

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
