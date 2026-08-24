# Schema-to-Web Composition Patterns

Status: canonical cross-package definition.

This document centralizes the named Kiskadee patterns that connect Schema authorship to generated
Web artifacts and Structural CSS. The patterns are complementary, not interchangeable.

Use [Composition strategies](./composition-strategies.md) before this definition when the broader
decision is still between a component, slot, profile, Effect, Provider, platform mechanic, or Web
composition pattern.

## Pattern selection

| Pattern | Use when | Authority retained by |
| --- | --- | --- |
| **SEP** | One authored Style Key needs a specific Web emission shape. | Web Builder policy |
| **SUP** | Another structural owner needs an existing token-only utility class. | Source Schema element |
| **CSC** | One element owns base and conditional spacing that compose additively. | Same Schema element |

## SEP — Style Emission Policy

SEP decides whether an authored Style Key emits direct CSS, a token, mirrored declarations, or
another approved Web shape. It does not decide which DOM node consumes the utility and does not
move authorship between elements.

Use the complete [Style Emission Policy definition](../../packages/web-builder/docs/definitions/style-emission-policy.md).

## SUP — Structural Utility Projection

SUP republishes a reference to an existing token-only utility class under an approved structural
artifact bucket. It is required when normal class resolution cannot attach that utility to the
structural node that needs it. SUP never copies raw values or changes the utility's CSS shape.

Use the complete [Structural Utility Projection definition](../../packages/web-builder/docs/definitions/structural-utility-projections.md).

## CSC — Complementary Spacing Composition

CSC combines two independently authored spacing properties from the same Schema element:

- a base spacing that participates in the element's normal geometry; and
- a complementary spacing emitted as a token and applied only under a structural condition.

The properties remain independent even when they currently share the same numeric value. Structural
CSS decides when the complementary spacing participates, but never invents, copies, or calculates
its value.

### Eligibility

Use CSC only when all conditions hold:

1. Both spacing values belong to the same Schema element.
2. Their additive composition expresses a stable visual relationship.
3. Structural CSS can determine the activation condition from local composition.
4. The complementary property uses the existing padding or margin vocabulary.
5. Missing complementary authorship means the conditional adjustment is unavailable; no fallback is
   synthesized.

Do not use CSC to reuse another element's value, infer a difference between two values, or encode a
behavioral option. Use SUP for a different structural owner, SEP for emission shape, and component
options for behavior.

### Canonical example

Fluent Dropdown `e9 (dropdown-group-label)` owns:

- `paddingLeft`: its always-on inline-start inset; and
- `marginLeft`: its complementary inline-start inset.

The Web Builder emits `marginLeft` as `--k-mgl`. Structural CSS consumes it as
`margin-inline-start` only when the containing `Dropdown.Items` collection contains no leading icon
or selection track. RTL changes the physical side, not the authored relationship.

## Governance

- Core defines which standard scale properties each element may author.
- Presets own concrete values.
- Web Builder owns SEP, SUP compilation, and generated artifacts.
- p-react owns the local structural condition and logical-axis application.
- Showcase only demonstrates and validates the public result.
