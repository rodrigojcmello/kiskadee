# Carbon Badge Evidence

## Sources

- [Preview Tag specifications](https://preview.carbondesignsystem.com/building-blocks/core/components/tag/specifications), inspected 2026-09-20.
- [Carbon Tag style](https://carbondesignsystem.com/components/tag/style/), corroborating geometry.
- [Figma v11](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/?node-id=58-2763), file `MfGzFa79SfhHQ2mKpC3ss4`, entry node `58:2763`.
- [Captured theme variables](../colors/figma-theme-tokens.json) and [generated mapping](../colors/token-mapping.json).

## Source Coverage

| Area | Inspected evidence | Status |
| --- | --- | --- |
| Read-only colored Tags | Preview specifications; Figma component tokens | Official adapted |
| High-contrast neutral Tag | Inverse background/text tokens | Official adapted |
| Badge-only mark, dot, separation and semantic emphasis | Existing Kiskadee slots | Kiskadee extension |

## Official Contract

Tag supplies the noninteractive pill treatment: 18/24/32px heights, 12/16 regular label,
8/8/12px horizontal padding. Read-only Tags have no interaction-state colors.

## Color And Token Provenance

`medium` uses `tag-background-*` and `tag-color-*` for Gray, Blue, Purple, Green, Yellow and Red.
The Figma capture includes Yellow, despite its omission in some older documentation tables.
Every token resolves through `source.tokens` exact/cap locators; the linked mapping records source
HEX, generated family/tone/HEX and distance separately for White, G90 and G100.

Neutral `high` uses `background-inverse`/`text-inverse`. Other high fills use the respective
`badge.<intent>` family `vivid` reference, with physical white foreground except Light warning
(physical black). These semantic high variants are **Kiskadee extension**.

## Kiskadee Mapping

`e1/e2` hold Tag fill/label; `e3/e4` supply existing mark presentations. `e5` is an 8px status dot;
`e6` a physical-white 2px separation ring. Low uses an 8% neutral cap tint and the Tag foreground.
OnVivid low switches to white tint/text; opaque medium/high retain their own palette.
These low, dot, separation and OnVivid adaptations are **Kiskadee extension**.

## Deferred And Validation

**Deferred:** AI label integration and the full upstream decorative color catalog beyond existing
Badge intents. The six-slot schema passes the Core Badge contract. Build/render validation is
recorded in the preset-wide implementation handoff; no device-level fidelity is implied here.
