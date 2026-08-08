import type { SchemaTypography } from '@kiskadee/core';

export const ios18AppleTypography = {
  profiles: {
    body: {
      decorations: { textFont: 'body', textWeight: 'normal' },
      scales: { textSize: 17, textHeight: 22 }
    }
  }
} as const satisfies SchemaTypography;
