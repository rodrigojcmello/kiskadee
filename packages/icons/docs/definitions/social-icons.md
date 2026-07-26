# Social icon provenance

The `social` family exposes recognizable network marks through the same React and accessibility
contract as the rest of `@kiskadee/icons`, without treating those marks as Kiskadee-authored
artwork.

## Contract

- Source artwork must come from the trademark owner's brand, press, or developer resources.
- Preserve the official silhouette and native coordinate system.
- Normalize only the React wrapper, external `1em` size, decorative accessibility defaults, and
  an official monochrome treatment through `currentColor`.
- Do not optically redraw, round, or restroke a mark to match the Kiskadee family.
- Consumers must follow the owner's current trademark and minimum-size rules.
- These exports do not imply affiliation, endorsement, or a trademark license.

The list is a practical July 2026 snapshot of widely used social and community platforms for the
Button Showcase. It is not a stable numeric ranking: audience figures published by different
platforms are not directly comparable. The broad selection was checked against the
[Digital 2026 Global Overview Report](https://datareportal.com/reports/digital-2026-global-overview-report).

## Sources

| Export | Network | First-party source |
| --- | --- | --- |
| `FacebookIcon` | Facebook | [Meta Facebook logo resources](https://www.meta.com/brand/resources/facebook/logo/) |
| `YouTubeIcon` | YouTube | [YouTube icon guidelines and downloads](https://brand.youtube/youtube-icon) |
| `WhatsAppIcon` | WhatsApp | [Meta WhatsApp brand resources](https://www.meta.com/brand/resources/whatsapp/whatsapp-brand/) |
| `InstagramIcon` | Instagram | [Meta Instagram brand resources](https://www.meta.com/brand/resources/instagram/instagram-brand/) |
| `TikTokIcon` | TikTok | [TikTok developer design guidelines](https://developers.tiktok.com/doc/getting-started-design-guidelines) |
| `MessengerIcon` | Messenger | [Meta Messenger icon resources](https://www.meta.com/brand/resources/facebook/messenger-icon/) |
| `TelegramIcon` | Telegram | [Telegram press assets](https://telegram.org/press) |
| `SnapchatIcon` | Snapchat | [Snap brand guidelines](https://www.snap.com/brand-guidelines?lang=en-US) |
| `XIcon` | X | [X brand toolkit](https://about.x.com/en/who-we-are/brand-toolkit) |
| `PinterestIcon` | Pinterest | [Pinterest brand guidelines](https://business.pinterest.com/en-us/brand-guidelines/?change_language=true) |
| `RedditIcon` | Reddit | [Reddit brand resources](https://redditinc.com/brand) |
| `LinkedInIcon` | LinkedIn | [LinkedIn brand downloads](https://brand.linkedin.com/downloads) |
| `DiscordIcon` | Discord | [Discord branding](https://discord.com/branding) |
| `TwitchIcon` | Twitch | [Twitch brand assets](https://brand.twitch.com/) |
| `ThreadsIcon` | Threads | [Meta Threads brand resources](https://www.meta.com/brand/resources/instagram/threads/) |
| `BlueskyIcon` | Bluesky | [Bluesky app icons](https://bsky.social/about/support/icons) |
| `MastodonIcon` | Mastodon | [Mastodon branding](https://joinmastodon.org/branding) |
| `GitHubIcon` | GitHub | [GitHub logo foundations](https://brand.github.com/foundations/logo) |
| `VimeoIcon` | Vimeo | [Vimeo media kit](https://vimeo.com/press/media-kit) |
| `SubstackIcon` | Substack | [Substack brand resources](https://substack.com/brand) |

## Known constraints

- The family intentionally uses monochrome UI variants because the initial consumer places marks
  inside design-system buttons. Do not infer that arbitrary recoloring is allowed; use only a
  black or white presentation where the owner's guidance permits it.
- TikTok uses the official developer button glyph with its presentation box cropped around the
  glyph. The path itself is unchanged.
- Reddit's public asset is a multicolor Snoo composition. The current monochrome export preserves
  the official Snoo geometry but renders its parts as a single-color outline suitable for compact
  UI. Revisit it if Reddit publishes a first-party standalone monochrome SVG.
- WeChat and LINE are not in this initial family because a public first-party vector kit suitable
  for redistribution was not found during this pass. Vimeo and Substack fill those two Showcase
  slots; this is a source-integrity decision, not a claim that they have larger audiences.
- Brand resources and trademark rules can change independently of this package. Recheck the linked
  first-party source before adding a new presentation, color variant, or marketing use.
