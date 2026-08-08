# Font Families

Preset font declarations are recommendations, not resource-loading instructions. They describe
which font-family stacks belong to a design system and which semantic text roles use them.

## Authoring Contract

Declare reusable families under `global.fonts.families` and connect them to semantic roles under
`global.fonts.roles`:

```ts
global: {
  fonts: {
    families: {
      roboto: {
        stack: ['Roboto', 'Arial', 'sans-serif']
      },
      'roboto-mono': {
        stack: ['Roboto Mono', 'monospace']
      }
    },
    roles: {
      body: 'roboto',
      heading: 'roboto',
      code: 'roboto-mono'
    }
  }
}
```

The contract has these invariants:

- `global.fonts` is optional, but `roles.body` is required when it is declared;
- every role must reference a family declared in the same catalog;
- family IDs use lowercase kebab-case and remain stable when a stack gains another fallback;
- each stack contains at least one non-empty font-family name and may contain any number of
  fallbacks;
- omitted `heading` means that consumers reuse `body`;
- omitted `code` means that platform consumers use their documented system-monospace fallback;
- the legacy `fonts.body` and `fonts.heading` stack shape is not supported.

Use one catalog entry for every distinct stack, even when multiple roles select that entry. Do not
duplicate the same stack under role-shaped keys.

## Ownership Boundary

The preset owns only the family ID, ordered stack, and semantic role recommendation. It must not
contain URLs, font files, package names, `@font-face` declarations, Google Fonts parameters, or
runtime preparation callbacks.

Applications remain responsible for making a recommended family available. They may use native
CSS imports, local corporate assets, `next/font`, npm packages, CDNs, document links, or an optional
Kiskadee runtime family descriptor. A family does not need a runtime descriptor when the host
already supplies it.

Public online families curated by Kiskadee may be prepared through `@kiskadee/fonts`. That package
owns optional provider adapters without changing this schema boundary; consumers still register
each managed family or preset integration explicitly.

This separation allows the same preset to work with public, self-hosted, authenticated, or
corporate font sources without changing its schema. It also prevents choosing a preset from
implicitly downloading a resource.

## Preset Adaptation

When migrating or updating an official preset, preserve the upstream font recommendation as an
ordered stack. Creating the catalog ID is a Kiskadee authoring decision; it does not change the
upstream typography evidence.

Do not invent a font recommendation for a preset whose source has not established one. In
particular, a missing `global.fonts` declaration is different from an explicit system-font catalog:
the former leaves typography entirely to the consuming application.

`fluent-2-microsoft` declares its Web stack from Fluent's official typography guidance and token
source. It adds Open Sans after the Segoe aliases so non-Windows applications can opt into a public
online fallback without redistributing the proprietary Segoe files. This insertion is an explicit
Kiskadee adaptation recorded in the preset source evidence.
`fluent-2-kiskadee` deliberately remains without a font-family recommendation. Its typography
profiles define semantic roles and metrics, while the consuming application continues to own the
actual family because no separate source-backed family recommendation has been established.
