import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import blue from './colors/b.blue.v1.ts';
import green from './colors/g.green.v1.ts';
import neutral from './colors/n.black.v1.ts';
import red from './colors/r.red.v1.ts';
export const primitiveColors = {
  blue: { v1: blue },
  black: { v1: neutral },
  green: { v1: green },
  red: { v1: red }
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
  primitiveColors: primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
