import type { Schema } from '@kiskadee/core';

export function createMaterial3GoogleSeparatorSchema(): NonNullable<
  Schema<'purple'>['components']['separator']
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
