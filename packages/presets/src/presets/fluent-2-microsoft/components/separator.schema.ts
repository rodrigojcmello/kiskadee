import type { Schema } from '@kiskadee/core';

export function createFluent2MicrosoftSeparatorSchema(): NonNullable<
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
