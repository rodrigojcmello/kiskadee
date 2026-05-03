import type {
  Schema,
  TextFieldControlElementStyle,
  TextFieldIndicatorElementStyle,
  TextFieldInputElementStyle,
  TextFieldLabelElementStyle,
  TextFieldMessageElementStyle,
  TextFieldRootElementStyle
} from '@kiskadee/core';
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
    controlFloatingNotched: buildBySegment(segmentNames, (s) => ({
      light: {
        boxColor: {
          neutral: {
            medium: {
              rest: c(s, 'l', 'neutral', 0),
              focus: c(s, 'l', 'neutral', 0),
              disabled: c(s, 'l', 'neutral', 90, 8),
              readOnly: c(s, 'l', 'neutral', 0)
            }
          },
          error: {
            medium: {
              rest: c(s, 'l', 'neutral', 0),
              focus: c(s, 'l', 'neutral', 0),
              disabled: c(s, 'l', 'neutral', 90, 8),
              readOnly: c(s, 'l', 'neutral', 0)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'l', 'neutral', 0),
              focus: c(s, 'l', 'neutral', 0),
              disabled: c(s, 'l', 'neutral', 90, 8),
              readOnly: c(s, 'l', 'neutral', 0)
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
              rest: c(s, 'd', 'neutral', 8),
              focus: c(s, 'd', 'neutral', 8),
              disabled: c(s, 'd', 'neutral', 10, 16),
              readOnly: c(s, 'd', 'neutral', 8)
            }
          },
          error: {
            medium: {
              rest: c(s, 'd', 'redLike', 10),
              focus: c(s, 'd', 'redLike', 10),
              disabled: c(s, 'd', 'neutral', 10, 16),
              readOnly: c(s, 'd', 'redLike', 10)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'd', 'yellowLike', 10),
              focus: c(s, 'd', 'yellowLike', 10),
              disabled: c(s, 'd', 'neutral', 10, 16),
              readOnly: c(s, 'd', 'yellowLike', 10)
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
    controlBorderless: buildBySegment(segmentNames, (s) => ({
      light: {
        boxColor: {
          neutral: {
            medium: {
              rest: c(s, 'l', 'neutral', 98),
              hover: c(s, 'l', 'neutral', 96),
              focus: c(s, 'l', 'primary', 95),
              disabled: c(s, 'l', 'neutral', 90, 8),
              readOnly: c(s, 'l', 'neutral', 97)
            }
          },
          error: {
            medium: {
              rest: c(s, 'l', 'redLike', 98),
              hover: c(s, 'l', 'redLike', 96),
              focus: c(s, 'l', 'redLike', 94),
              disabled: c(s, 'l', 'neutral', 90, 8),
              readOnly: c(s, 'l', 'redLike', 97)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'l', 'yellowLike', 97),
              hover: c(s, 'l', 'yellowLike', 95),
              focus: c(s, 'l', 'yellowLike', 92),
              disabled: c(s, 'l', 'neutral', 90, 8),
              readOnly: c(s, 'l', 'yellowLike', 96)
            }
          }
        },
        borderColor: {
          neutral: {
            medium: {
              rest: transparent,
              hover: transparent,
              focus: transparent,
              disabled: transparent,
              readOnly: transparent
            }
          },
          error: {
            medium: {
              rest: transparent,
              hover: transparent,
              focus: transparent,
              disabled: transparent,
              readOnly: transparent
            }
          },
          warning: {
            medium: {
              rest: transparent,
              hover: transparent,
              focus: transparent,
              disabled: transparent,
              readOnly: transparent
            }
          }
        }
      },
      dark: {
        boxColor: {
          neutral: {
            medium: {
              rest: c(s, 'd', 'neutral', 14),
              hover: c(s, 'd', 'neutral', 18),
              focus: c(s, 'd', 'primary', 20),
              disabled: c(s, 'd', 'neutral', 10, 16),
              readOnly: c(s, 'd', 'neutral', 16)
            }
          },
          error: {
            medium: {
              rest: c(s, 'd', 'redLike', 18),
              hover: c(s, 'd', 'redLike', 22),
              focus: c(s, 'd', 'redLike', 28),
              disabled: c(s, 'd', 'neutral', 10, 16),
              readOnly: c(s, 'd', 'redLike', 20)
            }
          },
          warning: {
            medium: {
              rest: c(s, 'd', 'yellowLike', 18),
              hover: c(s, 'd', 'yellowLike', 24),
              focus: c(s, 'd', 'yellowLike', 28),
              disabled: c(s, 'd', 'neutral', 10, 16),
              readOnly: c(s, 'd', 'yellowLike', 20)
            }
          }
        },
        borderColor: {
          neutral: {
            medium: {
              rest: transparent,
              hover: transparent,
              focus: transparent,
              disabled: transparent,
              readOnly: transparent
            }
          },
          error: {
            medium: {
              rest: transparent,
              hover: transparent,
              focus: transparent,
              disabled: transparent,
              readOnly: transparent
            }
          },
          warning: {
            medium: {
              rest: transparent,
              hover: transparent,
              focus: transparent,
              disabled: transparent,
              readOnly: transparent
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
    })),
    indicatorUnderline: buildBySegment(segmentNames, (s) => ({
      light: {
        boxColor: {
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
    }))
  };
}

export function createMaterial3GoogleTextFieldSchema(
  args: CreateMaterial3GoogleTextFieldSchemaArgs
): TextFieldComponent {
  const palettes = createTextFieldElementPalettes(args);
  const rootElement: TextFieldRootElementStyle = {
    scales: {
      boxWidth: {
        's:sm:1': 280,
        's:md:1': 320
      }
    }
  };
  const standardLabel: TextFieldLabelElementStyle<Material3GoogleSegmentName> = {
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
  };
  const standardInput: TextFieldInputElementStyle<Material3GoogleSegmentName> = {
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
  };
  const messageElement: TextFieldMessageElementStyle<Material3GoogleSegmentName> = {
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
  };
  const underlineIndicator: TextFieldIndicatorElementStyle<Material3GoogleSegmentName> = {
    scales: {
      boxHeight: {
        's:sm:1': 1,
        's:md:1': 1
      }
    },
    palettes: palettes.indicatorUnderline
  };
  const standardOutlineControl: TextFieldControlElementStyle<Material3GoogleSegmentName> = {
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
  };
  const standardUnderlineControl: TextFieldControlElementStyle<Material3GoogleSegmentName> = {
    decorations: {
      borderStyle: 'solid'
    },
    scales: {
      boxHeight: {
        's:sm:1': 34,
        's:md:1': 38
      },
      borderWidth: {
        's:sm:1': 0,
        's:md:1': 0
      },
      borderRadius: controlRadius,
      paddingTop: {
        's:sm:1': 8,
        's:md:1': 8
      },
      paddingRight: {
        's:sm:1': 0,
        's:md:1': 0
      },
      paddingBottom: {
        's:sm:1': 8,
        's:md:1': 8
      },
      paddingLeft: {
        's:sm:1': 0,
        's:md:1': 0
      }
    },
    palettes: palettes.control
  };
  const standardBorderlessControl: TextFieldControlElementStyle<Material3GoogleSegmentName> = {
    decorations: {
      borderStyle: 'solid'
    },
    scales: {
      boxHeight: {
        's:sm:1': 36,
        's:md:1': 40
      },
      borderWidth: {
        's:sm:1': 0,
        's:md:1': 0
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
    palettes: palettes.controlBorderless
  };
  const floatingLabelTypography: TextFieldLabelElementStyle<Material3GoogleSegmentName> = {
    decorations: {
      textFont: 'body',
      textWeight: 'normal'
    },
    scales: {
      textSize: {
        's:sm:1': 12,
        's:md:1': 12
      },
      textHeight: {
        's:sm:1': 14,
        's:md:1': 14
      }
    },
    palettes: palettes.label
  };
  const floatingNotchedLabel: TextFieldLabelElementStyle<Material3GoogleSegmentName> = {
    ...floatingLabelTypography,
    scales: {
      ...floatingLabelTypography.scales,
      marginTop: {
        's:sm:1': -7,
        's:md:1': -7
      },
      marginLeft: {
        's:sm:1': 4,
        's:md:1': 4
      },
      paddingRight: {
        's:sm:1': 4,
        's:md:1': 4
      },
      paddingLeft: {
        's:sm:1': 4,
        's:md:1': 4
      }
    }
  };
  const floatingInsideLabel: TextFieldLabelElementStyle<Material3GoogleSegmentName> = {
    ...floatingLabelTypography,
    scales: {
      ...floatingLabelTypography.scales,
      marginTop: {
        's:sm:1': 6,
        's:md:1': 6
      },
      marginLeft: {
        's:sm:1': 12,
        's:md:1': 16
      }
    }
  };
  const floatingControl: TextFieldControlElementStyle<Material3GoogleSegmentName> = {
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
    palettes: palettes.controlFloatingNotched
  };
  const floatingInsideControl: TextFieldControlElementStyle<Material3GoogleSegmentName> = {
    decorations: {
      borderStyle: 'solid'
    },
    scales: {
      boxHeight: {
        's:sm:1': 52,
        's:md:1': 60
      },
      borderWidth: {
        's:sm:1': 1,
        's:md:1': 1
      },
      borderRadius: controlRadius,
      paddingTop: {
        's:sm:1': 10,
        's:md:1': 10
      },
      paddingRight: {
        's:sm:1': 12,
        's:md:1': 16
      },
      paddingBottom: {
        's:sm:1': 6,
        's:md:1': 8
      },
      paddingLeft: {
        's:sm:1': 12,
        's:md:1': 16
      }
    },
    palettes: palettes.control
  };
  const floatingNotchedInput: TextFieldInputElementStyle<Material3GoogleSegmentName> = {
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
  };
  const floatingInsideInput: TextFieldInputElementStyle<Material3GoogleSegmentName> = {
    ...floatingNotchedInput,
    scales: {
      ...floatingNotchedInput.scales,
      paddingTop: {
        's:sm:1': 16,
        's:md:1': 16
      }
    }
  };

  return {
    options: {
      variant: 'standard',
      mode: 'outline'
    },
    variants: {
      standard: {
        options: {
          mode: 'outline'
        },
        modes: {
          outline: {
            options: {
              labelOffset: {
                square: 'schema',
                rounded: 'schema',
                pill: 'radius'
              }
            },
            elements: {
              e1: rootElement,
              e2: standardLabel,
              e3: standardOutlineControl,
              e4: standardInput,
              e5: messageElement
            }
          },
          underline: {
            options: {
              labelOffset: {
                square: 'schema',
                rounded: 'schema',
                pill: 'schema'
              }
            },
            elements: {
              e1: rootElement,
              e2: standardLabel,
              e3: standardUnderlineControl,
              e4: standardInput,
              e5: messageElement,
              e6: underlineIndicator
            }
          },
          borderless: {
            options: {
              labelOffset: {
                square: 'schema',
                rounded: 'schema',
                pill: 'input-start'
              }
            },
            elements: {
              e1: rootElement,
              e2: standardLabel,
              e3: standardBorderlessControl,
              e4: standardInput,
              e5: messageElement
            }
          }
        }
      },
      floating: {
        options: {
          mode: 'notched'
        },
        modes: {
          notched: {
            options: {
              labelOffset: {
                square: 'schema',
                rounded: 'radius',
                pill: 'input-start'
              }
            },
            elements: {
              e1: rootElement,
              e2: floatingNotchedLabel,
              e3: floatingControl,
              e4: floatingNotchedInput,
              e5: messageElement
            }
          },
          inside: {
            options: {
              labelOffset: {
                square: 'schema',
                rounded: 'input-start',
                pill: 'input-start'
              }
            },
            elements: {
              e1: rootElement,
              e2: floatingInsideLabel,
              e3: floatingInsideControl,
              e4: floatingInsideInput,
              e5: messageElement
            }
          }
        }
      }
    }
  };
}
