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
            { color: '#ffbf00', position: 0 },
            { color: '#00ffff', position: 100 }
          ]
        }
      },
      medium: {
        rest: {
          kind: 'linear',
          angle: 90,
          stops: [
            { color: '#ffbf00', position: 0 },
            { color: '#00ffff', position: 100 }
          ]
        }
      }
    }
  },
  borderColor: {
    primary: {
      high: {
        rest: '#00000005'
      },
      medium: {
        rest: '#00000005'
      }
    },
    redLike: {
      high: {
        rest: '#00000005',
        hover: '#00000005'
      },
      medium: {
        rest: '#00000005',
        hover: '#00000005'
      }
    }
  },
  textColor: {
    primary: {
      high: {
        rest: '#40bf40',
        hover: {
          ref: '#4040bf80'
        }
      },
      medium: {
        rest: '#40bf40',
        hover: {
          ref: '#4040bf80'
        }
      }
    },
    secondary: {
      high: {
        rest: '#4040bf80'
      },
      medium: {
        rest: '#4040bf80'
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
