import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import { classifyPrimitives } from '../../classify-primitives.ts';
import blue from './colors/default/b.blue.v1.ts';
import green from './colors/default/g.green.v1.ts';
import black from './colors/default/n.black.v1.ts';
import purple from './colors/default/pb.indigo.v1.ts';
import red from './colors/default/r.red.v1.ts';
import yellow from './colors/default/y.yellow.v1.ts';
import orange from './colors/default/yr.orange.v1.ts';

export const primitiveColors = {
  blue: { v1: blue },
  black: { v1: black },
  red: { v1: red },
  green: { v1: green },
  yellow: { v1: yellow },
  orange: { v1: orange },
  purple: { v1: purple }
} as const satisfies PrimitiveColors;

const roles = {
  primary: { v1: 'primitive.blue.v1' },
  neutral: { v1: 'primitive.black.v1' },
  redLike: { v1: 'primitive.red.v1' },
  greenLike: { v1: 'primitive.green.v1' },
  yellowLike: { v1: 'primitive.yellow.v1', v2: 'primitive.orange.v1' },
  purpleLike: { v1: 'primitive.purple.v1' }
} as const;
export const globalSemantics = {
  light: roles,
  dark: roles
} as const satisfies GlobalSemanticsByTheme;
export const globalSemanticsBySegment = {
  default: { meta: { name: 'Blue - IBM' } }
} as const satisfies GlobalSemanticsBySegment;
export const componentIntents = {
  badge: {
    neutral: 'neutral',
    primary: 'primary',
    novelty: 'purpleLike',
    positive: 'greenLike',
    warning: 'yellowLike',
    attention: 'redLike'
  },
  bottomSheet: {
    neutral: 'neutral',
    destructive: 'redLike'
  },
  button: {
    primary: 'primary',
    neutral: 'neutral',
    destructive: 'redLike',
    positive: 'greenLike'
  },
  card: {
    neutral: 'neutral',
    primary: 'primary'
  },
  chip: {
    neutral: 'neutral',
    primary: 'primary'
  },
  dropdown: {
    neutral: 'neutral',
    destructive: 'redLike'
  },
  icon: {
    neutral: 'neutral',
    primary: 'primary'
  },
  progress: {
    neutral: 'neutral',
    primary: 'primary',
    positive: 'greenLike',
    warning: 'yellowLike',
    destructive: 'redLike'
  },
  slider: {
    neutral: 'neutral',
    primary: 'primary'
  },
  switch: {
    neutral: 'neutral',
    primary: 'primary',
    polarity: 'greenLike'
  },
  text: {
    neutral: 'neutral'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors: classifyPrimitives(primitiveColors),
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
