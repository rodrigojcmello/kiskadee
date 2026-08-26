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

`createPresetColorGetter()` keeps exact lookup through `c(..., tone)` and exposes functional lookup
explicitly through `c.ref(..., reference, offset)`. Offsets are ordinal over `KISKADEE_TONES`:
`L30 + 1` resolves to L35, not L31. Fractional offsets and grid overflow fail; they are never
rounded or clamped. Layer 2 semantics and Layer 3 intents resolve to their Layer 1 family before the
reference is read, so one component formula can follow different family anchors without knowing
their absolute positions.

Choose the lookup before choosing a number:

| Decision | Required lookup | Evidence record |
| --- | --- | --- |
| Family-relative `subtle`/`vivid` recipe, remappable semantic, Brand projection, or shared formula | `c.ref(reference, offset)` | Reference, offset, and formula purpose |
| Exact upstream token or stop selected independently per theme | `c(tone)` | Light/Dark tone and source token |
| Absolute, structural, alpha, disabled, contrast, or gradient decision | `c(tone)` | Primitive/role and explicit rationale |

An exact lookup must not encode the current numeric value of a functional reference. Repeating one
tone across different families is valid only when source evidence or an explicit Kiskadee formula
requires that exact position.

Functional references are optional on the general primitive asset contract so mechanically
migrated presets can continue using exact tones. When an asset declares them, both references are
required for every emitted theme and are validated against the corresponding scale. The Fluent 2
Microsoft preset is the first adopter; other presets remain unchanged until their own evidence-led
review.

The existing preset family taxonomy remains unchanged. Munsell IDs remain generator provenance;
preset runtime assets continue to use the established Layer 1 family names.
