import type { SchemaTypography } from '@kiskadee/core';

export const fluent2KiskadeeTypography = {
  profiles: {
    'body-small-strong': {
      decorations: { textFont: 'body', textWeight: 'medium' },
      scales: { textSize: 12, textHeight: 16 }
    },
    'body-medium-strong': {
      decorations: { textFont: 'body', textWeight: 'medium' },
      scales: { textSize: 14, textHeight: 20 }
    },
    'body-large-strong': {
      decorations: { textFont: 'body', textWeight: 'medium' },
      scales: { textSize: 16, textHeight: 22 }
    }
  }
} as const satisfies SchemaTypography;
