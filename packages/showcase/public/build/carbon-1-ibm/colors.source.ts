import type { SchemaSegments } from '@kiskadee/core';
import blackLight from './colors/black.light';
import blueLight from './colors/blue.light';

type Segment = 'default';

export const segments: SchemaSegments<Segment> = {
  default: {
    name: 'Default',
    mainColor: 'blue',
    themes: {
      light: {
        primary: blueLight,
        neutral: blackLight
      }
    }
  }
};
