# ESM Migration Rules

This document captures the operating rules and known gotchas for the
monorepo's adoption of native ESM with explicit `.ts`/`.tsx` import
extensions, plus the workarounds required at build time.

## Why this exists

The monorepo runs TypeScript directly under Node 22+ via
`node --experimental-strip-types` and uses `esbuild` to emit production
artifacts. Both paths require a single, consistent module convention
across packages. We picked **native ESM with explicit TS extensions on
relative imports**, aligning with Deno/Bun and the direction of Node's
type-stripping support.

This decision exposes two upstream gaps in the current ecosystem (TS
5.9.x, esbuild 0.25.x). The `react-components` build is the only place
that is impacted by both gaps simultaneously, because it is the only
package that emits both runtime `.js` and distributable `.d.ts`.

## Convention

- Relative imports use the **real source extension** in the source code:
  - `./foo.ts`, `../bar.tsx`, `./baz/index.ts`.
- Bare specifiers (`@kiskadee/core`, `node:path`, `react`) are left as-is
  — they are resolved via package `exports`, not by file extension.
- Asset imports keep their natural extension (`.css`, `.scss`, `.json`).
- `JSON` imports use ESM import attributes when applicable
  (`with { type: 'json' }`).

`tsconfig.base.json` enables this convention monorepo-wide:

```jsonc
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true
    // ...
  }
}
```

Packages that need to emit declaration files override `noEmit` and
`allowImportingTsExtensions` in a dedicated `tsconfig.build.json`
(see `packages/components/react`).

## Runtime split per package

| Package                  | Runtime                                | Emits to `dist/`?         |
|--------------------------|----------------------------------------|---------------------------|
| `@kiskadee/core`         | imported by others                     | no (consumed as `src/`)   |
| `@kiskadee/css-build`    | imported by others                     | no                        |
| `@kiskadee/presets`      | imported by others                     | no                        |
| `@kiskadee/web-builder`  | esbuild bundle (`*.bundled.js`)        | no (internal scripts)     |
| `@kiskadee/react-components` | esbuild (`bundle: false`) + `tsc`  | yes (`.js`, `.d.ts`, CSS) |

Only the last package needs the workaround described below.

## The two upstream gaps

### Gap 1 — `tsc` does not rewrite extensions in `.d.ts`

TypeScript's `rewriteRelativeImportExtensions` flag rewrites `.ts` →
`.js` in emitted `.js` files, but **not** in emitted `.d.ts` files. This
is tracked upstream as
[microsoft/TypeScript#61037](https://github.com/microsoft/TypeScript/issues/61037)
and is unresolved as of TS 5.9.x.

A consumer importing `@kiskadee/react-components` would receive
`.d.ts` files containing `import { X } from './Foo.types.ts'`, which
breaks tooling that performs strict ESM resolution against the
distributable.

### Gap 2 — `esbuild` with `bundle: false` preserves specifiers

`esbuild` only rewrites import specifiers when bundling. When emitting
one-to-one outputs (`bundle: false`), the original specifier is
preserved verbatim. Our `react-components` build needs `bundle: false`
so consumers can tree-shake at the component level, so esbuild's own
rewriting cannot help us.

## Workaround — `dist/` extension rewrite

To close both gaps without changing the source convention, the
`react-components` build runs a final step that rewrites relative
specifiers ending in TS extensions to their JS counterparts inside
every emitted artifact.

- Script: `packages/components/react/scripts/rewrite-dist-extensions.ts`.
- Inputs: `dist/**/*.{js,mjs,cjs,d.ts,d.mts,d.cts}`.
- Rules:
  - `./x.ts`  → `./x.js`
  - `./x.tsx` → `./x.js`
  - `./x.mts` → `./x.mjs`
  - `./x.cts` → `./x.cjs`
- Scope: relative specifiers only (`./`, `../`). Bare specifiers and
  alias imports are untouched.
- Statement coverage: `import ... from`, `export ... from`,
  `export * from`, side-effect `import './x.ts'`, dynamic
  `import('./x.ts')`.

The script is invoked at the end of the orchestrated build:

```ts
// scripts/build.ts
await Promise.all(
  skipTypes
    ? [buildAllJavaScript(), buildAllStyles()]
    : [buildAllJavaScript(), buildAllStyles(), buildTypes()]
);

await rewriteDistExtensions();
```

After this step, a typical `dist/Button/Button.{js,d.ts}` looks like:

```ts
import { ButtonCore } from './ButtonCore.js';
import type { ButtonProps } from './Button.types.js';
```

## Adding a new package

If a new workspace package needs to emit a public `dist/`, replicate
the `react-components` setup:

1. Inherit `tsconfig.base.json` and add a `tsconfig.build.json` that
   sets `noEmit: false` and (optionally) keeps
   `allowImportingTsExtensions: true` so source files compile.
2. Use `esbuild` to emit `.js`. Prefer `bundle: false` for libraries.
3. Use `tsc -p tsconfig.build.json --emitDeclarationOnly` for `.d.ts`.
4. Run a `rewriteDistExtensions`-equivalent step as the final build
   stage. The current script is intentionally generic and can be lifted
   into a shared helper if a second package needs it.

If a package does **not** emit `dist/` (it is consumed as source by
other workspace packages), no workaround is needed — Node strip-types
and esbuild bundling both handle the `.ts` specifiers natively.

## When this workaround can be removed

- TypeScript fixes
  [#61037](https://github.com/microsoft/TypeScript/issues/61037) so that
  `rewriteRelativeImportExtensions` also covers `.d.ts` output, **and**
- esbuild gains a flag (or we add a small plugin) that rewrites TS
  extensions when `bundle: false`.

Until both happen, the `dist/` rewrite step is the source of truth for
extension correctness in published artifacts.
