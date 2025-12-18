import type { ColorSchema, SchemaSegments } from './colors.types';

// Example of ColorSchema (element-level colors for a component)
const color: ColorSchema = {
  boxColor: {
    primary: {
      subtle: {
        rest: [
          90,
          [
            [45, 100, 50, 1, 0],
            [180, 100, 50, 1, 100]
          ]
        ]
      },
      vivid: {
        rest: [
          90,
          [
            [45, 100, 50, 1, 0],
            [180, 100, 50, 1, 100]
          ]
        ]
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

// Example of SchemaSegments (theme-level segments with tonal scales per semantic category)
export const exampleSchemaSegments: SchemaSegments = {
  // Each segment represents a brand/product identity
  default: {
    name: 'Example Brand',
    mainColor: 'blue',
    themes: {
      light: {
        // Demonstrates EmphasisLevel (subtle/vivid) for a semantic color
        primary: {
          subtle: {
            0: [206, 100, 100, 1],
            1: [206, 100, 99, 1],
            10: [206, 100, 90, 1],
            20: [206, 100, 80, 1],
            30: [206, 100, 70, 1]
          },
          vivid: {
            40: [206, 100, 60, 1],
            50: [206, 100, 50, 1],
            60: [206, 100, 40, 1],
            80: [206, 100, 20, 1],
            100: [206, 100, 0, 1]
          }
        },
        secondary: {
          subtle: {
            0: [180, 0, 100, 1],
            10: [180, 20, 90, 1]
          },
          vivid: {
            50: [180, 60, 50, 1],
            100: [180, 60, 0, 1]
          }
        },
        greenLike: {
          subtle: {
            0: [140, 0, 100, 1],
            10: [140, 30, 90, 1]
          },
          vivid: {
            50: [140, 70, 50, 1],
            100: [140, 70, 0, 1]
          }
        },
        yellowLike: {
          subtle: {
            0: [45, 0, 100, 1],
            10: [45, 40, 90, 1]
          },
          vivid: {
            50: [45, 95, 50, 1],
            100: [45, 95, 0, 1]
          }
        },
        redLike: {
          subtle: {
            0: [0, 0, 100, 1],
            10: [0, 40, 90, 1]
          },
          vivid: {
            50: [0, 85, 50, 1],
            100: [0, 85, 0, 1]
          }
        },
        neutral: {
          subtle: {
            0: [0, 0, 100, 1],
            1: [0, 0, 99, 1],
            10: [0, 0, 90, 1]
          },
          vivid: {
            50: [0, 0, 50, 1],
            100: [0, 0, 0, 1]
          }
        }
      }
    }
  }
};

console.log({ color });
