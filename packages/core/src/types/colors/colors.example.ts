import type { ColorSchema, GlobalSemanticsBySegment } from './colors.types.ts';

// Example of ColorSchema (element-level colors for a component)
const color: ColorSchema = {
  boxColor: {
    primary: {
      high: {
        rest: {
          kind: 'linear',
          angle: 90,
          stops: [
            { color: [45, 100, 50, 1], position: 0 },
            { color: [180, 100, 50, 1], position: 100 }
          ]
        }
      },
      medium: {
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
      high: {
        rest: [45, 0, 0, 0.02]
      },
      medium: {
        rest: [45, 0, 0, 0.02]
      }
    },
    redLike: {
      high: {
        rest: [0, 0, 0, 0.02],
        hover: [0, 0, 0, 0.02]
      },
      medium: {
        rest: [0, 0, 0, 0.02],
        hover: [0, 0, 0, 0.02]
      }
    }
  },
  textColor: {
    primary: {
      high: {
        rest: [120, 50, 50, 1],
        hover: {
          ref: [240, 50, 50, 0.5]
        }
      },
      medium: {
        rest: [120, 50, 50, 1],
        hover: {
          ref: [240, 50, 50, 0.5]
        }
      }
    },
    secondary: {
      high: {
        rest: [240, 50, 50, 0.5]
      },
      medium: {
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
