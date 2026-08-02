# Social icon provenance

The `social` family exposes recognizable third-party network, platform, and product marks as
canonical SVG sources with generated React adapters, without treating those marks as
Kiskadee-authored artwork. The family name is retained for public API compatibility even though its
scope is broader than social networks.

## Contract

- Source artwork must come from the trademark owner's brand, press, or developer resources.
- Preserve the official silhouette and native coordinate system.
- A construction represents one official geometry. A presentation represents one paint treatment
  of that geometry.
- Every export defaults to `presentation="brand"`. Most use `construction="mark"`; Reddit and
  Snapchat deliberately default to `construction="contained"`.
- A `brand` presentation preserves paint owned by the trademark holder. It may be multicolor,
  gradient, or a single fixed Black.
- Every export exposes at least one `presentation="monochrome"` as a Kiskadee technical
  presentation for semantic component color through `currentColor`.
- Presentations inside the same construction must use the exact same `viewBox`, footprint, and
  optical calibration. Different constructions may have different geometry and calibration.
- Keep platform-neutral SVGs free from React and accessibility defaults. Generated adapters own
  external `1em` sizing and decorative accessibility behavior.
- Every monochrome presentation renders entirely through `currentColor`, regardless of brand-color
  restrictions. Preserve fixed brand colors or an official gradient in the default `brand`
  presentation when color is part of the mark's identity.
- A brand-specific adaptive presentation may combine fixed and contextual paint only when that
  composition is required to preserve recognition across component surfaces. Its name must state
  what adapts; it is not another monochrome mode.
- Do not optically redraw, round, or restroke a mark to match the Kiskadee family.
- Consumers must follow the owner's current trademark and minimum-size rules.
- These exports do not imply affiliation, endorsement, or a trademark license.

## Constructions and optical calibration

The `kiskadee-icon-svg-v4` manifest requires one `opticalTransform` per construction. It compensates
for differences in native artwork bounds and clear space without altering the official geometry:

- `scale` changes the perceived size inside the shared icon viewport.
- `offsetX` and `offsetY` move the artwork by normalized fractions of the final viewport.
- The same transform applies to every presentation inside the construction; presentation-specific
  optical corrections are not allowed.
- Canonical files under `assets/social/` remain intact. Generation adjusts only the output
  `viewBox`, preserving paths, fills, gradients, strokes, and proportions.
- React adapters and the SVG files published under `dist/svg/social/` use the same calibrated
  representation. Consumers must not add brand-specific scale or position exceptions.
- The published `dist/icons.json` declares `assetState: "optically-calibrated"` and records the
  resolved value as `appliedOpticalTransform`. That field is provenance, not an instruction to
  transform the published SVG again.

`pnpm --filter @kiskadee/icons audit:optical` rasterizes every construction and presentation at
high resolution and reports raw versus calibrated bounds, alpha coverage, center of mass, and
clipping. It uses the monochrome presentation as a comparable baseline when available, otherwise
the construction default. Those measurements make review repeatable and guard against accidental
cropping, but they are only diagnostic. Perceived weight is not reducible to one geometric metric,
so every transform requires final visual comparison and explicit human approval.

Construction selection is always explicit. The package does not inspect icon size, component,
surface, viewport, or platform to choose a logo automatically.

## Reddit constructions

The normalized Reddit source set is the first multi-construction contract:

| Construction | Presentation | Official source | Normalization |
| --- | --- | --- | --- |
| `contained` | `brand` | `Reddit_Icon_FullColor` | Platform-neutral SVG only |
| `contained` | `monochrome` | `Reddit_Icon_2Color` | Maps the OrangeRed field to `currentColor` and cuts the White mark out as transparent negative space |
| `mark` | `brand` | `FullColor_Bleed` | Removes only the OrangeRed field |
| `mark` | `monochrome` | `2Color_FullBleed` | Removes the OrangeRed field and maps the mark to `currentColor`; eyes, mouth, and internal spaces remain transparent |

The official files are preserved unchanged under `assets/sources/reddit/`. Generated adapters and
published SVGs consume the normalized files under `assets/social/`.

`contained.brand` is the Reddit default. Its `monochrome` counterpart is a Kiskadee technical
presentation derived from the official two-color construction: the field follows `currentColor`
and the source's White artwork becomes transparent negative space. `mark` means the official symbol
without a framing shape; it does not mean responsive, reduced, or optically small artwork.

The two constructions intentionally use different optical scales. The contained speech-bubble
field carries substantially more visual mass, so it is reduced to `0.76`; the standalone mark is
raised to `1.10`. This balances the complete logos rather than forcing the Snoo head to occupy the
same geometric size in both constructions.

## Snapchat constructions

Snapchat uses one official Ghost geometry with surface-specific paint treatments:

| Construction | Presentation | Paint contract |
| --- | --- | --- |
| `contained` | `brand` | Snap Yellow container, fixed White Ghost, and fixed Black outline |
| `mark` | `brand` | Fixed White Ghost and fixed Black outline, without the container |
| `mark` | `monochrome` | `currentColor` outline with transparent interior |
| `mark` | `adaptiveOutline` | Fixed White Ghost with a `currentColor` outline |

`contained.brand` remains the default so the no-prop rendering preserves the established Snapchat
identity. `mark.adaptiveOutline` is a Kiskadee composition treatment for high-emphasis component
surfaces: the component supplies the field color, White remains part of the Ghost, and only its
outline follows contextual content color. It is intentionally not classified as `monochrome`.

The `/icons` Showcase keeps Snapchat in one card because the underlying Ghost does not change, but
samples only `contained.brand` and `mark.monochrome`, labeled `brand` and `monochrome`. The second
sample uses only the contextual Ghost outline with a transparent interior so it remains legible
across subtle and vivid surfaces. Reddit remains split by construction because its contained
speech bubble and standalone Snoo are distinct logos.

The list is a practical July 2026 snapshot of widely used networks, login providers, and AI
platforms for the Button Showcase. It is not a stable numeric ranking: audience figures published
by different platforms are not directly comparable. The social selection was checked against the
[Digital 2026 Global Overview Report](https://datareportal.com/reports/digital-2026-global-overview-report).

## Sources

| Export | Network | First-party source |
| --- | --- | --- |
| `AppleIcon` | Apple | [Apple global navigation](https://www.apple.com/) |
| `GoogleIcon` | Google | [Sign in with Google branding guidelines](https://developers.google.com/identity/branding-guidelines) |
| `MicrosoftIcon` | Microsoft | [Microsoft identity platform branding](https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-branding-in-apps) |
| `ChatGPTIcon` | ChatGPT | [OpenAI brand guidelines](https://openai.com/brand/) |
| `ClaudeIcon` | Claude | [Anthropic press kit](https://www.anthropic.com/press-kit) (standalone Claude symbol) |
| `GeminiIcon` | Gemini | [Current Gemini product surface](https://gemini.google/about/) and [Google's four-color Spark announcement](https://blog.google/company-news/inside-google/company-announcements/gradient-g-logo-design/) |
| `FacebookIcon` | Facebook | [Meta Facebook logo resources](https://www.meta.com/brand/resources/facebook/logo/) |
| `YouTubeIcon` | YouTube | [YouTube icon guidelines and downloads](https://brand.youtube/youtube-icon) |
| `WhatsAppIcon` | WhatsApp | [Meta WhatsApp brand resources](https://www.meta.com/brand/resources/whatsapp/whatsapp-brand/) |
| `InstagramIcon` | Instagram | [Meta Instagram brand resources](https://www.meta.com/brand/resources/instagram/instagram-brand/) |
| `TikTokIcon` | TikTok | [TikTok developer design guidelines](https://developers.tiktok.com/doc/getting-started-design-guidelines) |
| `MessengerIcon` | Messenger | [Meta Messenger icon resources](https://www.meta.com/brand/resources/facebook/messenger-icon/) |
| `TelegramIcon` | Telegram | [Telegram press assets](https://telegram.org/press) (`Logo.svg`) |
| `SnapchatIcon` | Snapchat | [Snap brand guidelines](https://www.snap.com/brand-guidelines?lang=en-US) |
| `XIcon` | X | [X brand toolkit](https://about.x.com/en/who-we-are/brand-toolkit) |
| `PinterestIcon` | Pinterest | [Pinterest brand guidelines](https://business.pinterest.com/en-us/brand-guidelines/?change_language=true) |
| `RedditIcon` | Reddit | [Reddit Brand System logo](https://redditbrand.lingoapp.com/s/Logo-d9x3n2?v=44) |
| `LinkedInIcon` | LinkedIn | [LinkedIn brand downloads](https://brand.linkedin.com/downloads) |
| `DiscordIcon` | Discord | [Discord branding](https://discord.com/branding) |
| `TwitchIcon` | Twitch | [Twitch brand assets](https://brand.twitch.com/) |
| `ThreadsIcon` | Threads | [Meta Threads brand resources](https://www.meta.com/brand/resources/instagram/threads/) |
| `MastodonIcon` | Mastodon | [Mastodon branding](https://joinmastodon.org/branding) |
| `GitHubIcon` | GitHub | [GitHub logo foundations](https://brand.github.com/foundations/logo) |
| `VimeoIcon` | Vimeo | [Vimeo media kit](https://vimeo.com/press/media-kit) |
| `SubstackIcon` | Substack | [Substack brand resources](https://substack.com/brand) |

## Known constraints

- Apple, ChatGPT, GitHub, Threads, and X expose their owner-supported Black identity as a fixed
  `brand` presentation and default to it. Their separate Kiskadee `monochrome` presentation uses
  the same geometry but follows `currentColor`, just like every other social export.
- Apple's path is the unmodified regular-navigation mark published inline by Apple. Its coordinate
  box removes only the navigation bar's unused vertical area and retains clear space around every
  edge; the mark itself is neither cropped nor redrawn.
- Every other third-party export defaults to its official brand color treatment. Discord,
  Facebook, LinkedIn, Mastodon, Pinterest, Snapchat, Telegram, Twitch, Vimeo, WhatsApp, and
  YouTube use their official fixed palettes. Instagram, Messenger, and TikTok preserve their
  multicolor or gradient identity.
- Reddit exposes the official contained and mark geometries described above. Each construction has
  an official full-color `brand` presentation and a technical `monochrome` presentation driven by
  `currentColor`. Both monochrome assets use transparent negative space for their internal detail.
- Google and Microsoft retain their required multicolor identity in `brand`. Claude uses the
  standalone official symbol in Clay, without the rounded application tile. Gemini uses the
  four-color Spark published on the official Gemini surface after Google introduced the brighter
  gradient treatment in 2025. Its normalized asset removes only the Gemini wordmark. Their
  monochrome presentations preserve the same coordinate boxes and source geometry while following
  the consuming component's `currentColor`.
- Snapchat preserves the exact two-path Ghost construction distributed in Snap's official logo
  suite. The contained brand asset owns Snap Yellow, while the three mark presentations separate
  fixed brand paint, transparent one-color paint, and the White-plus-contextual
  `adaptiveOutline` treatment.
- Substack uses the exact three-path mark published by Substack in both presentations. `brand`
  renders those paths in official Orange `#FF6719`; `monochrome` changes only the color treatment
  to `currentColor`, without adding a tile, gradient, or alternate silhouette.
- The Kiskadee monochrome presentation is not permission to recolor a trademark in marketing
  material. Before publishing a brand use, revisit the current owner guidance and prefer the
  default `brand` presentation.
- TikTok uses the official developer glyph and official cyan, red, and black palette with its
  presentation box cropped around the glyph.
- Telegram uses the complete official circular gradient logo. The monochrome presentation preserves
  the exact circle and paper-plane geometry while following `currentColor`.
- Reddit silhouettes are intentionally not published. The rejected geometry and rationale are
  recorded in [`silhouette-brand-icons.md`](../rejected/silhouette-brand-icons.md).
- WeChat and LINE are not in this initial family because a public first-party vector kit suitable
  for redistribution was not found during this pass. Vimeo and Substack fill those two Showcase
  slots; this is a source-integrity decision, not a claim that they have larger audiences.
- Brand resources and trademark rules can change independently of this package. Recheck the linked
  first-party source before adding a new presentation, color variant, or marketing use.
