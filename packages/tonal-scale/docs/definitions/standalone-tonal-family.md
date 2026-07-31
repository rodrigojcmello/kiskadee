# Standalone tonal family

`@kiskadee/tonal-scale/standalone` generates one portable tonal family from one
source color. It exists for color domains that are independent from a Design
System preset, such as official brand colors.

The standalone format deliberately does not assign a Munsell sector, semantic
role, preset identity, or component state formula. Those concerns belong to
their owning packages.

## Contract

```ts
const artifact = await generateStandaloneKiskadeeTonalFamily({
  seedHex: '#0b57d0',
  tonalProfile: 'muted-darks',
  lightPolicy: 'source-exact',
  darkPolicy: 'source-exact'
});
```

The generator:

- emits every public Kiskadee tone for Light and Dark;
- preserves the normalized source HEX at each generated anchor;
- exposes generated anchors and functional `subtle` and `vivid` references;
- records complete low-level diagnostics;
- hashes the canonical payload with SHA-256;
- can verify both integrity and deterministic replay.

`vivid` normally uses the generated anchor. An anchor at an absolute cap remains
unchanged in the scale, while the functional reference moves to a usable
internal tone. The Light fallback uses L85 so component formulas can safely
traverse at least three public positions in either direction. Pure black in Dark
mirrors the contrast of its Light functional
reference so a dark surface never resolves to black-on-black.

Light `subtle` starts at public tone 4 when that tone is on the surface side of
`vivid`. Dark `subtle` mirrors the Light reference's contrast against the
opposite absolute surface. These references select existing colors only; they
never recolor the generated scale.

## Ownership

- `@kiskadee/tonal-scale` owns scale generation and the standalone artifact.
- External domains own IDs, provenance, grouping, and source seeds.
- Presets own the projection from functional references into component
  emphasis and interaction states.
- Runtimes consume prebuilt artifacts and do not calculate contrast or colors.

The standalone artifact format is `1`. Package `0.6.0` adds this format without
changing the low-level Kiskadee scale algorithm or its Balanced goldens.
