import type { Schema } from '@kiskadee/core';

type TextComponent = NonNullable<Schema<never>['components']['text']>;

export function createFluent2MicrosoftTextSchema(): TextComponent {
  return {
    elements: {
      e1: {
        name: 'foreground',
        foreground: {
          neutral: 'neutral',
          blue: 'blue',
          red: 'red',
          green: 'green',
          purple: 'purple',
          orange: 'orange',
          yellow: 'yellow'
        }
      }
    }
  };
}
