import type { GlobalSemanticsByTheme, PrimitiveColors } from '@kiskadee/core';
import blueV1 from './colors/default/b.blue.v1.ts';
import blueSupport from './colors/default/b.blue.v2.ts';
import greenV1 from './colors/default/g.green.v1.ts';
import blackV1 from './colors/default/n.black.v1.ts';
import purpleV1 from './colors/default/p.purple.v1.ts';
import segmentPurple from './colors/default/pb.indigo.v2.ts';
import purpleSupport from './colors/default/pb.indigo.v3.ts';
import redV1 from './colors/default/r.red.v1.ts';
import pinkV1 from './colors/default/rp.magenta.v1.ts';
import yellowV1 from './colors/default/y.yellow.v1.ts';

export const primitiveColors = {
  black: { v1: blackV1 },
  blue: { v1: blueV1, v2: blueSupport },
  green: { v1: greenV1 },
  pink: { v1: pinkV1 },
  purple: { v1: purpleV1, v2: segmentPurple, v3: purpleSupport },
  red: { v1: redV1 },
  yellow: { v1: yellowV1 }
} as const satisfies PrimitiveColors;

// Neutral aliases use pure grayscale; support owns chromatic supporting surfaces.
// Pure grayscale remains directly available as primitive.black.v1.
export const globalSemantics = {
  light: {
    primary: { v1: 'primitive.blue.v1', v2: 'primitive.black.v1' },
    support: { v1: 'primitive.blue.v2' },
    neutral: { v1: 'primitive.black.v1', v2: 'primitive.black.v1' },
    purpleLike: { v1: 'primitive.pink.v1' },
    redLike: { v1: 'primitive.red.v1' },
    yellowLike: { v1: 'primitive.yellow.v1' },
    greenLike: { v1: 'primitive.green.v1' }
  },
  dark: {
    primary: { v1: 'primitive.blue.v1', v2: 'primitive.black.v1' },
    support: { v1: 'primitive.blue.v2' },
    neutral: { v1: 'primitive.black.v1', v2: 'primitive.black.v1' },
    purpleLike: { v1: 'primitive.pink.v1' },
    redLike: { v1: 'primitive.red.v1' },
    yellowLike: { v1: 'primitive.yellow.v1' },
    greenLike: { v1: 'primitive.green.v1' }
  }
} as const satisfies GlobalSemanticsByTheme;
