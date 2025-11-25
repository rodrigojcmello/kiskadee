import type { SchemaSegments } from '@kiskadee/core';
import neutralDark from './colors/neutral.dark';
import neutralLight from './colors/neutral.light';
import primaryUnique from './colors/primary.unique';

type Segment = 'default';

export const segments: SchemaSegments<Segment> = {
  default: {
    name: 'Default',
    mainColor: 'blue',
    themes: {
      light: {
        primary: primaryUnique,
        neutral: neutralLight
      },
      dark: {
        primary: primaryUnique,
        neutral: neutralDark
      }
    }
  }
};
