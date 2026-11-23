# Preset Tonal Color Contract

Official and experimental presets use the same continuous primitive tonal contract.

Each static primitive asset declares `kind: 'static'` and one or more complete `scales` keyed by
theme. Dynamic assets declare `kind: 'dynamic'` and use the same positions with CSS color
references. Presets may omit a theme they do not support, but a declared theme may not omit tones.

The original migration converted the former HSLA `subtle`/`vivid` tracks mechanically:

- source colors at shared positions were preserved as their previously emitted sRGB HEX values;
- new positions were interpolated in OKLab;
- reused Light-as-Dark scales were reversed before sampling;
- component references to removed positions moved to the numerically nearest canonical position,
  with ties resolved upward.

These transformations keep every preset buildable under the new contract. They are infrastructure
migration rules, not source evidence or visual approval for an official Design System. Subsequent
preset reviews must replace provisional ramps with source-backed artifacts and document the mapping
under `packages/presets/docs/design-systems/<preset>/`.

The continuous scale does not reintroduce separate `subtle` and `vivid` tracks. A reviewed tonal
asset may instead expose two functional pointers into the same scale:

```ts
functionalReferences: {
  light: { subtle: 4, vivid: 50 },
  dark: { subtle: 4, vivid: 40 }
}
```

These positions are per family and per theme. They are not semantic colors and they do not define
component interaction states. `subtle` identifies a low-prominence surface starting point, while
`vivid` identifies the stronger identity/action starting point. A Black family may therefore use a
light Dark-theme vivid reference even though its exact dark seed remains elsewhere in the scale.

## Theme of origin

For first-party recipes, the promoted tonal assets for the preset and segment are the
authority for base colors. Layer 1 owns the primitive family and its approved scales;
Layer 2 maps global semantic roles; Layer 3 maps component intents. Follow those bindings
before looking up a tone. Light palettes read the Light scale. Dark and Darker palettes
read the Dark scale, including onVivid, overlays, and alternative color variants.
A physical white cap is L0 or D100; a black cap is L100 or D0. Its polarity and the theme
of its source are independent. Documented derived colors retain their input provenance.

For an origin-only correction, preserve the exact RGB and alpha, verify the target family
binding in every affected segment, and compare all emitted states. Equal positions or
nearby HEX values are insufficient. When the approved destination scale lacks the color,
record the role, source family, tone and value for owner review. A new or revised family
goes through the normal generator, review and promotion workflow as a separate decision.
These authoring rules apply to maintained presets; consumers can customize their own JSON.

Run `pnpm check:preset-colors` before publishing. It checks the first-party authored palettes
in memory before portable generation. The [migration inventory](../technical-debt/tonal-track-origin.md)
records outstanding cross-track dependencies and legacy coverage limits. Applications may supply customized serialized schemas independently of this first-party check.

## Functional Reference First

An FRF preset authors every solid base color with one explicit locator. The locator is resolved
inside `packages/presets`; the published Schema contains only the resulting `SolidColor`.

| Locator | Meaning | Required evidence |
| --- | --- | --- |
| `reference` | A role or family plus `subtle` or `vivid`, an optional ordinal offset, and optional alpha | Reference, offset, and formula purpose |
| `exact` | A role or family plus one fixed `KiskadeeTone`, an `evidenceId`, and optional alpha | Source token/decision, Light/Dark tone, and rationale |
| `cap` | A physical `light` or `dark` endpoint of the preset's canonical black primitive, with optional alpha | Endpoint purpose and alpha |

Offsets are ordinal over `KISKADEE_TONES`: `L30 + 1` resolves to L35, not L31. Fractional offsets
and grid overflow fail; they are never rounded or clamped. Layer 2 semantics and Layer 3 intents
resolve to their Layer 1 family before a reference or exact position is read, so one component
formula can follow different family anchors without knowing their absolute positions.

Choose the lookup before choosing a number:

| Decision | Required locator | Evidence record |
| --- | --- | --- |
| Family-relative `subtle`/`vivid` recipe, remappable semantic, Brand projection, or shared formula | `reference` | Reference, offset, and formula purpose |
| Exact upstream token or stop selected independently per theme | `exact` | Light/Dark tone, source token, and `evidenceId` |
| Physical white, black, or transparent endpoint | `cap` | Polarity, alpha, and explicit purpose |

An exact lookup must not encode the current numeric value of a functional reference. Repeating one
tone across different families is valid only when source evidence or an explicit Kiskadee formula
requires that exact position.

Transparency is not a fourth locator. Use `alpha: 0` on the reference, exact, or cap that owns the
underlying RGB. Deterministic post-processing may operate on resolved FRF colors for documented
purposes such as pending visibility, perceptually balanced alpha, or a balanced border. Such a
formula must receive only FRF inputs and must not introduce a literal color or another lookup path.

The preset owns its exact-evidence registry. A migrated FRF preset must expose only its strict
resolver to component recipes; legacy presets may retain `createPresetColorGetter()` until they
undergo their own evidence-led migration.

Functional references are optional on the general primitive asset contract so mechanically
migrated presets can continue using exact tones. When an asset declares them, both references are
required for every emitted theme and are validated against the corresponding scale. The Fluent 2
Microsoft preset is the first adopter; other presets remain unchanged until their own evidence-led
review.

The existing preset family taxonomy remains unchanged. Munsell IDs remain generator provenance;
preset runtime assets continue to use the established Layer 1 family names.
