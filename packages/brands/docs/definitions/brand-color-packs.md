# Brand color packs

`@kiskadee/brands` owns portable definitions and standalone tonal assets for third-party brands.
It does not own logo geometry, preset primitives, semantic colors, or component recipes.

## Ownership

- `@kiskadee/icons` owns official logo geometry and presentation.
- `@kiskadee/brands` owns the official color seed, source evidence, content polarity, tonal asset,
  and distribution-pack membership.
- `@kiskadee/tonal-scale` owns the universal single-seed tonal algorithm.
- A preset owns the projection from a tonal asset to component emphasis and interaction states.
- The Web Builder owns optional CSS and class-map publication.

Brand assets never enter a preset's primitive `colors.json`, its three color layers, or its global
palette CSS. A brand pack is an optional feature resource that can be loaded only at an explicit
application boundary.

## Identity and harmony

The official seed is preserved byte-for-byte in both Light and Dark standalone scales. It is not
harmonized against the active preset's Primary color. Component recipes still use the same
functional references and ordinal tone shifts as system intents, which harmonizes interaction
grammar without rewriting brand identity.

`vivid` is the component Rest reference. `subtle` supports lower-emphasis surfaces. Absolute-black
seeds remain exact at the cap but receive a separately diagnosed, cap-safe functional `vivid`
reference so a component Rest does not disappear into a black surface.

## Canonical catalog

| ID | Seed | Source policy | Content polarity | Evidence |
| --- | --- | --- | --- | --- |
| `apple` | `#000000` | Official Black identity | Light | [Sign in with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple) |
| `google` | `#0b57d0` | Official filled action background | Light | [Google Identity HTML reference](https://developers.google.com/identity/gsi/web/reference/html-reference) |
| `microsoft` | `#0064b4` | Fluent Brand-80 official action background | Light | [Fluent color tokens](https://fluent2.microsoft.design/color-tokens/) |
| `chat-gpt` | `#000000` | Official Black identity | Light | [OpenAI design guidelines](https://openai.com/brand/) |
| `claude` | `#d97757` | Official logo accent | Dark | [Anthropic press kit](https://www.anthropic.com/press-kit) |
| `gemini` | `#078efb` | Official gradient stop | Light | [Google brand resource center](https://about.google/company-info/brand-resource-center/) |
| `facebook` | `#0866ff` | Official logo accent | Light | [Facebook brand resources](https://www.meta.com/brand/resources/facebook/logo/) |
| `you-tube` | `#ff0033` | Official logo accent | Light | [YouTube monochromatic icon guidance](https://brand.youtube/youtube-icon/#monochromatic-logos) |
| `whats-app` | `#25d366` | Official logo accent | Dark | [WhatsApp brand resources](https://www.meta.com/brand/resources/whatsapp/whatsapp-brand/) |
| `instagram` | `#d300c5` | Official gradient stop used as a single-color seed | Light | [Instagram brand resources](https://www.meta.com/brand/resources/instagram/instagram-brand/) |
| `tik-tok` | `#000000` | Official Black base | Light | [TikTok design guidelines](https://developers.tiktok.com/doc/getting-started-design-guidelines) |
| `messenger` | `#006aff` | Official gradient stop | Light | [Messenger icon resources](https://www.meta.com/brand/resources/facebook/messenger-icon/) |
| `telegram` | `#229ed9` | Official gradient stop | Light | [Telegram press resources](https://telegram.org/press) |
| `snapchat` | `#fffc00` | Official logo accent | Dark | [Snap brand guidelines](https://www.snap.com/brand-guidelines?lang=en-US) |
| `x` | `#000000` | Official Black identity | Light | [X brand toolkit](https://about.x.com/en/who-we-are/brand-toolkit) |
| `pinterest` | `#e60023` | Official logo accent | Light | [Pinterest brand guidelines](https://business.pinterest.com/en-us/brand-guidelines/) |
| `reddit` | `#ff4500` | Official logo accent | Light | [Reddit Brand System logo](https://redditbrand.lingoapp.com/s/Logo-d9x3n2?v=44) |
| `linked-in` | `#0a66c2` | Official logo accent | Light | [LinkedIn downloads](https://brand.linkedin.com/downloads) |
| `discord` | `#5865f2` | Official logo accent | Light | [Discord branding](https://discord.com/branding) |
| `twitch` | `#9146ff` | Official logo accent | Light | [Twitch brand resources](https://brand.twitch.com/) |
| `threads` | `#000000` | Official Black identity | Light | [Threads brand resources](https://www.meta.com/brand/resources/instagram/threads/) |
| `mastodon` | `#6364ff` | Official logo accent | Light | [Mastodon branding](https://joinmastodon.org/branding) |
| `git-hub` | `#000000` | Official Black identity | Light | [GitHub logo guidance](https://brand.github.com/foundations/logo) |
| `vimeo` | `#1ab7ea` | Official logo accent | Dark | [Vimeo media kit](https://vimeo.com/press/media-kit) |
| `substack` | `#ff6719` | Official logo accent | Dark | [Substack brand resources](https://substack.com/brand) |

Single-color seeds selected from multicolor identities are explicitly Kiskadee projections.
Microsoft uses the approved Fluent 2 Brand-80 action color rather than one accent from the
multicolor Microsoft logo, so its Button aligns with the Design System that owns the component
formula. This does not claim that Microsoft publishes an equivalent authentication button.
Instagram, Gemini, Messenger, and Telegram use a documented gradient stop because one standalone
tonal family cannot encode a multicolor identity. The full-color logo remains independent from the
Button's component color.

YouTube uses Light content polarity. Its official monochromatic examples place the White icon on
YouTube Red and dark surfaces, while the Black icon is shown on White. Kiskadee applies that
documented visual relationship to the on-subtle High Button composition: the vivid YouTube Red
surface resolves White text, and the explicitly monochromatic icon follows the same foreground
through `currentColor`. Extending the icon relationship to adjacent Button text is a static
Kiskadee composition decision, not a claim that YouTube publishes this Button schema.

Reddit also uses Light content polarity. Its official icon guidance requires the Snoo head to
appear over OrangeRed, either inside the conversation-bubble device or over a full-bleed OrangeRed
field. Kiskadee therefore resolves the on-subtle High Button foreground to White, and its
monochromatic icon follows that foreground through `currentColor`. Applying the same polarity to
the adjacent label remains a static Kiskadee composition decision, not a claim that Reddit
publishes this Button schema.

## Packs

- `auth`: Apple, Google, and Microsoft.
- `social`: the other 22 published platform and social identities, including AI products,
  communication services, creator platforms, and social networks.

Pack names organize optional artifact delivery. They are not Button actions, variants, kinds, or
visual properties. Component usage stays within the normal Kiskadee model:
`intent -> emphasis -> surface context -> state`.

## Component projection

Brand definitions are component-agnostic. A preset may opt into a projector that supplies its own
component formula with a standalone brand family as input.

The Fluent 2 Microsoft Button projector is the first implementation:

- `brand.<id>` replaces only the tonal family used by the existing Fluent Button formula;
- High begins at `vivid`, Medium begins at `subtle`, and state changes use ordinal public-grid
  shifts;
- Low, Lowest, disabled, Light, Dark, Darker, `onSubtle`, and `onVivid` keep the same preset-owned
  recipe as system intents;
- `contentPolarity` resolves the enabled on-subtle High foreground for both the Button label and
  icon during build;
- when a cap-safe standalone family publishes a Dark `vivid` reference with
  `source: contrast-mirror`, the projector mirrors that polarity at build time so the functional
  Rest remains readable; this is deterministic artifact metadata, not runtime contrast logic;
- icon `brand` or `monochrome` presentation remains an explicit component choice and is not encoded
  in the color formula or enforced by a component contract.

The Kiskadee Showcase uses a composition recommendation based on both surface context and Button
emphasis:

- `onSubtle` High uses `monochrome` because its Button surface is itself vivid;
- `onSubtle` Medium, Low, and Lowest use the official `brand` presentation on their physically
  subtle or transparent Button surfaces;
- `onVivid` High uses the official `brand` presentation because its Button surface is white or
  physically light;
- `onVivid` Medium, Low, and Lowest use `monochrome` so the logo follows the component foreground
  over the strong surrounding surface.

This recommendation is not enforced by the component contract. Consumers may choose either
presentation in either context when official brand guidance or the application composition
requires it. Brands that only publish a monochrome asset, such as Apple in the current catalog,
naturally remain monochrome in every example.

This is a **Kiskadee extension**. It does not claim that Fluent publishes Button appearances for
any third-party brand in the catalog.

## Publication and loading

The Web Builder publishes each supported pack under the design-system build:

```text
brand-packs/<pack>/manifest.json
brand-packs/<pack>/<segment>.<theme>.<hash>.kiskadee.css
brand-packs/<pack>/class-maps/<segment>.<theme>/<component>.<hash>.kiskadee.json
```

Normal preset CSS, `colors.json`, and class maps never contain `brand.*`. A
`BrandPackBoundary` requests one pack for an explicit component list and waits for both its CSS and
class map before revealing content. Resources are cached by design system, pack, segment, theme,
and component list. Without that boundary, a branded Button receives no color class and reports a
development error; it never falls back to Primary or Neutral.

The browser loader validates the manifest contract and the published class-map SHA-256 before
exposing the boundary. The stylesheet is attached with its published SHA-256 as Subresource
Integrity. An SSR host may provide `preloadedBrandPacks`, but it must also include the matching
verified stylesheet in the server response; preloaded metadata never substitutes for the CSS.

```tsx
<BrandPackBoundary pack="auth" components={['button']} fallback={null}>
  <Button intent="brand.google" emphasis="high">
    Continue with Google
  </Button>
</BrandPackBoundary>
```

This boundary is a delivery boundary, not a visual axis. The Button still resolves
`intent -> emphasis -> surface context -> state`, and changing theme or segment selects another
prebuilt pack palette rather than calculating colors at runtime.

## Trademark boundary

Published seeds and logo references do not imply affiliation, endorsement, or permission to ignore
the trademark owner's current rules. Revalidate the linked first-party evidence before adding a new
brand, changing a seed, or using an identity in marketing material.
