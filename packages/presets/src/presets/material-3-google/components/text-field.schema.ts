import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment';
import type { PresetColorGetter } from '../../../utils/presetColor';

type TextFieldComponent = NonNullable<Schema<never>['components']['textField']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTextFieldSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: readonly [number, number, number, number];
};

const controlRadius = {
  rounded: {
    's:sm:1': 6,
    's:md:1': 8
  },
  pill: {
    's:sm:1': 20,
    's:md:1': 28
  },
  square: {
    's:sm:1': 0,
    's:md:1': 0
  }
};

function createTextFieldElementPalettes({
  c,
  segmentNames,
  transparent
}: CreateMaterial3GoogleTextFieldSchemaArgs) {
  return {
    control: buildBySegment(segmentNames, (s) => ({
      light: {
        boxColor: {
          neutral: {
            medium: {
              rest: transparent,
              hover: c(s, 'l', 'neutral', 1),
              focus: transparent,
              disabled: c(s, 'l', 'neutral', 90, 8)
            }
          },
          error: {
            medium: {
              rest: transparent,
              hover: c(s, 'l', 'redLike', 1),
              focus: transparent,
              disabled: c(s, 'l', 'neutral', 90, 8)
            }
          },
          warning: {
            medium: {
              rest: transparent,
              hover: c(s, 'l', 'yellowLike', 1),
              focus: transparent,
              disabled: c(s, 'l', 'neutral', 90, 8)
            }
          }
        },
        borderColor: {
          neutral: {
            medium: {
              rest: c(s, 'l', 'neutral.v2', 45),
              hover: c(s, 'l', 'neutral.v2', 30),
              focus: c(s, 'l', 'primary', 60),
              disabled: c(s, 'l', 'neutral', 90, 20),
              readOnly: c(s, 'l', 'neutral.v2', 60)
            }
          },
          error: {
            medium: {
              rest: c(s, 'l', 'textField.error', 60),
              hover: c(s, 'l', 'textField.error', 55),
              focus: c(s, 'l', 'textField.error', 60),
              disabled: c(s, 'l', 'neutral', 90, 20),
              readOnly: c(s, 'l', 'textField.error', 65)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'l', 'textField.warning', 60),
              hover: c(s, 'l', 'textField.warning', 55),
              focus: c(s, 'l', 'textField.warning', 60),
              disabled: c(s, 'l', 'neutral', 90, 20),
              readOnly: c(s, 'l', 'textField.warning', 65)
            }
          }
        }
      },
      dark: {
        boxColor: {
          neutral: {
            medium: {
              rest: transparent,
              hover: c(s, 'd', 'neutral', 8),
              focus: transparent,
              disabled: c(s, 'd', 'neutral', 10, 16)
            }
          },
          error: {
            medium: {
              rest: transparent,
              hover: c(s, 'd', 'redLike', 10),
              focus: transparent,
              disabled: c(s, 'd', 'neutral', 10, 16)
            }
          },
          warning: {
            medium: {
              rest: transparent,
              hover: c(s, 'd', 'yellowLike', 10),
              focus: transparent,
              disabled: c(s, 'd', 'neutral', 10, 16)
            }
          }
        },
        borderColor: {
          neutral: {
            medium: {
              rest: c(s, 'd', 'neutral.v2', 55),
              hover: c(s, 'd', 'neutral.v2', 70),
              focus: c(s, 'd', 'primary', 80),
              disabled: c(s, 'd', 'neutral', 30, 38),
              readOnly: c(s, 'd', 'neutral.v2', 45)
            }
          },
          error: {
            medium: {
              rest: c(s, 'd', 'textField.error', 80),
              hover: c(s, 'd', 'textField.error', 85),
              focus: c(s, 'd', 'textField.error', 80),
              disabled: c(s, 'd', 'neutral', 30, 38),
              readOnly: c(s, 'd', 'textField.error', 75)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'd', 'textField.warning', 80),
              hover: c(s, 'd', 'textField.warning', 85),
              focus: c(s, 'd', 'textField.warning', 80),
              disabled: c(s, 'd', 'neutral', 30, 38),
              readOnly: c(s, 'd', 'textField.warning', 75)
            }
          }
        }
      }
    })),
    label: buildBySegment(segmentNames, (s) => ({
      light: {
        textColor: {
          neutral: {
            medium: {
              rest: c(s, 'l', 'neutral.v2', 45),
              hover: c(s, 'l', 'neutral.v2', 35),
              focus: c(s, 'l', 'primary', 60),
              disabled: c(s, 'l', 'neutral', 90, 38),
              readOnly: c(s, 'l', 'neutral.v2', 55)
            }
          },
          error: {
            medium: {
              rest: c(s, 'l', 'textField.error', 60),
              hover: c(s, 'l', 'textField.error', 55),
              focus: c(s, 'l', 'textField.error', 60),
              disabled: c(s, 'l', 'neutral', 90, 38),
              readOnly: c(s, 'l', 'textField.error', 65)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'l', 'textField.warning', 60),
              hover: c(s, 'l', 'textField.warning', 55),
              focus: c(s, 'l', 'textField.warning', 60),
              disabled: c(s, 'l', 'neutral', 90, 38),
              readOnly: c(s, 'l', 'textField.warning', 65)
            }
          }
        }
      },
      dark: {
        textColor: {
          neutral: {
            medium: {
              rest: c(s, 'd', 'neutral.v2', 70),
              hover: c(s, 'd', 'neutral.v2', 80),
              focus: c(s, 'd', 'primary', 80),
              disabled: c(s, 'd', 'neutral', 30, 38),
              readOnly: c(s, 'd', 'neutral.v2', 60)
            }
          },
          error: {
            medium: {
              rest: c(s, 'd', 'textField.error', 80),
              hover: c(s, 'd', 'textField.error', 85),
              focus: c(s, 'd', 'textField.error', 80),
              disabled: c(s, 'd', 'neutral', 30, 38),
              readOnly: c(s, 'd', 'textField.error', 75)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'd', 'textField.warning', 80),
              hover: c(s, 'd', 'textField.warning', 85),
              focus: c(s, 'd', 'textField.warning', 80),
              disabled: c(s, 'd', 'neutral', 30, 38),
              readOnly: c(s, 'd', 'textField.warning', 75)
            }
          }
        }
      }
    })),
    input: buildBySegment(segmentNames, (s) => ({
      light: {
        textColor: {
          neutral: {
            medium: {
              rest: c(s, 'l', 'neutral', 90),
              disabled: c(s, 'l', 'neutral', 90, 38),
              readOnly: c(s, 'l', 'neutral', 85)
            }
          },
          error: {
            medium: {
              rest: c(s, 'l', 'neutral', 90),
              disabled: c(s, 'l', 'neutral', 90, 38),
              readOnly: c(s, 'l', 'neutral', 85)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'l', 'neutral', 90),
              disabled: c(s, 'l', 'neutral', 90, 38),
              readOnly: c(s, 'l', 'neutral', 85)
            }
          }
        }
      },
      dark: {
        textColor: {
          neutral: {
            medium: {
              rest: c(s, 'd', 'neutral', 10),
              disabled: c(s, 'd', 'neutral', 30, 38),
              readOnly: c(s, 'd', 'neutral', 15)
            }
          },
          error: {
            medium: {
              rest: c(s, 'd', 'neutral', 10),
              disabled: c(s, 'd', 'neutral', 30, 38),
              readOnly: c(s, 'd', 'neutral', 15)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'd', 'neutral', 10),
              disabled: c(s, 'd', 'neutral', 30, 38),
              readOnly: c(s, 'd', 'neutral', 15)
            }
          }
        }
      }
    })),
    message: buildBySegment(segmentNames, (s) => ({
      light: {
        textColor: {
          neutral: {
            medium: {
              rest: c(s, 'l', 'neutral.v2', 45),
              disabled: c(s, 'l', 'neutral', 90, 38)
            }
          },
          error: {
            medium: {
              rest: c(s, 'l', 'textField.error', 60),
              disabled: c(s, 'l', 'neutral', 90, 38)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'l', 'textField.warning', 60),
              disabled: c(s, 'l', 'neutral', 90, 38)
            }
          }
        }
      },
      dark: {
        textColor: {
          neutral: {
            medium: {
              rest: c(s, 'd', 'neutral.v2', 70),
              disabled: c(s, 'd', 'neutral', 30, 38)
            }
          },
          error: {
            medium: {
              rest: c(s, 'd', 'textField.error', 80),
              disabled: c(s, 'd', 'neutral', 30, 38)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'd', 'textField.warning', 80),
              disabled: c(s, 'd', 'neutral', 30, 38)
            }
          }
        }
      }
    }))
  };
}

export function createMaterial3GoogleTextFieldSchema(
  args: CreateMaterial3GoogleTextFieldSchemaArgs
): TextFieldComponent {
  const palettes = createTextFieldElementPalettes(args);

  return {
    options: {
      variant: 'standard'
    },
    variants: {
      standard: {
        elements: {
          e1: {
            scales: {
              boxWidth: {
                's:sm:1': 280,
                's:md:1': 320
              }
            }
          },
          e2: {
            decorations: {
              textFont: 'body',
              textWeight: 'medium'
            },
            scales: {
              textSize: {
                's:sm:1': 12,
                's:md:1': 14
              },
              textHeight: {
                's:sm:1': 16,
                's:md:1': 20
              },
              marginBottom: {
                's:sm:1': 4,
                's:md:1': 6
              }
            },
            palettes: palettes.label
          },
          e3: {
            decorations: {
              borderStyle: 'solid'
            },
            scales: {
              boxHeight: {
                's:sm:1': 36,
                's:md:1': 40
              },
              borderWidth: {
                's:sm:1': 1,
                's:md:1': 1
              },
              borderRadius: controlRadius,
              paddingTop: {
                's:sm:1': 8,
                's:md:1': 8
              },
              paddingRight: {
                's:sm:1': 10,
                's:md:1': 12
              },
              paddingBottom: {
                's:sm:1': 8,
                's:md:1': 8
              },
              paddingLeft: {
                's:sm:1': 10,
                's:md:1': 12
              }
            },
            palettes: palettes.control
          },
          e4: {
            decorations: {
              textFont: 'body',
              textWeight: 'normal'
            },
            scales: {
              textSize: {
                's:sm:1': 14,
                's:md:1': 16
              },
              textHeight: {
                's:sm:1': 20,
                's:md:1': 24
              }
            },
            palettes: palettes.input
          },
          e5: {
            decorations: {
              textFont: 'body',
              textWeight: 'normal'
            },
            scales: {
              textSize: {
                's:sm:1': 11,
                's:md:1': 12
              },
              textHeight: {
                's:sm:1': 16,
                's:md:1': 16
              },
              marginTop: {
                's:sm:1': 4,
                's:md:1': 6
              }
            },
            palettes: palettes.message
          }
        }
      },
      floating: {
        elements: {
          e1: {
            scales: {
              boxWidth: {
                's:sm:1': 280,
                's:md:1': 320
              }
            }
          },
          e2: {
            decorations: {
              textFont: 'body',
              textWeight: 'normal'
            },
            scales: {
              textSize: {
                's:sm:1': 14,
                's:md:1': 16
              },
              textHeight: {
                's:sm:1': 20,
                's:md:1': 24
              }
            },
            palettes: palettes.label
          },
          e3: {
            decorations: {
              borderStyle: 'solid'
            },
            scales: {
              boxHeight: {
                's:sm:1': 48,
                's:md:1': 56
              },
              borderWidth: {
                's:sm:1': 1,
                's:md:1': 1
              },
              borderRadius: controlRadius,
              paddingTop: {
                's:sm:1': 8,
                's:md:1': 8
              },
              paddingRight: {
                's:sm:1': 12,
                's:md:1': 16
              },
              paddingBottom: {
                's:sm:1': 8,
                's:md:1': 8
              },
              paddingLeft: {
                's:sm:1': 12,
                's:md:1': 16
              }
            },
            palettes: palettes.control
          },
          e4: {
            decorations: {
              textFont: 'body',
              textWeight: 'normal'
            },
            scales: {
              textSize: {
                's:sm:1': 14,
                's:md:1': 16
              },
              textHeight: {
                's:sm:1': 20,
                's:md:1': 24
              }
            },
            palettes: palettes.input
          },
          e5: {
            decorations: {
              textFont: 'body',
              textWeight: 'normal'
            },
            scales: {
              textSize: {
                's:sm:1': 11,
                's:md:1': 12
              },
              textHeight: {
                's:sm:1': 16,
                's:md:1': 16
              },
              marginTop: {
                's:sm:1': 4,
                's:md:1': 6
              }
            },
            palettes: palettes.message
          }
        }
      }
    }
  };
}
