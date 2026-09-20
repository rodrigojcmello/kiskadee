import type { Schema } from '@kiskadee/core';

export function createCarbonIbmSeparatorSchema(): NonNullable<
  Schema<never>['components']['separator']
> {
  return {
    elements: {
      e1: {
        name: 'separator',
        separator: { 's:all': 'subtle' }
      }
    }
  };
}
