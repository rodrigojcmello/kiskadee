# Online Font Integrations

`@kiskadee/fonts` is the optional integration boundary for public online font providers and preset
fallback policies. It does not redistribute font binaries.

## Ownership

- Presets recommend family IDs, ordered stacks, and semantic roles.
- This package owns online provider adapters and preset-specific preparation policies.
- Runtime coordinates preparation only after a registered family becomes selected.
- Applications decide whether to use managed online preparation, native CSS, or a custom source.
- Local and corporate font files remain application-owned.

The package does not modify preset schemas. Importing or registering a descriptor cannot create a
connection, preconnect, stylesheet, or font request.

## Subpath Boundary

Online families are exposed through explicit provider subpaths. There is intentionally no root
barrel that imports every family:

```ts
import { openSansFontFamily } from '@kiskadee/fonts/google/open-sans';
```

Preset fallback policies use a separate namespace:

```tsx
import {
  fluent2MicrosoftFontFamilies
} from '@kiskadee/fonts/presets/fluent-2-microsoft';

<FontFamilyProvider families={fluent2MicrosoftFontFamilies}>
  <App />
</FontFamilyProvider>;
```

Registration remains inert. When the active preset selects `segoe-ui`, the integration preserves
an installed Segoe UI and prepares Open Sans from Google Fonts only when required.

## Public Catalog

`@kiskadee/fonts/catalog` is the source of truth for applications that need to present every
selectable Kiskadee integration:

```ts
import { fontFamilyCatalog } from '@kiskadee/fonts/catalog';
```

Each entry contains its stable ID, display metadata, stack, provider classification, optional
fallback name, and a lazy `load()` callback. Reading the catalog imports no family descriptor.
`load()` imports only the selected descriptor, remains network-inert, deduplicates concurrent work,
and retries a failed module import on the next call.

The catalog contains integrations, not every possible CSS family. Native stacks supplied only by a
host or preset do not become selectable catalog entries automatically.

## Performance

- Importing and registering descriptors are network-inert.
- Reading catalog metadata and loading a descriptor are network-inert.
- Only a selected family's `prepare` callback can start a request.
- Runtime preparation is deduplicated by family ID; provider stylesheets are deduplicated by URL.
- A failed stylesheet is removed so preparation can be retried.
- Google Fonts receives only the explicitly declared family and weights with `display=swap`.
- A selected Google integration waits up to five seconds for every declared weight before the
  provider applies its stack; failure preserves the previously selected family and remains
  retryable.
- Font binaries remain request-free for unselected families. Selecting a family prepares its
  declared weights together so later strong text does not introduce a second visual swap.
- Adding future providers or catalog entries must not expand an existing integration's request set.

An official preset's recommended integration must include every weight used by that preset's
typography profiles. The catalog does not inflate every family to the union of weights used by all
other presets: an arbitrary Showcase family override may therefore use the browser's nearest or
synthetic weight when that family does not publish the requested face. This keeps each adapter's
request set faithful and bounded.

Successful preparations may identify the local or online family that satisfied the integration.
This result supports explanatory UI but does not claim to identify every face used to render every
glyph.

## Host-owned alternatives

Applications may omit every online descriptor and provide the exact schema family name through
`@font-face`, framework tooling, npm packages, local corporate assets, or a document stylesheet.
Missing families advance through the preset stack without a Kiskadee error.

Online integrations require network access and a compatible Content Security Policy. Applications
with offline, privacy, regional, or availability requirements should provide their own source and
leave the corresponding Kiskadee `prepare` descriptor unregistered.
