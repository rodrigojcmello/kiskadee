import blackV1Light from './colors/black.v1.light';
import blackV1Dark from './colors/black.v1.dark';
import blackV2Light from './colors/black.v2.light';
import blackV2Dark from './colors/black.v2.dark';
import blueV1Light from './colors/blue.v1.light';
import blueV1Dark from './colors/blue.v1.dark';
import blueV2Light from './colors/blue.v2.light';
import blueV2Dark from './colors/blue.v2.dark';
import orangeV1Light from './colors/orange.v1.light';
import orangeV1Dark from './colors/orange.v1.dark';
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
  orange: {
    v1: {
      solid: {
        light: orangeV1Light,
        dark: orangeV1Dark
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
    neutral: 'primitive.blue.v2',
    purpleLike: 'primitive.orange.v1',
    redLike: 'primitive.red.v1'
  },
  dark: {
    primary: 'primitive.blue.v1',
    neutral: 'primitive.blue.v2',
    purpleLike: 'primitive.orange.v1',
    redLike: 'primitive.red.v1'
  }
} as const;
