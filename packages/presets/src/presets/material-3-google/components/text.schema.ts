import type { Schema } from '@kiskadee/core';

export function createMaterial3GoogleTextSchema(): NonNullable<
  Schema<never>['components']['text']
> {
  return {
    elements: {
      e1: {
        name: 'foreground',
        foreground: {
          neutral: { family: 'neutral', profile: 'standard' },
          blue: { family: 'blue', profile: 'standard' },
          'blue-deep': { family: 'blue', profile: 'deep' },
          red: { family: 'red', profile: 'standard' },
          'red-deep': { family: 'red', profile: 'deep' },
          green: { family: 'green', profile: 'standard' },
          'green-deep': { family: 'green', profile: 'deep' },
          purple: { family: 'purple', profile: 'standard' },
          'purple-deep': { family: 'purple', profile: 'deep' },
          pink: { family: 'pink', profile: 'standard' },
          'pink-deep': { family: 'pink', profile: 'deep' },
          yellow: { family: 'yellow', profile: 'standard' },
          'yellow-deep': { family: 'yellow', profile: 'deep' }
        }
      }
    }
  };
}
