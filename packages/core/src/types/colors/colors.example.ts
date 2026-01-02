import type { ColorSchema, GlobalSemanticsBySegment } from './colors.types';

// Example of ColorSchema (element-level colors for a component)
const color: ColorSchema = {
  boxColor: {
    primary: {
      subtle: {
        rest: {
          kind: 'linear',
          angle: 90,
          stops: [
            { color: [45, 100, 50, 1], position: 0 },
            { color: [180, 100, 50, 1], position: 100 }
          ]
        }
      },
      vivid: {
        rest: {
          kind: 'linear',
          angle: 90,
          stops: [
            { color: [45, 100, 50, 1], position: 0 },
            { color: [180, 100, 50, 1], position: 100 }
          ]
        }
      }
    }
  },
  borderColor: {
    primary: {
      subtle: {
        rest: [45, 0, 0, 0.02]
      },
      vivid: {
        rest: [45, 0, 0, 0.02]
      }
    },
    redLike: {
      subtle: {
        rest: [0, 0, 0, 0.02],
        hover: [0, 0, 0, 0.02]
      },
      vivid: {
        rest: [0, 0, 0, 0.02],
        hover: [0, 0, 0, 0.02]
      }
    }
  },
  textColor: {
    primary: {
      subtle: {
        rest: [120, 50, 50, 1],
        hover: {
          ref: [240, 50, 50, 0.5]
        }
      },
      vivid: {
        rest: [120, 50, 50, 1],
        hover: {
          ref: [240, 50, 50, 0.5]
        }
      }
    },
    secondary: {
      subtle: {
        rest: [240, 50, 50, 0.5]
      },
      vivid: {
        rest: [240, 50, 50, 0.5]
      }
    }
  }
};

// Example of the segment registry + optional per-segment semantic overrides.
//
// In the modern model, segments are discovered via `schema.colors.globalSemanticsBySegment`.
// Segment-specific semantic overrides live under `themes`, while `meta` holds display information.
export const exampleGlobalSemanticsBySegment: GlobalSemanticsBySegment = {
  default: {
    meta: { name: 'Default' }
  },
  dynamic: {
    meta: { name: 'Dynamic' },
    themes: {
      light: {
        primary: 'primitive.blue.dynamic'
      },
      dark: {
        primary: 'primitive.blue.dynamic'
      }
    }
  }
};

console.log({ color });
