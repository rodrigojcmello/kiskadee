# Social icon provenance

The `social` family exposes recognizable third-party network, platform, and product marks as
canonical SVG sources with generated React adapters, without treating those marks as
Kiskadee-authored artwork. The family name is retained for public API compatibility even though its
scope is broader than social networks.

## Contract

- Source artwork must come from the trademark owner's brand, press, or developer resources.
- Preserve the official silhouette and native coordinate system.
- A chromatic brand defaults to `presentation="brand"`. Every export also exposes
  `presentation="monochrome"` as a Kiskadee technical presentation for semantic component color.
- Brand and monochrome presentations of the same export must use the exact same `viewBox`. A
  presentation switch changes color treatment, never the public icon size or optical calibration.
- Keep platform-neutral SVGs free from React and accessibility defaults. Generated adapters own
  external `1em` sizing and decorative accessibility behavior.
- Every monochrome presentation renders entirely through `currentColor`, regardless of brand-color
  restrictions. Preserve fixed brand colors or an official gradient in the default `brand`
  presentation when color is part of the mark's identity.
- Do not optically redraw, round, or restroke a mark to match the Kiskadee family.
- Consumers must follow the owner's current trademark and minimum-size rules.
- These exports do not imply affiliation, endorsement, or a trademark license.

## Optical calibration

The `kiskadee-icon-svg-v2` manifest requires one icon-level `opticalTransform` for every social
mark. It compensates for differences in native artwork bounds and clear space without altering the
official geometry:

- `scale` changes the perceived size inside the shared icon viewport.
- `offsetX` and `offsetY` move the artwork by normalized fractions of the final viewport.
- The same transform applies to `brand` and `monochrome`; presentation-specific optical
  corrections are not allowed.
- Canonical files under `assets/social/` remain intact. Generation adjusts only the output
  `viewBox`, preserving paths, fills, gradients, strokes, and proportions.
- React adapters and the SVG files published under `dist/svg/social/` use the same calibrated
  representation. Consumers must not add brand-specific scale or position exceptions.
- The published `dist/icons.json` declares `assetState: "optically-calibrated"` and records the
  resolved value as `appliedOpticalTransform`. That field is provenance, not an instruction to
  transform the published SVG again.

`pnpm --filter @kiskadee/icons audit:optical` rasterizes the monochrome presentation at high
resolution and reports raw versus calibrated bounds, alpha coverage, center of mass, and clipping.
Those measurements make review repeatable and guard against accidental cropping, but they are only
diagnostic. Perceived weight is not reducible to one geometric metric, so every transform requires
final visual comparison and explicit human approval.

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
| `GeminiIcon` | Gemini | [Google Gemini](https://gemini.google.com/) |
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
| `RedditIcon` | Reddit | [Reddit brand resources](https://redditinc.com/brand) |
| `LinkedInIcon` | LinkedIn | [LinkedIn brand downloads](https://brand.linkedin.com/downloads) |
| `DiscordIcon` | Discord | [Discord branding](https://discord.com/branding) |
| `TwitchIcon` | Twitch | [Twitch brand assets](https://brand.twitch.com/) |
| `ThreadsIcon` | Threads | [Meta Threads brand resources](https://www.meta.com/brand/resources/instagram/threads/) |
| `MastodonIcon` | Mastodon | [Mastodon branding](https://joinmastodon.org/branding) |
| `GitHubIcon` | GitHub | [GitHub logo foundations](https://brand.github.com/foundations/logo) |
| `VimeoIcon` | Vimeo | [Vimeo media kit](https://vimeo.com/press/media-kit) |
| `SubstackIcon` | Substack | [Substack brand resources](https://substack.com/brand) |

## Known constraints

- Apple, ChatGPT, GitHub, Threads, and X use their owner-supported black/monochrome identity and
  therefore default to `currentColor`. Every other social export defaults to `brand`, while still
  exposing a Kiskadee `monochrome` presentation driven exclusively by `currentColor`.
- Apple's path is the unmodified regular-navigation mark published inline by Apple. Its coordinate
  box removes only the navigation bar's unused vertical area and retains clear space around every
  edge; the mark itself is neither cropped nor redrawn.
- Every other third-party export defaults to its official brand color treatment. Discord,
  Facebook, LinkedIn, Mastodon, Pinterest, Reddit, Snapchat, Telegram, Twitch, Vimeo, WhatsApp, and
  YouTube use their official fixed palettes. Instagram, Messenger, and TikTok preserve their
  multicolor or gradient identity.
- Reddit uses the current conversation-bubble icon from Reddit's brand system. Its technical
  monochrome presentation reuses the exact same paths and turns the white detail regions into
  negative space, so switching presentation never changes its silhouette or perceived size.
- Google and Microsoft retain their required multicolor identity in `brand`. Claude uses the
  standalone official symbol in Clay, without the rounded application tile. Gemini retains its
  official aurora color direction in a compact vector treatment. Their
  monochrome presentations preserve the same coordinate boxes and source geometry while following
  the consuming component's `currentColor`.
- Snapchat preserves the exact two-path Ghost construction distributed in Snap's official logo
  suite. Its brand presentation places the white Ghost and black outline on Snap Yellow; its
  monochrome presentation keeps the official outline geometry and follows the consuming
  component's `currentColor`.
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
- Reddit's brand presentation preserves the official OrangeRed conversation bubble. Its
  monochrome presentation composes those same paths with an even-odd fill, using `currentColor` for
  the bubble and transparent detail regions. The shared optical calibration adds safe clear space
  without changing construction between presentations.
- WeChat and LINE are not in this initial family because a public first-party vector kit suitable
  for redistribution was not found during this pass. Vimeo and Substack fill those two Showcase
  slots; this is a source-integrity decision, not a claim that they have larger audiences.
- Brand resources and trademark rules can change independently of this package. Recheck the linked
  first-party source before adding a new presentation, color variant, or marketing use.
