# Font families

Kiskadee separates a design system's font recommendation from the resource that makes a font
available in an application.

Preset artifacts select `body`, `heading`, and optional `code` roles by a stable family id. Generated
token CSS projects those roles through `--k-font-body`, `--k-font-heading`, and `--k-font-code`.
Components consume the variables and do not import font resources.

## Native availability

Applications may provide fonts with ordinary platform tools:

```ts
import './acme-font.css';
```

This mode requires no registry or provider. It also covers `@font-face`, `next/font`, npm packages,
CDN stylesheets, system fonts, and direct host overrides of the Kiskadee variables.

## Managed preparation

`defineFontFamily` creates an inert descriptor. Its optional `prepare` callback is only invoked when
the corresponding id becomes effective:

```tsx
const acmeSans = defineFontFamily({
  id: 'acme-sans',
  stack: ['Acme Sans', 'Arial', 'sans-serif'],
  prepare: () => import('./acme-font.css')
});

<FontFamilyProvider families={[acmeSans]}>
  <App />
</FontFamilyProvider>;
```

When the active preset already publishes the stack, the descriptor may contain only `id` and
`prepare`. A host-provided family needs no descriptor at all.

Preparation is browser-only, concurrent across distinct families, and deduplicated by id. A failed
transition keeps the last applied inline variables. `useFontFamilyStatus` exposes the transition
status, a retry callback, and optional `familyResolutions` reported by successful integrations.

For example, the Fluent integration can report either local Segoe UI or online Open Sans as its
resolved preparation policy. This result does not inspect which face rendered each glyph.

The provider owns document-level selection. Nested typography scopes, source-specific adapters, and
font-file hosting remain outside this contract.
