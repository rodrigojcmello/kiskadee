import { checkSurfaceContexts, generateSurfaceContexts } from './io.ts';
import { loadSurfacePresets } from './load-presets.ts';

const args = process.argv.slice(2);
if (args.length && (args.length !== 1 || args[0] !== '--check')) {
  throw new Error('Usage: node src/run-build.ts [--check]');
}
const presets = await loadSurfacePresets();
if (args[0] === '--check') {
  await checkSurfaceContexts(presets);
  console.log(`[surface-builder] Verified ${presets.length} portable surface maps.`);
} else {
  await generateSurfaceContexts(presets);
  console.log(`[surface-builder] Generated ${presets.length} portable surface maps.`);
}
