import type { Schema } from '@kiskadee/core';
import type { PresetBuildExtensions } from '../../preset-build-extensions.ts';
import { createIos27AppleBrandButtonProjection } from './components/button-brand-projector.ts';

export * from './components/button-brand-projector.ts';
export * from './ios-27-apple.colors.ts';
export * from './ios-27-apple.schema.ts';

export const buildExtensions = {
  brandPacks: {
    projectionContract: 'ios-27-button-brand-projection-v1',
    packs: ['auth', 'social'],
    palettes: ['default.dark', 'default.light'],
    project: (brands) =>
      ({
        button: createIos27AppleBrandButtonProjection(brands)
      }) as unknown as Schema['components']
  }
} as const satisfies PresetBuildExtensions;
