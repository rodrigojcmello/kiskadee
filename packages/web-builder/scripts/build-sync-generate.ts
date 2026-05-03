/**
 * Single-process orchestrator for the web-builder pipeline.
 *
 * Replaces the legacy `pnpm run build && pnpm run sync && pnpm run generate`
 * chain (which paid ~3x `pnpm run` + `node` spawn overhead, ~860ms).
 *
 * Pipeline:
 *   1. runBuild()                                 (sequential — produces build/**)
 *   2. syncShowcaseArtifacts() || generateShowcaseRegistry()
 *      (parallel — both only read from build/, write to disjoint targets)
 */
import { runBuild } from '../src/run-build.ts';
import { generateShowcaseRegistry } from './generate-showcase-registry.ts';
import { syncShowcaseArtifacts } from './sync-showcase-artifacts.ts';

await runBuild();
await Promise.all([syncShowcaseArtifacts(), generateShowcaseRegistry()]);
