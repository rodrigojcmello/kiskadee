import type { Schema } from '@kiskadee/core';

export function createMaterial3GoogleSeparatorSchema(): NonNullable<
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
