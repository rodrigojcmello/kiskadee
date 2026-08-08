import type { SchemaTypography } from '@kiskadee/core';

export const carbonIbmTypography = {
  profiles: {
    'body-compact-01-strong': {
      decorations: { textFont: 'body', textWeight: 'medium' },
      scales: { textSize: 14, textHeight: 18 }
    },
    'label-01': {
      decorations: { textFont: 'body', textWeight: 'normal' },
      scales: { textSize: 12, textHeight: 16 }
    },
    'body-compact-01': {
      decorations: { textFont: 'body', textWeight: 'normal' },
      scales: { textSize: 14, textHeight: 18 }
    }
  }
} as const satisfies SchemaTypography;
