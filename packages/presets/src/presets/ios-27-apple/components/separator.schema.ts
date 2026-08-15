import type { Schema } from '@kiskadee/core';
import type { Segment } from '../ios-27-apple.schema.ts';

export function createIos27AppleSeparatorSchema(): NonNullable<
  Schema<Segment>['components']['separator']
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
