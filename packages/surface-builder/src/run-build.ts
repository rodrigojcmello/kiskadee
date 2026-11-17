import { generateSurfaceContexts } from './io.ts';
import { loadSurfacePresets } from './load-presets.ts';

const presets = await loadSurfacePresets();
await generateSurfaceContexts(presets);
console.log(`[surface-builder] Generated ${presets.length} portable surface maps.`);
