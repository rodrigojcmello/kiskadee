import type {
  ComponentIntents,
  EmphasisLevel,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';

const primaryScale = {
  subtle: {
    0: [0, 0, 100, 1],
    5: [220, 100, 97, 1],
    10: [221, 94, 92, 1],
    20: [222, 86, 84, 1],
    30: [223, 78, 72, 1]
  },
  vivid: {
    40: [224, 76, 62, 1],
    50: [225, 76, 52, 1],
    60: [226, 78, 44, 1],
    70: [227, 82, 36, 1],
    80: [228, 86, 28, 1],
    90: [230, 92, 18, 1],
    100: [231, 100, 9, 1]
  }
} as const satisfies EmphasisLevel;

const neutralScale = {
  subtle: {
    0: [0, 0, 100, 1],
    5: [220, 20, 97, 1],
    10: [220, 18, 92, 1],
    20: [222, 15, 84, 1],
    30: [224, 13, 72, 1]
  },
  vivid: {
    40: [225, 12, 60, 1],
    50: [226, 12, 50, 1],
    60: [227, 13, 40, 1],
    70: [228, 14, 30, 1],
    80: [229, 16, 20, 1],
    90: [230, 18, 12, 1],
    100: [231, 24, 6, 1]
  }
} as const satisfies EmphasisLevel;

const positiveScale = {
  subtle: {
    0: [0, 0, 100, 1],
    5: [154, 70, 96, 1],
    10: [154, 68, 90, 1],
    20: [154, 64, 80, 1],
    30: [154, 60, 68, 1]
  },
  vivid: {
    40: [154, 60, 54, 1],
    50: [154, 66, 44, 1],
    60: [154, 72, 35, 1],
    70: [154, 78, 27, 1],
    80: [154, 84, 20, 1],
    90: [154, 90, 13, 1],
    100: [154, 96, 6, 1]
  }
} as const satisfies EmphasisLevel;

const negativeScale = {
  subtle: {
    0: [0, 0, 100, 1],
    5: [350, 100, 97, 1],
    10: [350, 94, 91, 1],
    20: [350, 88, 82, 1],
    30: [350, 82, 70, 1]
  },
  vivid: {
    40: [350, 78, 58, 1],
    50: [350, 78, 48, 1],
    60: [350, 82, 40, 1],
    70: [350, 86, 32, 1],
    80: [350, 90, 24, 1],
    90: [350, 94, 16, 1],
    100: [350, 100, 8, 1]
  }
} as const satisfies EmphasisLevel;

export const primitiveColors = {
  blue: {
    v1: {
      solid: { light: primaryScale, dark: primaryScale }
    }
  },
  black: {
    v1: {
      solid: { light: neutralScale, dark: neutralScale }
    }
  },
  green: {
    v1: {
      solid: { light: positiveScale, dark: positiveScale }
    }
  },
  red: {
    v1: {
      solid: { light: negativeScale, dark: negativeScale }
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
