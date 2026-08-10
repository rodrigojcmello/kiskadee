import type { SchemaTypography } from '@kiskadee/core';

export const fluent2KiskadeeTypography = {
  profiles: {
    'label-small': {
      decorations: { textFont: 'body', textWeight: 'medium' },
      scales: { textSize: 12, textHeight: 16 }
    },
    'label-medium': {
      decorations: { textFont: 'body', textWeight: 'medium' },
      scales: { textSize: 14, textHeight: 20 }
    },
    'label-large': {
      decorations: { textFont: 'body', textWeight: 'medium' },
      scales: { textSize: 16, textHeight: 22 }
    }
  }
} as const satisfies SchemaTypography;
