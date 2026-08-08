import type { SchemaTypography } from '@kiskadee/core';

export const elegantTypography = {
  profiles: {
    'button-label': {
      decorations: { textFont: 'body', textWeight: 'medium' },
      scales: { textSize: 17, textHeight: 18 }
    },
    body: {
      decorations: { textFont: 'body', textWeight: 'normal' },
      scales: { textSize: 17, textHeight: 22 }
    }
  }
} as const satisfies SchemaTypography;
