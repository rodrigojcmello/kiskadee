# iOS 27 System Color Evidence

The [iOS and iPadOS 27 Community Figma file](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24673)
contains a centralized local variable collection named `Colors`, with `Light` and `Dark` modes.
This is the canonical color-family source for the next iOS 27 tonal-system generation; component
screenshots are supporting evidence, not the seed source.

[`figma-color-variables.json`](figma-color-variables.json) preserves the exact values found in that
collection.

## Official Families

| Variable | Light | Dark |
| --- | --- | --- |
| `Accents/Red` | `#ff383c` | `#ff4245` |
| `Accents/Orange` | `#ff8d28` | `#ff9230` |
| `Accents/Yellow` | `#ffcc00` | `#ffd600` |
| `Accents/Green` | `#34c759` | `#30d158` |
| `Accents/Mint` | `#00c8b3` | `#00dac3` |
| `Accents/Teal` | `#00c3d0` | `#00d2e0` |
| `Accents/Cyan` | `#00c0e8` | `#3cd3fe` |
| `Accents/Blue` | `#0088ff` | `#0091ff` |
| `Accents/Indigo` | `#6155f5` | `#6d7cff` |
| `Accents/Purple` | `#cb30e0` | `#db34f2` |
| `Accents/Pink` | `#ff2d55` | `#ff375f` |
| `Accents/Brown` | `#ac7f5e` | `#b78a66` |

The collection also defines `Grays/Black`, `Grays/White`, and `Grays/Gray` through `Grays/Gray 6`.
Unlike a Fluent Shared ramp, these are Apple system colors whose values may change between Light and
Dark. They must be mapped to Kiskadee tones after generation rather than treated as preexisting
Kiskadee positions.

## Tonal-Scale Input Direction

- Primary candidate: `Accents/Blue` Light `#0088ff`.
- Chromatic overrides may use the Light Accent values as authored source seeds.
- Dark values remain official correspondence evidence. Their eventual policy (`adaptive`,
  `harmonized`, or an explicit source mapping) must be decided during generation and visual review;
  they are not automatically a second seed.
- The `Grays` family will supply the evidence for `n.black.v1`. Its exact seed/reference position is
  intentionally deferred until the neutral scale is inspected in the tonal generator.
- Mint, Teal, and Cyan are distinct Apple identities. The future Kiskadee recipe may map them to
  variants inside the available Munsell sectors, but this evidence file does not collapse them.

## Kiskadee Family Mapping

| Apple identity | Kiskadee candidate |
| --- | --- |
| Red | `r.red.v1` |
| Pink | `r.red.v2` |
| Orange | `yr.orange.v1` |
| Brown | `yr.orange.v2` |
| Yellow | `y.yellow.v1` |
| Green | `g.green.v1` |
| Mint | `bg.teal.v1` |
| Teal | `bg.teal.v2` |
| Cyan | `bg.teal.v3` |
| Blue | `b.blue.v1` Primary |
| Indigo | `pb.indigo.v1` |
| Purple | `p.purple.v1` |
| Grays | `n.black.v1` |

Apple Pink classifies in Munsell Red, while Mint, Teal, and Cyan all classify in Blue-Green and are
preserved as separate variants. Apple Brown is a valid Yellow-Red color, but the current Kiskadee
Brown appearance guard considers `#ac7f5e` Orange-like. The official seed is therefore preserved
exactly as `yr.orange.v2`; the derived canonical `yr.brown.v1` remains a separate candidate.

## Candidate Tonal System

The editable [`tonal-system.recipe.json`](tonal-system.recipe.json) and canonical
[`generated/`](generated/) bundle were produced with `@kiskadee/tonal-scale@0.4.1`:

- profile: `balanced`, because Apple's authored Dark accents remain vivid and do not justify the
  Fluent-oriented `muted-darks` treatment;
- Primary: Apple Blue `#0088ff`, resolved to `b.blue.v1` at L28/D65;
- official Light Accent values: exact Primary/override seeds;
- Dark families: adaptive generation, with official Dark values retained as correspondence
  evidence rather than second seeds;
- Black seed: official Dark `Grays/Gray 6` (`#1c1c1e`), preserved in both generated tracks;
- universal companion families without direct Apple Accent seeds: `gy.lime.v1`, `rp.magenta.v1`,
  and the canonical `yr.brown.v1`, generated from the shared harmony contract;
- output: sixteen family assets and nineteen canonical files;
- status: `review`, with no generation errors.

The complete perceptual de-para is stored in
[`figma-to-kiskadee.json`](figma-to-kiskadee.json). It maps every official Accent and Gray value to
the nearest generated Light/Dark tone independently.

### Shared viewer — candidate generator 0.4.1

[Open the iOS 27 candidate in the local Kiskadee Tonal Scale](http://localhost:3001/?recipe=%7B%22formatVersion%22%3A4%2C%22gridContract%22%3A%22kiskadee-tonal-v1%22%2C%22harmonyContract%22%3A%22kiskadee-munsell-rest-v1%22%2C%22tonalProfile%22%3A%22balanced%22%2C%22primary%22%3A%7B%22seedHex%22%3A%22%230088ff%22%2C%22appearance%22%3A%22auto%22%2C%22variant%22%3A%22v1%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%22tonalAnchors%22%3A%7B%22rest%22%3A%7B%22mode%22%3A%22auto%22%7D%7D%2C%22functionalReferences%22%3A%5B%5D%2C%22overrides%22%3A%5B%7B%22id%22%3A%22r.red.v1%22%2C%22seedHex%22%3A%22%23ff383c%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22r.red.v2%22%2C%22seedHex%22%3A%22%23ff2d55%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22yr.orange.v1%22%2C%22seedHex%22%3A%22%23ff8d28%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22yr.orange.v2%22%2C%22seedHex%22%3A%22%23ac7f5e%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22y.yellow.v1%22%2C%22seedHex%22%3A%22%23ffcc00%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22g.green.v1%22%2C%22seedHex%22%3A%22%2334c759%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22bg.teal.v1%22%2C%22seedHex%22%3A%22%2300c8b3%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22bg.teal.v2%22%2C%22seedHex%22%3A%22%2300c3d0%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22bg.teal.v3%22%2C%22seedHex%22%3A%22%2300c0e8%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22pb.indigo.v1%22%2C%22seedHex%22%3A%22%236155f5%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22p.purple.v1%22%2C%22seedHex%22%3A%22%23cb30e0%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22n.black.v1%22%2C%22seedHex%22%3A%22%231c1c1e%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22source-exact%22%7D%7D%5D%7D)

The link encodes the complete recipe and requires the local `@kiskadee/tonal-scale` application on
port `3001`. This candidate has not yet been visually approved or promoted into the iOS 27 preset.
