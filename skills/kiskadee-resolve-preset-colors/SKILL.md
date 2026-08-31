---
name: kiskadee-resolve-preset-colors
description: Resolve official design-system and Figma colors into Kiskadee tonal assets and preset schema references. Use whenever a task inspects Figma or official color documentation for an official preset, edits preset primitive colors or semantic mappings, styles a preset component schema with color, maps upstream tokens to Kiskadee L/D tones, or could otherwise introduce a literal color into an official preset schema.
---

# Resolve Kiskadee Preset Colors

Use this skill to preserve the complete color provenance chain:

```text
official semantic token or component
  -> official primitive family and stop
  -> approved Kiskadee primitive asset
  -> Light/Dark tonal position
  -> global semantic or component intent
  -> schema color lookup
```

## Non-Negotiable Rules

- Never add a HEX, HSLA tuple, or other literal color to an official preset schema.
- In an FRF preset, resolve schema colors only through its strict locator resolver. In an unmigrated
  preset, use its established legacy getter until an evidence-led FRF migration is in scope.
- Keep literal official HEX values only in source-evidence files and literal generated HEX values
  only in primitive color assets.
- Do not import documentation JSON into runtime code. Promote approved generated assets into the
  preset's primitive-color source before referencing them from a schema.
- Do not silently choose a visually similar family or tone. If evidence or a mapping is missing,
  complete the evidence and tonal mapping first.
- Resolve Light and Dark independently. They may legitimately use different tonal positions.

The no-literal rule includes white, black, transparent colors, overlays, focus colors, and shadow
colors. In an FRF preset, express them as physical `cap` locators with alpha. If the schema contract
cannot express the required color without a literal, treat
that as a blocked contract gap and document it instead of adding a fallback.

## Required Workflow

1. Load the source-evidence workflow.
   - If it is not already loaded, read `../kiskadee-preset-evidence/SKILL.md` completely.
   - Follow its evidence format and validation requirements in addition to this skill.

2. Identify the upstream color by semantics, not appearance.
   - Start from the inspected Figma node, variable, alias, style, or official token.
   - Trace aliases until reaching the official primitive family and stop for each theme.
   - Prefer inspectable variables or official token data over screenshots and natural-language
     color names.

3. Load the preset color evidence before editing code.
   - Read `packages/presets/docs/design-systems/<preset>/source-evidence.md`.
   - Inspect the preset's `colors/` evidence directory when present.
   - Prefer its durable tonal evidence document, official-ramp JSON, Figma-to-Kiskadee mapping,
     tonal recipe, and verified generated assets.
   - For Fluent 2, the canonical entry point is
     `packages/presets/docs/design-systems/fluent-2-microsoft/colors/fluent-tonal-scale-evidence.md`.

4. Resolve the complete de-para for each theme.
   - Record the official semantic role or component state.
   - Record the official primitive family, stop, and HEX.
   - Select the approved Kiskadee primitive family ID.
   - Use the documented closest or exact L/D position from the de-para.
   - Record the generated HEX and adaptation distance when the source and generated values differ.

5. Promote assets before schema use.
   - Copy or translate only visually approved generated assets into the preset's primitive-color
     source using the current `PrimitiveColors` contract.
   - Map primitive families into Layer 2 global semantics and Layer 3 component intents where the
     role is semantic.
   - Do not create a duplicate primitive family when one approved family plus a different tonal
     position expresses the upstream distinction.

6. Author the schema through the color contract.
   - Prefer a component intent or global semantic role when the color expresses meaning.
   - Use a primitive role directly only for genuinely primitive or structural usage.
   - Classify every base color before choosing a helper: `reference` for family-relative,
     semantically remappable, Brand, or shared `subtle`/`vivid` formulas; evidence-backed `exact`
     for fixed source positions; `cap` for physical white, black, and their alpha variants.
   - Record the locator kind. Every `exact` must include its theme-specific source or Kiskadee
     rationale through the preset-owned `evidenceId` registry.
   - Never copy the current numeric position of a functional reference into `exact` or repeat one
     tone across unrelated families merely for convenience.
   - In an FRF preset, use only its strict resolver and locator helpers. Do not re-import the legacy
     getter, Core color lookup, or a raw color literal.
   - Derive hover, pressed, focus, selected, and disabled positions only from documented upstream
     states or an approved preset state rule. Do not invent numeric offsets silently.

7. Update the evidence in the same change.
   - Update the preset-wide color evidence when a family, ramp, recipe, or de-para changes.
   - Update `components/<component>.md` when a component role or state mapping changes.
   - Include upstream token, upstream HEX, Kiskadee family, Light/Dark tone, generated HEX, and any
     explicit adaptation.

## Missing Or Stale Mapping

Stop the schema edit and repair the source chain first when any of these is true:

- the official semantic alias cannot be traced to a primitive color;
- the required family has no approved Kiskadee tonal asset;
- the de-para lacks the relevant Light or Dark position;
- generated assets no longer match their recipe or documented generator version;
- a requested state relies only on visual inference from a screenshot.

Do not use a hardcoded color as a temporary bridge. Preserve uncertainty in the evidence document,
then resume schema work only after the missing decision is explicit.

## Validation

Before finalizing:

1. Search every touched schema for newly introduced color literals.
2. Confirm every changed locator resolves in every declared theme and segment.
3. Confirm each family-relative recipe uses `reference`, each `exact` has a registered evidence
   record, and each physical endpoint uses `cap`.
4. Run `git diff --check`.
5. Run the narrowest relevant preset or Web Builder validation required by the evidence skill.
6. Report the exact evidence document, primitive asset, semantic/intent role, locator kind, and
   functional reference/offset, exact L/D position, or cap polarity used by the schema.

Useful literal scan for a touched preset:

```sh
rg -n "#[0-9a-fA-F]{3,8}|\[[[:space:]]*[0-9.]+[[:space:]]*,[[:space:]]*[0-9.]+[[:space:]]*," \
  packages/presets/src/presets/<preset> --glob '*.schema.ts'
```
