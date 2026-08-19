import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  KiskadeeHexScale,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import { invertKiskadeeHexScale } from '@kiskadee/core';

const primaryScale = {
  0: '#ffffff',
  1: '#fcfdff',
  2: '#f9fbff',
  3: '#f6f9ff',
  4: '#f3f7ff',
  5: '#f0f5ff',
  6: '#ebf1ff',
  7: '#e6eeff',
  8: '#e1eafe',
  9: '#dce7fe',
  10: '#d7e4fe',
  12: '#d0defd',
  14: '#c9d9fc',
  16: '#c2d3fb',
  18: '#bacefa',
  20: '#b3c8f9',
  22: '#a9c0f7',
  24: '#9eb8f6',
  26: '#94b0f4',
  28: '#8aa8f1',
  30: '#809fef',
  35: '#6a8eec',
  40: '#547ce8',
  45: '#3e6ae5',
  50: '#2856e2',
  55: '#204cd5',
  60: '#1942c8',
  65: '#1539b7',
  70: '#1131a7',
  75: '#0d2a96',
  80: '#0a2385',
  85: '#061a6e',
  90: '#041258',
  95: '#010c42',
  99: '#000832',
  100: '#000000'
} as const satisfies KiskadeeHexScale;

const neutralScale = {
  0: '#ffffff',
  1: '#fdfdfe',
  2: '#fbfcfd',
  3: '#f9fafb',
  4: '#f8f8fa',
  5: '#f6f7f9',
  6: '#f3f4f7',
  7: '#f0f1f5',
  8: '#edeff3',
  9: '#eaecf0',
  10: '#e7e9ee',
  12: '#e2e5eb',
  14: '#dee1e7',
  16: '#d9dce3',
  18: '#d5d8e0',
  20: '#d0d4dc',
  22: '#c9cdd7',
  24: '#c2c7d1',
  26: '#bcc0cc',
  28: '#b5bac6',
  30: '#aeb3c1',
  35: '#9da3b3',
  40: '#8d93a5',
  45: '#7e859a',
  50: '#70778f',
  55: '#646b81',
  60: '#595e73',
  65: '#4d5265',
  70: '#424657',
  75: '#363a49',
  80: '#2b2e3b',
  85: '#22242f',
  90: '#191b24',
  95: '#12141b',
  99: '#0d0e15',
  100: '#000000'
} as const satisfies KiskadeeHexScale;

const positiveScale = {
  0: '#ffffff',
  1: '#fcfefd',
  2: '#f8fefb',
  3: '#f5fdf9',
  4: '#f1fdf8',
  5: '#eefcf6',
  6: '#e9fbf3',
  7: '#e4faf0',
  8: '#def9ed',
  9: '#d9f8eb',
  10: '#d4f7e8',
  12: '#ccf5e3',
  14: '#c4f3de',
  16: '#bcf1da',
  18: '#b4efd5',
  20: '#abedd0',
  22: '#a2eacb',
  24: '#99e7c5',
  26: '#90e4bf',
  28: '#86e1ba',
  30: '#7cdeb4',
  35: '#63d7a4',
  40: '#43d093',
  45: '#36c587',
  50: '#26ba7a',
  55: '#20aa6e',
  60: '#199a62',
  65: '#148a57',
  70: '#0f7b4c',
  75: '#0c6c42',
  80: '#085e39',
  85: '#054e2f',
  90: '#033f25',
  95: '#022e1b',
  99: '#012113',
  100: '#000000'
} as const satisfies KiskadeeHexScale;

const negativeScale = {
  0: '#ffffff',
  1: '#fffcfc',
  2: '#fff9fa',
  3: '#fff6f7',
  4: '#fff3f5',
  5: '#fff0f2',
  6: '#ffeaed',
  7: '#ffe4e8',
  8: '#fedee3',
  9: '#fed8df',
  10: '#fed2da',
  12: '#fdcad2',
  14: '#fcc2cb',
  16: '#fcbac4',
  18: '#fbb1bd',
  20: '#f9a9b6',
  22: '#f89ead',
  24: '#f794a4',
  26: '#f58a9b',
  28: '#f37f92',
  30: '#f17489',
  35: '#ed5c72',
  40: '#e7405c',
  45: '#e1304c',
  50: '#da1b3b',
  55: '#ca1734',
  60: '#ba122e',
  65: '#a90f28',
  70: '#980b23',
  75: '#86091e',
  80: '#740618',
  85: '#610414',
  90: '#4f020f',
  95: '#3b010b',
  99: '#2c0008',
  100: '#000000'
} as const satisfies KiskadeeHexScale;

export const primitiveColors = {
  blue: {
    v1: {
      kind: 'static',
      scales: { light: primaryScale, dark: invertKiskadeeHexScale(primaryScale) }
    }
  },
  black: {
    v1: {
      kind: 'static',
      scales: { light: neutralScale, dark: invertKiskadeeHexScale(neutralScale) }
    }
  },
  green: {
    v1: {
      kind: 'static',
      scales: { light: positiveScale, dark: invertKiskadeeHexScale(positiveScale) }
    }
  },
  red: {
    v1: {
      kind: 'static',
      scales: { light: negativeScale, dark: invertKiskadeeHexScale(negativeScale) }
    }
  }
} as const satisfies PrimitiveColors;

export const globalSemantics = {
  light: {
    primary: { v1: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1' },
    greenLike: { v1: 'primitive.green.v1' },
    redLike: { v1: 'primitive.red.v1' }
  },
  dark: {
    primary: { v1: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1' },
    greenLike: { v1: 'primitive.green.v1' },
    redLike: { v1: 'primitive.red.v1' }
  }
} as const satisfies GlobalSemanticsByTheme;

export const globalSemanticsBySegment = {
  default: {
    meta: {
      name: 'Default'
    }
  }
} as const satisfies GlobalSemanticsBySegment;

export const componentIntents = {
  card: {
    neutral: 'neutral',
    primary: 'primary'
  },
  slider: {
    neutral: 'neutral',
    primary: 'primary'
  },
  switch: {
    neutral: 'neutral',
    primary: 'primary',
    polarity: 'greenLike'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
