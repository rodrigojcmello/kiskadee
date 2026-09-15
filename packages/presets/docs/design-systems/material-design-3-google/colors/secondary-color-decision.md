# Material support color decision

Revised: 2026-09-15. Status: **Kiskadee extension**, implementation requested by the user.

## Decision

Material publishes an optional `support` intent for Button and Card. It is a chromatic supporting
action, distinct from `neutral`; emphasis still controls prominence within each intent.
Other presets need not publish it. Showcase lists it last only when the active Button
artifact contains that intent, preserving the existing examples during preset changes.

All neutral mappings resolve to canonical `primitive.black.v1` in every segment. Black V2/V3
have been removed from the current recipe, canonical bundle and preset. Legacy semantic
variant aliases resolve to V1 rather than retaining tinted assets. Neutral derivation remains
available in the generator for other presets.

The previous decision to omit Support and use tinted neutral as the chromatic supporting
Button is superseded. User-provided Google Sheets/Gmail screenshots show both gray controls
and chromatic supporting buttons; this is product evidence, not proof of a universal
Material requirement or of the absence of a corresponding Figma component.

## Derived colors and segment roles

One shared recipe generates the existing palette and two supporting associations:

| Segment | Primary | Button Neutral | Button Support |
| --- | --- | --- | --- |
| default | b.blue.v1 / #0B57D0 | n.black.v1 | b.blue.v2 / #004E6F |
| purple | pb.indigo.v2 / #6750A4 | n.black.v1 | pb.indigo.v3 / #2D4187 |

The new assets use `material-support-v1`: OKLCH L40, chroma capped at 0.12 and hue shifted
-25 degrees from each origin's resolved Light rest. They use Light source-exact and Dark
adaptive. This is our authored derivation, not Google's algorithm. At Light L7 their fills
are #C2E6FD and #D4E0FF respectively. IDs follow generator classification; PB maps to the
existing Core purple primitive slot. The supporting scales retain their existing values; the two tinted neutral scales are removed.

## Semantics and limitations

Two hues alone do not teach users two meanings. Labels, placement, context and emphasis
must make a supporting action understandable. Support is available for deliberate use;
it is neither another name for Medium nor a mandatory addition to every preset.

The generated montage from the conversation is illustrative, not pixel-accurate evidence.
The derivation was calibrated against the original screenshots and actual generated tones.
Final aesthetic acceptance remains user-owned in the rendered preset.

See [tonal provenance](README.md), [Button mapping](../components/button.md), and
[generator contract](../../../../../tonal-scale/docs/definitions/tonal-system.md).

## Card composition

Support publishes Medium using its own subtle reference and the existing Card state offsets,
in both themes and surface contexts. Neutral uses pure grayscale. Primary Highest remains
the canonical onVivid surface. The upper-right Showcase tile selects support.medium when
published, otherwise neutral.medium; the wide middle tile stays neutral.medium. This is a
Showcase composition choice, not a component-level fallback or a requirement on other presets.

Chip and Slider neutral interaction offsets move inward from the V1 vivid endpoint (99)
in Light as well as Dark, avoiding out-of-grid offsets after the neutral remapping.
