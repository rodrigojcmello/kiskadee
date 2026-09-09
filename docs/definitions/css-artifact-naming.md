# CSS Artifact Naming

Status: canonical naming convention for new framework CSS artifacts.

## Purpose

Compact names reduce repeated bytes in stylesheets, DOM class attributes and inline styles.
This rule applies to global tokens, generated variables, component structural variables and
runtime projections. It is not restricted to structural Sass. Schema/API names remain descriptive.

## Rules

- Framework custom properties start with `--k-`; stable framework classes start with `k-`.
- Use short, documented abbreviations. Do not copy long schema paths into emitted names.
- Global variables use `--k-<purpose>`. Component-local variables use `--k-<cmp>-<purpose>`;
  component IDs follow the three-letter registry in [Structural CSS](../../STRUCTURAL-CSS.md).
- Check repository-wide collisions before adding a name. One emitted name has one contract owner.
- Record descriptive meaning, emitted name, owner and scope in the owning contract. Comments
  explain compact structural names; readability belongs in source documentation, not payload size.
- Consume canonical variables directly. Do not introduce descriptive or compact relay aliases.
- Define mandatory defaults at the owning scope, not repeated `var()` fallbacks at each consumer.
- Generated atomic class naming remains owned by the Builder's existing compact class allocator;
  structural class grammar remains in Structural CSS. This document does not replace either.
- Existing names are compatibility contracts. Rename them only in an explicit migration, not as
  incidental cleanup. No legacy-variable migration is included in this change.

## Global custom-property registry

| Public meaning | Emitted name | Owner | Scope |
| --- | --- | --- | --- |
| `global.interaction.controlCursor` effective value | `--k-cc` | Core contract, preset authorship, Web Builder emission | Global inherited preference, scoped application override |

Existing examples include `--k-bdr` (emitted radius) and `--k-dur-int` (interaction duration).
Component-local examples include `--k-tab-w` and `--k-txf-rts`; their specific meaning and lifecycle
remain documented by their owners. See [cursor policy](cursor-policy.md) for precedence and use.
