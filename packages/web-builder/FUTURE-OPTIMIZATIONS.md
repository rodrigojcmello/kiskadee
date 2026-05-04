# Future Optimizations — `@kiskadee/web-builder`

This file tracks planned optimizations that are intentionally deferred. Each entry
explains the strategy, the trigger that should make it worth doing, and a concrete
implementation sketch.

## Level 3 — In-memory state between pipeline phases

### Context

The `build-sync-generate` pipeline currently runs three phases that communicate
through the filesystem:

```
runBuild()                   → writes  build/<preset>/manifest.json
                                       build/<preset>/global.kiskadee.json
                                       build/<preset>/...
   │
   ├── syncShowcaseArtifacts()   reads  build/  → copies to showcase/public/build/
   │
   └── generateShowcaseRegistry() reads build/<preset>/manifest.json
                                  writes showcase/src/.../registry.ts
```

Levels 1 and 2 are already in place:

- **Level 1**: the three phases run in a single Node process (no `pnpm run` × 3
  spawn overhead). Entry point: `scripts/build-sync-generate.ts`.
- **Level 2**: `syncShowcaseArtifacts()` and `generateShowcaseRegistry()` run in
  parallel via `Promise.all`, after `runBuild()` finishes.

Level 3 is the next refactor and is **not** primarily about speed.

### Strategy

Make `runBuild()` return its produced manifests as a structured object, so that
`generateShowcaseRegistry()` consumes them directly instead of re-reading the
files that `runBuild()` just wrote.

`syncShowcaseArtifacts()` stays filesystem-based: it copies physical files
(CSS, JSON, binaries) into `showcase/public/build/`, and there is no benefit in
holding those bytes in memory.

Target shape:

```ts
// scripts/build-sync-generate.ts
const buildResult = await runBuild();
// buildResult.manifests = {
//   "carbon-ibm":         { ... },
//   "fluent-microsoft":   { ... },
//   "fluent-kiskadee":    { ... },
//   "ios-apple":          { ... },
//   "ios-kiskadee":       { ... },
//   "material-google":    { ... },
//   "material-kiskadee":  { ... },
// }

await Promise.all([
  syncShowcaseArtifacts(),
  generateShowcaseRegistry({ manifests: buildResult.manifests })
]);
```

### Why it is worth doing (eventually)

The raw speed gain is small (the JSON files are tiny, ~500 KB total; reading
them is in the 10–30 ms range). The real wins are architectural:

1. **Testability** — `generateShowcaseRegistry()` becomes a pure function over
   manifests. Unit tests no longer need to populate `build/` on disk; just pass
   a plain object.
2. **Composability** — any future consumer (e.g. a schema validator, a docs
   generator, a CI report) can call `runBuild()` and reuse its output without
   touching the filesystem.
3. **Single source of truth** — the canonical pipeline state becomes the object
   returned by `runBuild()`. Disk writes become a side effect, not the contract.
4. **Faster failure surface** — malformed manifests are caught in memory, with a
   stack trace pointing at the code that produced them, before any consumer
   reads them back.

### Why it is not done yet

Changing `runBuild()` from `void` to a typed return value touches every caller
(`src/run-build.ts` standalone runner, `build-sync-generate.ts`, and any future consumer). The
isolated payoff (<30 ms) does not justify the churn on its own. It pays off
when bundled with another pipeline change.

### Triggers — when to actually do this

Pull the trigger when at least one of these becomes true:

- A unit test for `generateShowcaseRegistry()` is wanted without filesystem
  setup/teardown.
- A fourth phase appears that also needs the manifests (e.g. schema diff,
  visual regression metadata).
- The pipeline starts needing a shared "build context" object that each phase
  enriches (config flags, timing data, warnings, etc.).

### Implementation sketch

1. **Define the return type** in `src/types.ts`:

   ```ts
   export type PresetManifest = { /* shape of build/<preset>/manifest.json */ };

   export type BuildResult = {
     manifests: Record<string, PresetManifest>; // keyed by preset slug
     // Optional future fields:
     // warnings: BuildWarning[];
     // timings: PhaseTimings;
   };
   ```

2. **Refactor `runBuild()`** in `src/run-build.ts` to collect manifests in
   memory while still writing them to disk (disk write stays for `sync` and for
   external consumers that depend on `build/`):

   ```ts
   export async function runBuild(): Promise<BuildResult> {
     const manifests: Record<string, PresetManifest> = {};
     for (const preset of presets) {
       const manifest = await buildOne(preset);
       manifests[preset.slug] = manifest;
       await writeManifestToDisk(preset, manifest);
     }
     return { manifests };
   }
   ```

3. **Refactor `generateShowcaseRegistry()`** in
   `scripts/generate-showcase-registry.ts` to accept manifests as input, with
   a fallback that reads from disk (for the standalone `pnpm run generate`
   case):

   ```ts
   export async function generateShowcaseRegistry(
     opts: { manifests?: Record<string, PresetManifest> } = {}
   ): Promise<void> {
     const manifests = opts.manifests ?? (await readManifestsFromDisk());
     // ...existing generation logic, parameterized over `manifests`
   }
   ```

4. **Wire it up** in `scripts/build-sync-generate.ts`:

   ```ts
   const result = await runBuild();
   await Promise.all([
     syncShowcaseArtifacts(),
     generateShowcaseRegistry({ manifests: result.manifests })
   ]);
   ```

5. **Keep the standalone entry points working**:
   - `src/run-build.ts`: standalone IIFE-guard calls `await runBuild()` (ignore the return).
   - `scripts/generate-showcase-registry.ts`: standalone IIFE-guard calls without args; the
     function falls back to reading from disk.

6. **Update tests**: at least one new unit test for
   `generateShowcaseRegistry()` that passes a hand-crafted `manifests` object
   and asserts on the generated `registry.ts` content (string compare or AST).

### Risks and trade-offs

- **Memory footprint**: holding all manifests in RAM is trivial today (~500 KB).
  If the preset count grows by 10× and each manifest grows too, this stays well
  under 100 MB — still negligible.
- **Drift risk**: the disk fallback in `generateShowcaseRegistry()` must stay
  in sync with the in-memory shape. Keep both paths covered by tests.
- **API surface**: `BuildResult` becomes part of the public contract of
  `runBuild()`. Treat it as a versioned shape; additive changes only.

### Expected outcome

- `build-sync-generate` total time: marginal change (likely &lt;30 ms faster).
- Unit test setup for the registry generator: drops from "populate `build/`
  fixture tree" to "pass an object literal".
- Future phase additions: gain a clean integration point.
