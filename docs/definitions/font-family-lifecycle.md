# Font family lifecycle

Kiskadee models font selection independently from font delivery.

Font availability and role selection are also independent from reusable text metrics. See
[Typography profiles](typography-profiles.md) for the profile, component-scale, HTML-semantics, and
user-enlargement contract.

## Ownership

- Core defines serializable family catalogs, semantic `body`, `heading`, and `code` roles, and the
  pure CSS font-stack serializer shared by build and runtime consumers. The dedicated
  `@kiskadee/core/font-family` entrypoint keeps this Web projection isolated from the Core barrel
  and its unrelated contracts.
- Presets recommend family IDs and fallback stacks.
- Fonts owns optional online provider adapters and preset integrations.
- Web Builder projects the roles into CSS variables and publishes descriptive artifacts.
- Runtime optionally coordinates preparation for selected resources.
- React Components applies document-level overrides and exposes preparation status.
- The host application owns activation, overrides, local files, authentication, and custom source
  tools.

Schema families never contain URLs, file paths, packages, or callbacks. Declaring a family also
never means that Kiskadee will download it.

## Native mode

A host can make a recommended family available using ordinary CSS, `@font-face`, `next/font`, an
npm stylesheet, or a link in the document. No Kiskadee runtime registration is required. Generated
CSS continues to select the family through:

```css
--k-font-body
--k-font-heading
--k-font-code
```

If the host already supplies a family, no runtime descriptor is required. Missing families advance
through the declared CSS stack without producing an error.

## Managed mode

`defineFontFamily` can associate a stable family ID with an optional stack and an inert `prepare`
callback. `FontFamilyProvider` invokes that callback only after the family becomes effective.
Distinct families prepare concurrently; repeated selections reuse successful work.

A callback may optionally report which family satisfied the policy:

```ts
return {
  family: 'Open Sans',
  source: 'online',
  fallbackFor: 'Segoe UI'
};
```

`useFontFamilyStatus` exposes these preparation outcomes as `familyResolutions`. They describe the
family made available by the integration, not a per-glyph audit of the browser's rendered face.

The callback defines readiness for the integration. Resolving a dynamic CSS import means the CSS
module is available. A host that must also wait for a font face can await `document.fonts.load`
inside the callback.

Official preset integrations can be registered directly from the shared resource package:

```tsx
import {
  fluent2MicrosoftFontFamilies
} from '@kiskadee/fonts/presets/fluent-2-microsoft';

<FontFamilyProvider families={fluent2MicrosoftFontFamilies}>
  <App />
</FontFamilyProvider>;
```

Preparation failure keeps the previously applied inline selection. Preset token CSS still provides
the first-render recommendation, and native CSS fallback remains the final availability mechanism.

## Performance invariant

The framework does not scan packages or eagerly prepare registered families. Registration alone
cannot add a connection, preconnect, stylesheet, or font request. Static imports remain an explicit
host decision and follow the host bundler's loading behavior.
Font preparation is exposed through the isolated `@kiskadee/runtime/font-family` entrypoint so
consumers do not pull dynamic color generation or tonal-scale dependencies into this path.

`@kiskadee/fonts/catalog` publishes lightweight selectable metadata and lazy descriptor loaders.
Individual online families and preset integrations remain available through explicit subpaths.
Reading the catalog cannot request a stylesheet or font, and loading one descriptor cannot prepare
it. Kiskadee does not redistribute font binaries; applications may replace every online integration
with local CSS, `next/font`, npm packages, or their own `prepare` callbacks.

Icon families reuse parts of this lifecycle vocabulary through their own provider, but Kiskadee
does not expose a generic cross-resource provider.
