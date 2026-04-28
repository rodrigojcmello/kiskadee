import blackV1Dark from './colors/black.v1.dark';
import blackV1Light from './colors/black.v1.light';
import blackV2Dark from './colors/black.v2.dark';
import blackV2Light from './colors/black.v2.light';
import blueV1Dark from './colors/blue.v1.dark';
import blueV1Light from './colors/blue.v1.light';
import pinkV1Dark from './colors/pink.v1.dark';
import pinkV1Light from './colors/pink.v1.light';
import purpleV1Dark from './colors/purple.v1.dark';
import purpleV1Light from './colors/purple.v1.light';
import redV1Dark from './colors/red.v1.dark';
import redV1Light from './colors/red.v1.light';
import yellowV1Dark from './colors/yellow.v1.dark';
import yellowV1Light from './colors/yellow.v1.light';

export const primitiveColors = {
  black: {
    v1: {
      solid: {
        light: blackV1Light,
        dark: blackV1Dark
      }
    },
    v2: {
      solid: {
        light: blackV2Light,
        dark: blackV2Dark
      }
    }
  },
  blue: {
    v1: {
      solid: {
        light: blueV1Light,
        dark: blueV1Dark
      }
    }
  },
  pink: {
    v1: {
      solid: {
        light: pinkV1Light,
        dark: pinkV1Dark
      }
    }
  },
  purple: {
    v1: {
      solid: {
        light: purpleV1Light,
        dark: purpleV1Dark
      }
    }
  },
  red: {
    v1: {
      solid: {
        light: redV1Light,
        dark: redV1Dark
      }
    }
  },
  yellow: {
    v1: {
      solid: {
        light: yellowV1Light,
        dark: yellowV1Dark
      }
    }
  }
} as const;

export const globalSemantics = {
  light: {
    primary: { v1: 'primitive.purple.v1', v2: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1', v2: 'primitive.black.v2' },
    purpleLike: { v1: 'primitive.pink.v1' },
    redLike: { v1: 'primitive.red.v1' },
    yellowLike: { v1: 'primitive.yellow.v1' }
  },
  dark: {
    primary: { v1: 'primitive.purple.v1', v2: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1', v2: 'primitive.black.v2' },
    purpleLike: { v1: 'primitive.pink.v1' },
    redLike: { v1: 'primitive.red.v1' },
    yellowLike: { v1: 'primitive.yellow.v1' }
  }
} as const;
