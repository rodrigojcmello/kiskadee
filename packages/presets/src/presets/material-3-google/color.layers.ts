import blackV1Light from './colors/black.v1.light';
import blackV1Dark from './colors/black.v1.dark';
import blackV2Light from './colors/black.v2.light';
import blackV2Dark from './colors/black.v2.dark';
import blueV1Light from './colors/blue.v1.light';
import blueV1Dark from './colors/blue.v1.dark';
import blueV2Light from './colors/blue.v2.light';
import blueV2Dark from './colors/blue.v2.dark';
import cyanV1Light from './colors/cyan.v1.light';
import cyanV1Dark from './colors/cyan.v1.dark';
import redV1Light from './colors/red.v1.light';
import redV1Dark from './colors/red.v1.dark';

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
    },
  },
  blue: {
    v1: {
      solid: {
        light: blueV1Light,
        dark: blueV1Dark
      }
    },
    v2: {
      solid: {
        light: blueV2Light,
        dark: blueV2Dark
      }
    },
  },
  cyan: {
    v1: {
      solid: {
        light: cyanV1Light,
        dark: cyanV1Dark
      }
    },
  },
  red: {
    v1: {
      solid: {
        light: redV1Light,
        dark: redV1Dark
      }
    },
  },
} as const;

export const globalSemantics = {
  light: {
    primary: 'primitive.blue.v1',
    neutral: 'primitive.cyan.v1',
    purpleLike: 'primitive.blue.v2',
    redLike: 'primitive.red.v1'
  },
  dark: {
    primary: 'primitive.blue.v1',
    neutral: 'primitive.cyan.v1',
    purpleLike: 'primitive.blue.v2',
    redLike: 'primitive.red.v1'
  }
} as const;
