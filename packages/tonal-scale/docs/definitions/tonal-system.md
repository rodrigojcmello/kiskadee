# Kiskadee Harmonized Tonal System v1

Status: canonical package-level definition.

The tonal system generates a coherent set of Layer 1 primitive color families
from multiple sRGB seeds. It composes the canonical `generateKiskadeeScale`
operation without changing its public L/D grid or the frozen Balanced output
defined in [tonal-scale.md](./tonal-scale.md).

This contract belongs entirely to `packages/tonal-scale`. Presets, Core,
semantic aliases, components, and preset migration remain outside its scope.

## Family Identity

A family id combines an author-owned primitive color name and variant, such as
`blue.v1`, `green.v2`, or `black.v1`. The suffix identifies a family variant;
it is not an artifact or algorithm version.

The id expresses author intent. The generator does not classify a seed by its
hex value. This distinction is essential for neutral colors: `black.v1` means
the Design System's neutral/gray family, not necessarily literal black. Its
seed may be a warm gray, cool gray, or subtly blue-tinted gray. Conversely, a
chromatic `blue.v1` remains blue even when it is relatively desaturated.

The absolute caps remain part of every scale regardless of family:

- Light uses L0 `#ffffff` and L100 `#000000`;
- Dark uses D0 `#000000` and D100 `#ffffff`.

The neutral family is where the Design System's authored gray trajectory lives;
it does not own or replace those absolute caps.

## Primary Reference

Exactly one chromatic family is the primary harmony reference. `black.*` cannot
be primary because a neutral seed does not provide a reliable chromatic hue and
gamut-utilization reference.

The primary's Light and Dark `rest` colors establish the mathematical
targets used by harmonized support families. This does not create a semantic
`primary` token. Semantic mapping belongs to a future integration layer.

Every family uses the same locked Light and Dark `rest` positions. A
family never chooses a private rest slot. If a Design System locks L45 and D45,
those are the rest positions for blue, green, red, yellow, neutral, and every
other primitive family. A source-exact seed may exist at a different natural
anchor; in that case the family still exposes its color at the shared rest slot.

## Input Contract

Generation receives:

- one or more unique primitive family ids;
- one normalized sRGB seed per family;
- an explicit Light and Dark policy per family;
- exactly one chromatic primary family;
- one tonal profile (`balanced` or `muted-darks`);
- automatic draft or locked Light/Dark `rest` positions;
- explicit format, grid, and harmony contract identifiers.

Family ordering has no semantic effect. Invalid ids, duplicate ids, invalid
hex values, missing policies, a neutral primary, unsupported policies, or
incompatible locked anchors fail explicitly. There is no silent fallback.

## Per-Theme Generation Policies

Policy and tonal profile are independent. The profile controls the chroma
treatment of the generated scale. The policy controls how a family seed
participates in one theme.

### `source-exact`

The supplied seed must appear byte for byte at its natural generated anchor.
The shared rest position is retained, but it does not have to be the seed's
anchor for a support or neutral family.

The primary Light policy is always `source-exact`. Primary Dark may also use
it, in which case the source seed must occupy the locked Dark rest position.

### `harmonized`

The seed establishes chromatic hue intent. Lightness and chroma may change so
the generated rest color aligns with the theme-specific primary reference.
The resulting effective seed occupies the shared rest position.

This policy is valid only for chromatic support families. It is invalid for a
neutral `black.*` family because neutral intent must not be converted into a
chromatic harmony problem.

### `adaptive`

The generator projects the family toward the shared rest position while
preserving its identity and all low-level scale invariants. It does not target
the primary harmony fingerprint. This provides a middle path between literal
source preservation and cross-family harmonization.

Chromatic support families may use any policy independently in Light and Dark.
Neutral families may use `source-exact` or `adaptive`. The primary uses
`source-exact` in Light and either `source-exact` or `adaptive` in Dark.

## Neutral Intent Guard

Neutral intent is explicit through `black.*`, not inferred from hue names or a
hardcoded pure-black seed. V1 measures the seed's emitted OKL chroma:

- chroma above `0.04` is retained but reported for review as a strong tint;
- chroma above `0.08` fails because it no longer represents a credible neutral
  family under this contract.

These are intent guards, not a color classifier. Authors remain responsible for
choosing whether a desaturated blue belongs to `blue.*` or `black.*`.

## `rest` And Harmony

`rest` is the v1 cross-family checkpoint. It has one Light and one Dark
position in the public chromatic range 1 through 99. Positions 0 and 100 remain
reserved for the absolute theme caps.

The name deliberately makes no claim about subtle or vivid emphasis. A primary
brand color may be light, dark, saturated, or muted and still define the shared
rest position. For example, Twitter Blue `#1da1f2` resolves exactly to L24 and
D70. Those positions are valid even though L24 precedes the Light 3:1-against-
white guard.

The low-level 3:1 guards remain unchanged at L35-L95 against white and D35-D95
against black. They describe contrast properties of those ranges; they do not
qualify whether a position may serve as `rest`. The primary-reference
diagnostics report contrast against both white and black so semantic consumers
can choose a compatible foreground.

An automatic draft proposes both positions from the primary. Export locks both
positions. A later incompatible primary seed or policy fails rather than moving
a locked position silently.

Harmonization targets, in order:

1. primary rest luminance and contrast behavior;
2. emitted OKL lightness;
3. relative chroma utilization within the target hue's available sRGB gamut;
4. minimum perceptual distance from the source seed.

The first three objectives have explicit tolerances. Candidate ranking is
deterministic and cannot override the low-level hard invariants.

## Generation And Atomicity

The system validates the full recipe, resolves the primary, extracts Light and
Dark references, resolves every remaining family according to each theme's
policy, and emits artifacts only when every family succeeds.

Hard invariants retain this priority:

1. absolute caps and canonical public grid;
2. locked shared rest positions;
3. selected per-theme policy;
4. recognizable family identity;
5. valid emitted sRGB output;
6. strict theme-direction lightness monotonicity;
7. emitted uniqueness;
8. theme contrast guards;
9. emitted-curve continuity.

The `balanced` profile is protected by golden fixtures and full matrix hashes.
System generation, neutral support, policies, UI, and serialization must not
change those low-level outputs. `muted-darks` remains an isolated profile that
attenuates physically dark chroma under its own documented constraints.

## Artifact Set

An export is one deterministic directory-shaped bundle:

```txt
tonal-system.source.json
tonal-system.json
tonal-system.diagnostics.json
colors/
  black.v1.json
  blue.v1.json
  green.v1.json
```

All resolved artifacts identify the generator as
`@kiskadee/tonal-scale@0.1.0`. This is provenance, not a claim that older
generator versions can reproduce newer contracts.

### `tonal-system.source.json`

The reproducible authoring recipe contains family ids, normalized seeds,
per-theme policies, primary reference, tonal profile, locked rest positions,
and contract identifiers. Exported sources cannot retain automatic anchors.

### `tonal-system.json`

The small consumption manifest contains generator version, profile, primary
family, shared rest positions, source hash, diagnostics path, and the sorted
list of color assets with their hashes. Hashes are centralized here instead of
being repeated inside every color asset.

### `colors/<family>.json`

Each consumption asset contains:

- identity, kind (`chromatic` or `neutral`), role, source seed, and profile;
- explicit Light and Dark policies;
- shared rest positions, generated anchors, and rest colors;
- complete Light and Dark tone-to-hex maps.

It intentionally excludes harmony metrics, dependency records, embedded
integrity objects, and low-level diagnostic payloads.

### `tonal-system.diagnostics.json`

Review-only data is separated from consumption data. It contains system issues,
primary fingerprints, and the complete per-family/per-theme harmony and
low-level scale diagnostics.

The complete bundle remains reproducible and verifiable: the verifier validates
the locked source, regenerates every file, requires canonical JSON, and compares
the directory byte for byte. Missing, extra, non-canonical, or modified files
invalidate the bundle atomically.

## Versioning

The system distinguishes:

- family variant (`blue.v1`);
- package generator version (`0.1.0`);
- artifact `formatVersion`;
- public `gridContract`;
- `harmonyContract`;
- tonal profile.

Changing one does not silently change the others. A breaking JSON shape changes
`formatVersion`; a public grid or coordinate change changes `gridContract`; a
materially different harmony algorithm changes `harmonyContract`. Balanced
profile evolution requires a new profile/contract rather than overwriting its
canonical barrier.

## External Integration Boundary

The package produces Layer 1 primitive-family artifacts only. It does not write
to `packages/presets`, modify external types, select semantic aliases, or map
component states. Those steps require a separate future plan and explicit
approval after the tonal-system artifacts are accepted.
