import type { Schema } from '@kiskadee/core';

type TextComponent = NonNullable<Schema<never>['components']['text']>;

export function createFluent2MicrosoftTextSchema(): TextComponent {
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
          orange: { family: 'orange', profile: 'standard' },
          'orange-deep': { family: 'orange', profile: 'deep' },
          yellow: { family: 'yellow', profile: 'standard' },
          'yellow-deep': { family: 'yellow', profile: 'deep' }
        }
      }
    }
  };
}
