import type { Schema } from '@kiskadee/core';
import type { PresetBuildExtensions } from '../../preset-build-extensions.ts';
import { createFluent2MicrosoftBrandButtonProjection } from './components/button-brand-projector.ts';

export * from './components/button-brand-projector.ts';
export * from './fluent-2-microsoft.colors.ts';
export * from './fluent-2-microsoft.schema.ts';

export const buildExtensions = {
  brandPacks: {
    projectionContract: 'fluent-button-brand-projection-v1',
    packs: ['auth', 'social'],
    palettes: ['default.dark', 'default.darker', 'default.light'],
    project: (brands) =>
      ({
        button: createFluent2MicrosoftBrandButtonProjection(brands)
      }) as unknown as Schema['components']
  }
} as const satisfies PresetBuildExtensions;
