# iOS 27 System Color Evidence

The [iOS and iPadOS 27 Community Figma file](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24673)
contains a centralized local variable collection named `Colors`, with `Light` and `Dark` modes.
This is the canonical color-family source for the iOS 27 tonal-system generation; component
screenshots are supporting evidence, not the seed source.

[`figma-color-variables.json`](figma-color-variables.json) preserves the complete collection found
in the file: 12 Accents, 8 Grays, 42 semantic colors, and the non-color `Mode` variable. Colors
retain their independent Light/Dark values and alpha; the one Figma alias is also preserved.

## Complete Collection Mapping

The source collection has 62 color variables, but it does not define 62 primitive families:

- the 12 `Accents/*` variables author the chromatic identities;
- the 8 `Grays/*` variables are checkpoints of the authored Apple neutral family;
- the remaining 42 variables are semantic uses of those colors, opaque neutral checkpoints, or
  colors with alpha;
- `Miscellaneous/Tab Bar Selection` preserves its Light alias to `Accents/Blue`;
- the two opaque Sidebar colors do not expose primitive aliases, so their current family selection
  is perceptual and remains candidate evidence.

[`figma-to-kiskadee.candidate.json`](figma-to-kiskadee.candidate.json) maps every Light and Dark
color independently against the current generated system. It preserves alpha outside the distance
calculation and records the selected family, tone, generated HEX, Delta E OK, and whether the result
is byte-exact. The same mapping is promoted as the current approved
[`figma-to-kiskadee.json`](figma-to-kiskadee.json); the candidate file remains the editable
comparison target for a future generator revision.

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

## Tonal-Scale Input Contract

- Primary: `Accents/Blue` Light `#0088ff`.
- Chromatic overrides use the Light Accent values as authored source seeds.
- Dark values remain official correspondence evidence. Their policy (`adaptive`, `harmonized`, or
  an explicit source mapping) is recorded by the recipe; they are not automatically a second seed.
- `n.black.v2` uses official Dark `Grays/Gray 6` (`#1c1c1e`) as its source-exact seed.
  The mandatory `n.black.v1` remains Kiskadee's immutable pure grayscale.
- Mint, Teal, and Cyan remain distinct variants inside the Blue-Green sector; the preset does not
  collapse their Apple identities.

## Generator Family Mapping

| Apple identity | Generator family |
| --- | --- |
| Red | `r.red.v1` |
| Pink | `r.red.v2` |
| Orange | `yr.orange.v1` |
| Brown | `yr.brown.v1` |
| Yellow | `y.yellow.v1` |
| Green | `g.green.v1` |
| Mint | `bg.teal.v1` |
| Teal | `bg.teal.v2` |
| Cyan | `bg.teal.v3` |
| Blue | `b.blue.v1` Primary |
| Indigo | `pb.indigo.v1` |
| Purple | `p.purple.v1` |
| Grays | `n.black.v2` |

Apple Pink classifies in Munsell Red, while Mint, Teal, and Cyan all classify in Blue-Green and are
preserved as separate variants. Generator `0.7.0` calibrates Yellow-Red appearance distance so the
official Apple Brown seed `#ac7f5e` and Dark correspondence `#b78a66` classify as Brown, while the
official Apple Orange values remain Orange. Apple Brown therefore replaces the canonical
`yr.brown.v1` seed instead of creating `yr.orange.v2`.

## Tonal System And Promotion

The editable [`tonal-system.recipe.json`](tonal-system.recipe.json) and promoted
[`generated/`](generated/) bundle use the format V5 multifamily generator from
`@kiskadee/tonal-scale@0.7.0`. This promotion moves Apple's tinted Gray source from `n.black.v1`
to `n.black.v2`, while mandatory `n.black.v1` provides an independent pure grayscale:

- profile: `balanced`, because Apple's authored Dark accents remain vivid and do not justify the
  Fluent-oriented `muted-darks` treatment;
- Primary: Apple Blue `#0088ff`, resolved to `b.blue.v1` at L28/D65;
- official Light Accent values: exact Primary/override seeds;
- Dark families: adaptive generation, with official Dark values retained as correspondence
  evidence rather than second seeds;
- Apple neutral seed: official Dark `Grays/Gray 6` (`#1c1c1e`) in `n.black.v2`, preserved in both
  generated tracks;
- universal companion families without direct Apple Accent seeds: `gy.lime.v1` and
  `rp.magenta.v1`, generated from the shared harmony contract;
- output: sixteen family assets and nineteen canonical files;
- bundle diagnostic status: `review`, with no generation errors.

The complete perceptual de-para is stored in
[`figma-to-kiskadee.json`](figma-to-kiskadee.json). It maps every official Accent and Gray value to
the nearest generated Light/Dark tone independently and records the approved `0.7.0` promotion.
The prior `0.4.1` mapping remains historical Git provenance; it is not relabeled as V5.

Thirteen assets backed by explicit Apple source seeds are approved and promoted into the preset.
The generator's mandatory pure grayscale remains in the reproducible evidence bundle, but it is
not published by the iOS 27 preset because no runtime role consumes it:

| Generated asset | Preset primitive |
| --- | --- |
| `b.blue.v1` | `blue.v1` |
| `bg.teal.v1` | `teal.v1` |
| `bg.teal.v2` | `teal.v2` |
| `bg.teal.v3` | `cyan.v1` |
| `g.green.v1` | `green.v1` |
| `n.black.v2` | `black.v1` (Apple Gray; global Neutral) |
| `p.purple.v1` | `purple.v1` |
| `pb.indigo.v1` | `purple.v2` |
| `r.red.v1` | `red.v1` |
| `r.red.v2` | `pink.v1` |
| `y.yellow.v1` | `yellow.v1` |
| `yr.orange.v1` | `orange.v1` |
| `yr.brown.v1` | `brown.v1` |

The canonical pure grayscale `n.black.v1` and the two harmony-generated companions without direct
Apple Accent seeds, `gy.lime.v1` and `rp.magenta.v1`, remain evidence-only. Generated family IDs
preserve tonal provenance; preset primitive variants are a separate publication layer. The generated
bundle retains diagnostic status `review`; promotion is the explicit preset decision to adopt its
source-backed Apple subset and required neutral family.

### Shared viewer — candidate generator 0.7.0

[Open the iOS 27 candidate in the local Kiskadee Tonal Scale](http://localhost:3001/?recipe=%7B%22formatVersion%22%3A5%2C%22gridContract%22%3A%22kiskadee-tonal-v1%22%2C%22harmonyContract%22%3A%22kiskadee-munsell-rest-v1%22%2C%22tonalProfile%22%3A%22balanced%22%2C%22primary%22%3A%7B%22seedHex%22%3A%22%230088ff%22%2C%22appearance%22%3A%22auto%22%2C%22variant%22%3A%22v1%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%22tonalAnchors%22%3A%7B%22rest%22%3A%7B%22mode%22%3A%22auto%22%7D%7D%2C%22functionalReferences%22%3A%5B%5D%2C%22overrides%22%3A%5B%7B%22id%22%3A%22r.red.v1%22%2C%22seedHex%22%3A%22%23ff383c%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22r.red.v2%22%2C%22seedHex%22%3A%22%23ff2d55%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22yr.orange.v1%22%2C%22seedHex%22%3A%22%23ff8d28%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22yr.brown.v1%22%2C%22seedHex%22%3A%22%23ac7f5e%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22y.yellow.v1%22%2C%22seedHex%22%3A%22%23ffcc00%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22g.green.v1%22%2C%22seedHex%22%3A%22%2334c759%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22bg.teal.v1%22%2C%22seedHex%22%3A%22%2300c8b3%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22bg.teal.v2%22%2C%22seedHex%22%3A%22%2300c3d0%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22bg.teal.v3%22%2C%22seedHex%22%3A%22%2300c0e8%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22pb.indigo.v1%22%2C%22seedHex%22%3A%22%236155f5%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22p.purple.v1%22%2C%22seedHex%22%3A%22%23cb30e0%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22n.black.v2%22%2C%22seedHex%22%3A%22%231c1c1e%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22source-exact%22%7D%7D%5D%7D)

The link encodes the complete format V5 recipe and requires the local `@kiskadee/tonal-scale`
application on port `3001`. The candidate contains the V5 canonical `n.black.v1` plus authored
`n.black.v2` and matches the checked-in evidence bundle. The preset promotes authored `n.black.v2`
as its single `primitive.black.v1`; canonical `n.black.v1`, Lime, and Magenta remain evidence-only.
Generator `0.6.0` adds an independent standalone-family API for optional external color domains;
that additive API remains versioned independently from the promoted multifamily generator.

Generator `0.7.0` recognizes Apple Brown as `yr.brown.v1`. The promoted bundle and preset now use
that identity; the former `yr.orange.v2` asset is removed.

The current recipe generates 16 families: 12 Apple Accent identities, authored neutral
`n.black.v2`, immutable `n.black.v1`, and the canonical Lime and Magenta companions required by the
Kiskadee tonal-system contract. Apple Brown occupies the required Brown family, so no duplicate
Brown or second Orange family is generated.

The multifamily contract accepts one seed per family. Consequently, Apple Light Accents
remain exact source anchors while the distinct Apple Dark Accent values map to the nearest tone on
the adaptive Dark track. The approved mapping makes those differences explicit, including the
remaining Dark adaptation distances for Yellow and Purple.
