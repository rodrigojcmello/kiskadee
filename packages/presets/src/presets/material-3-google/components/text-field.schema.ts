import type { Color, Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type TextFieldComponent = NonNullable<Schema<never>['components']['textField']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTextFieldSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: string;
};

type PaletteTheme = Record<string, Record<string, Record<string, unknown>>>;
type PaletteBundle = Record<string, Record<string, PaletteTheme>>;
type PaletteGroupBundle = Record<string, PaletteBundle>;
type Material3GoogleTextFieldIntent = 'neutral' | 'error' | 'warning';
type TextFieldPaletteGroup =
  | 'control'
  | 'controlFloatingNotched'
  | 'controlBorderless'
  | 'placeholder'
  | 'label'
  | 'input'
  | 'message'
  | 'indicatorUnderline';

function fieldStateRef(color: Color): { ref: Color } {
  return { ref: color };
}

// Vivid parents use an authored inverse recipe, never a transform of resolved HEX values.
function createVividSurfacePalette(
  group: TextFieldPaletteGroup,
  c: PresetColorGetter<Material3GoogleSegmentName>,
  segment: Material3GoogleSegmentName,
  transparent: string
): PaletteTheme[string] {
  const white = (alpha?: number) => c(segment, 'l', 'primitive.black.v1', 0, alpha);
  const intentMap = (factory: (intent: Material3GoogleTextFieldIntent) => unknown) => ({
    neutral: { medium: factory('neutral') },
    error: { medium: factory('error') },
    warning: { medium: factory('warning') }
  });
  const semantic = (intent: 'error' | 'warning', offset = 0) =>
    c.ref(
      segment,
      'l',
      intent === 'error' ? 'textField.error' : 'textField.warning',
      'vivid',
      offset
    );
  const edge = (intent: Material3GoogleTextFieldIntent) => {
    if (intent === 'neutral')
      return {
        rest: white(60),
        hover: fieldStateRef(white(70)),
        focus: fieldStateRef(white()),
        disabled: fieldStateRef(white(38))
      };
    const rest = semantic(intent);
    return {
      rest,
      hover: fieldStateRef(semantic(intent, -1)),
      // Focus restores the semantic Rest stroke over Hover; field geometry owns focus emphasis.
      focus: fieldStateRef(rest),
      disabled: fieldStateRef(white(38)),
      readOnly: fieldStateRef(semantic(intent, 1))
    };
  };
  if (group === 'indicatorUnderline') return { boxColor: intentMap(edge) };
  if (group === 'control' || group === 'controlFloatingNotched' || group === 'controlBorderless') {
    return {
      boxColor: intentMap((intent) => {
        if (group === 'control')
          return {
            rest: transparent,
            hover: fieldStateRef(white(8)),
            // Focus removes the Hover layer on the outline shell.
            focus: fieldStateRef(transparent),
            disabled: fieldStateRef(white(38))
          };
        const rest = intent === 'neutral' ? white(10) : semantic(intent);
        if (group === 'controlFloatingNotched')
          return {
            rest,
            disabled: fieldStateRef(white(38))
          };
        return {
          rest,
          hover: fieldStateRef(intent === 'neutral' ? white(8) : semantic(intent, -1)),
          focus: fieldStateRef(intent === 'neutral' ? white(16) : semantic(intent, -2)),
          disabled: fieldStateRef(white(38)),
          ...(intent === 'neutral' ? {} : { readOnly: fieldStateRef(semantic(intent, 1)) })
        };
      }),
      borderColor: intentMap((intent) =>
        group === 'controlBorderless' ? { rest: transparent } : edge(intent)
      )
    };
  }
  return {
    textColor: intentMap(() => ({
      rest: white(),
      ...(group === 'placeholder' ? {} : { disabled: fieldStateRef(white(38)) }),
      ...(group === 'input' || group === 'label' ? { readOnly: fieldStateRef(white(70)) } : {})
    }))
  };
}

function withVividSurfaceContexts<TPaletteGroupBundle extends PaletteGroupBundle>(
  paletteGroups: TPaletteGroupBundle,
  c: PresetColorGetter<Material3GoogleSegmentName>,
  transparent: string
): TPaletteGroupBundle {
  const merged: PaletteGroupBundle = {};
  for (const groupName of Object.keys(paletteGroups)) {
    merged[groupName] = {};
    for (const [segmentName, themes] of Object.entries(paletteGroups[groupName])) {
      merged[groupName][segmentName] = {};
      for (const [themeName, palette] of Object.entries(themes)) {
        merged[groupName][segmentName][themeName] = {
          ...palette,
          onVivid: createVividSurfacePalette(
            groupName as TextFieldPaletteGroup,
            c,
            segmentName as Material3GoogleSegmentName,
            transparent
          )
        };
      }
    }
  }
  return merged as TPaletteGroupBundle;
}

function createLightLowEmphasisTheme(lightTheme: PaletteTheme, darkTheme: PaletteTheme) {
  const light: PaletteTheme = {};

  for (const styleName of new Set([...Object.keys(lightTheme), ...Object.keys(darkTheme)])) {
    const lightStyle = lightTheme[styleName] ?? {};
    const darkStyle = darkTheme[styleName] ?? {};
    light[styleName] = {};

    for (const intentName of new Set([...Object.keys(lightStyle), ...Object.keys(darkStyle)])) {
      const darkMedium = darkStyle[intentName]?.medium;
      light[styleName][intentName] = {
        ...(lightStyle[intentName] ?? {}),
        ...(darkMedium === undefined ? {} : { low: darkMedium })
      };
    }
  }

  return light;
}

function withLightLowEmphasisBundle<TPaletteBundle extends PaletteBundle>(
  palettes: TPaletteBundle
): TPaletteBundle {
  const merged: PaletteBundle = {};

  for (const segmentName of Object.keys(palettes)) {
    const themes = palettes[segmentName];
    merged[segmentName] = { ...themes };

    if (themes.light && themes.dark) {
      merged[segmentName].light = createLightLowEmphasisTheme(themes.light, themes.dark);
    }
  }

  return merged as TPaletteBundle;
}

function withLightLowEmphasisFromDarkMedium<TPaletteGroupBundle extends PaletteGroupBundle>(
  paletteGroups: TPaletteGroupBundle
): TPaletteGroupBundle {
  const merged: PaletteGroupBundle = {};

  for (const groupName of Object.keys(paletteGroups)) {
    merged[groupName] = withLightLowEmphasisBundle(paletteGroups[groupName]);
  }

  return merged as TPaletteGroupBundle;
}

function withPlaceholderPalette<TControl extends PaletteBundle>(
  control: TControl,
  placeholder: PaletteBundle
): TControl {
  const merged: PaletteBundle = {};
  const segmentNames = new Set([...Object.keys(control), ...Object.keys(placeholder)]);

  for (const segmentName of segmentNames) {
    const controlThemes = control[segmentName] ?? {};
    const placeholderThemes = placeholder[segmentName] ?? {};
    const themeNames = new Set([...Object.keys(controlThemes), ...Object.keys(placeholderThemes)]);
    merged[segmentName] = {};

    for (const themeName of themeNames) {
      const controlTheme = controlThemes[themeName] ?? {};
      const placeholderTheme = placeholderThemes[themeName] ?? {};
      merged[segmentName][themeName] = {
        ...controlTheme,
        ...placeholderTheme,
        ...(controlTheme.onSubtle === undefined && placeholderTheme.onSubtle === undefined
          ? {}
          : {
              onSubtle: {
                ...(controlTheme.onSubtle ?? {}),
                ...(placeholderTheme.onSubtle ?? {})
              }
            }),
        ...(controlTheme.onVivid === undefined && placeholderTheme.onVivid === undefined
          ? {}
          : {
              onVivid: {
                ...(controlTheme.onVivid ?? {}),
                ...(placeholderTheme.onVivid ?? {})
              }
            })
      };
    }
  }

  return merged as TControl;
}

function createTextFieldElementPalettes({
  c,
  segmentNames,
  transparent
}: CreateMaterial3GoogleTextFieldSchemaArgs) {
  return {
    control: buildBySegment(segmentNames, (s) => ({
      light: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: transparent,
                hover: fieldStateRef(c(s, 'l', 'neutral', 1)),
                focus: fieldStateRef(transparent),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 8))
              }
            },
            error: {
              medium: {
                rest: transparent,
                hover: fieldStateRef(c(s, 'l', 'redLike', 1)),
                focus: fieldStateRef(transparent),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 8))
              }
            },
            warning: {
              medium: {
                rest: transparent,
                hover: fieldStateRef(c(s, 'l', 'yellowLike', 1)),
                focus: fieldStateRef(transparent),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 8))
              }
            }
          },
          borderColor: {
            neutral: {
              medium: {
                rest: c(s, 'l', 'neutral.v2', 45),
                hover: fieldStateRef(c(s, 'l', 'neutral.v2', 30)),
                focus: fieldStateRef(c(s, 'l', 'primary', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 20)),
                readOnly: fieldStateRef(c(s, 'l', 'neutral.v2', 60))
              }
            },
            error: {
              medium: {
                rest: c(s, 'l', 'textField.error', 60),
                hover: fieldStateRef(c(s, 'l', 'textField.error', 55)),
                focus: fieldStateRef(c(s, 'l', 'textField.error', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 20)),
                readOnly: fieldStateRef(c(s, 'l', 'textField.error', 65))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'l', 'textField.warning', 60),
                hover: fieldStateRef(c(s, 'l', 'textField.warning', 55)),
                focus: fieldStateRef(c(s, 'l', 'textField.warning', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 20)),
                readOnly: fieldStateRef(c(s, 'l', 'textField.warning', 65))
              }
            }
          }
        }
      },
      dark: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: transparent,
                hover: fieldStateRef(c(s, 'd', 'neutral', 8)),
                focus: fieldStateRef(transparent),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 10, 16))
              }
            },
            error: {
              medium: {
                rest: transparent,
                hover: fieldStateRef(c(s, 'd', 'redLike', 10)),
                focus: fieldStateRef(transparent),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 10, 16))
              }
            },
            warning: {
              medium: {
                rest: transparent,
                hover: fieldStateRef(c(s, 'd', 'yellowLike', 10)),
                focus: fieldStateRef(transparent),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 10, 16))
              }
            }
          },
          borderColor: {
            neutral: {
              medium: {
                rest: c(s, 'd', 'neutral.v2', 55),
                hover: fieldStateRef(c(s, 'd', 'neutral.v2', 70)),
                focus: fieldStateRef(c(s, 'd', 'primary', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'neutral.v2', 45))
              }
            },
            error: {
              medium: {
                rest: c(s, 'd', 'textField.error', 80),
                hover: fieldStateRef(c(s, 'd', 'textField.error', 85)),
                focus: fieldStateRef(c(s, 'd', 'textField.error', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'textField.error', 75))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'd', 'textField.warning', 80),
                hover: fieldStateRef(c(s, 'd', 'textField.warning', 85)),
                focus: fieldStateRef(c(s, 'd', 'textField.warning', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'textField.warning', 75))
              }
            }
          }
        }
      }
    })),
    controlFloatingNotched: buildBySegment(segmentNames, (s) => ({
      light: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: c(s, 'l', 'neutral', 0),
                focus: fieldStateRef(c(s, 'l', 'neutral', 0)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 8)),
                readOnly: fieldStateRef(c(s, 'l', 'neutral', 0))
              }
            },
            error: {
              medium: {
                rest: c(s, 'l', 'neutral', 0),
                focus: fieldStateRef(c(s, 'l', 'neutral', 0)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 8)),
                readOnly: fieldStateRef(c(s, 'l', 'neutral', 0))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'l', 'neutral', 0),
                focus: fieldStateRef(c(s, 'l', 'neutral', 0)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 8)),
                readOnly: fieldStateRef(c(s, 'l', 'neutral', 0))
              }
            }
          },
          borderColor: {
            neutral: {
              medium: {
                rest: c(s, 'l', 'neutral.v2', 45),
                hover: fieldStateRef(c(s, 'l', 'neutral.v2', 30)),
                focus: fieldStateRef(c(s, 'l', 'primary', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 20)),
                readOnly: fieldStateRef(c(s, 'l', 'neutral.v2', 60))
              }
            },
            error: {
              medium: {
                rest: c(s, 'l', 'textField.error', 60),
                hover: fieldStateRef(c(s, 'l', 'textField.error', 55)),
                focus: fieldStateRef(c(s, 'l', 'textField.error', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 20)),
                readOnly: fieldStateRef(c(s, 'l', 'textField.error', 65))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'l', 'textField.warning', 60),
                hover: fieldStateRef(c(s, 'l', 'textField.warning', 55)),
                focus: fieldStateRef(c(s, 'l', 'textField.warning', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 20)),
                readOnly: fieldStateRef(c(s, 'l', 'textField.warning', 65))
              }
            }
          }
        }
      },
      dark: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: c(s, 'd', 'neutral', 8),
                focus: fieldStateRef(c(s, 'd', 'neutral', 8)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 10, 16)),
                readOnly: fieldStateRef(c(s, 'd', 'neutral', 8))
              }
            },
            error: {
              medium: {
                rest: c(s, 'd', 'redLike', 10),
                focus: fieldStateRef(c(s, 'd', 'redLike', 10)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 10, 16)),
                readOnly: fieldStateRef(c(s, 'd', 'redLike', 10))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'd', 'yellowLike', 10),
                focus: fieldStateRef(c(s, 'd', 'yellowLike', 10)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 10, 16)),
                readOnly: fieldStateRef(c(s, 'd', 'yellowLike', 10))
              }
            }
          },
          borderColor: {
            neutral: {
              medium: {
                rest: c(s, 'd', 'neutral.v2', 55),
                hover: fieldStateRef(c(s, 'd', 'neutral.v2', 70)),
                focus: fieldStateRef(c(s, 'd', 'primary', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'neutral.v2', 45))
              }
            },
            error: {
              medium: {
                rest: c(s, 'd', 'textField.error', 80),
                hover: fieldStateRef(c(s, 'd', 'textField.error', 85)),
                focus: fieldStateRef(c(s, 'd', 'textField.error', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'textField.error', 75))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'd', 'textField.warning', 80),
                hover: fieldStateRef(c(s, 'd', 'textField.warning', 85)),
                focus: fieldStateRef(c(s, 'd', 'textField.warning', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'textField.warning', 75))
              }
            }
          }
        }
      }
    })),
    controlBorderless: buildBySegment(segmentNames, (s) => {
      const borderlessLightRestBoxColor = c(s, 'l', 'primitive.black.v1', 4);
      const borderlessLightHoverBoxColor = c(s, 'l', 'primitive.black.v1', 6);
      const borderlessLightFocusBoxColor = c(s, 'l', 'primitive.black.v1', 8);

      return {
        light: {
          onSubtle: {
            boxColor: {
              neutral: {
                medium: {
                  rest: borderlessLightRestBoxColor,
                  hover: fieldStateRef(borderlessLightHoverBoxColor),
                  focus: fieldStateRef(borderlessLightFocusBoxColor),
                  disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 8)),
                  readOnly: fieldStateRef(borderlessLightRestBoxColor)
                }
              },
              error: {
                medium: {
                  rest: borderlessLightRestBoxColor,
                  hover: fieldStateRef(borderlessLightHoverBoxColor),
                  focus: fieldStateRef(borderlessLightFocusBoxColor),
                  disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 8)),
                  readOnly: fieldStateRef(borderlessLightRestBoxColor)
                }
              },
              warning: {
                medium: {
                  rest: borderlessLightRestBoxColor,
                  hover: fieldStateRef(borderlessLightHoverBoxColor),
                  focus: fieldStateRef(borderlessLightFocusBoxColor),
                  disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 8)),
                  readOnly: fieldStateRef(borderlessLightRestBoxColor)
                }
              }
            },
            borderColor: {
              neutral: {
                medium: {
                  rest: transparent,
                  hover: fieldStateRef(transparent),
                  focus: fieldStateRef(transparent),
                  disabled: fieldStateRef(transparent),
                  readOnly: fieldStateRef(transparent)
                }
              },
              error: {
                medium: {
                  rest: transparent,
                  hover: fieldStateRef(transparent),
                  focus: fieldStateRef(transparent),
                  disabled: fieldStateRef(transparent),
                  readOnly: fieldStateRef(transparent)
                }
              },
              warning: {
                medium: {
                  rest: transparent,
                  hover: fieldStateRef(transparent),
                  focus: fieldStateRef(transparent),
                  disabled: fieldStateRef(transparent),
                  readOnly: fieldStateRef(transparent)
                }
              }
            }
          }
        },
        dark: {
          onSubtle: {
            boxColor: {
              neutral: {
                medium: {
                  rest: c(s, 'd', 'neutral', 14),
                  hover: fieldStateRef(c(s, 'd', 'neutral', 18)),
                  focus: fieldStateRef(c(s, 'd', 'primary', 20)),
                  disabled: fieldStateRef(c(s, 'd', 'neutral', 10, 16)),
                  readOnly: fieldStateRef(c(s, 'd', 'neutral', 16))
                }
              },
              error: {
                medium: {
                  rest: c(s, 'd', 'redLike', 18),
                  hover: fieldStateRef(c(s, 'd', 'redLike', 22)),
                  focus: fieldStateRef(c(s, 'd', 'redLike', 28)),
                  disabled: fieldStateRef(c(s, 'd', 'neutral', 10, 16)),
                  readOnly: fieldStateRef(c(s, 'd', 'redLike', 20))
                }
              },
              warning: {
                medium: {
                  rest: c(s, 'd', 'yellowLike', 18),
                  hover: fieldStateRef(c(s, 'd', 'yellowLike', 24)),
                  focus: fieldStateRef(c(s, 'd', 'yellowLike', 28)),
                  disabled: fieldStateRef(c(s, 'd', 'neutral', 10, 16)),
                  readOnly: fieldStateRef(c(s, 'd', 'yellowLike', 20))
                }
              }
            },
            borderColor: {
              neutral: {
                medium: {
                  rest: transparent,
                  hover: fieldStateRef(transparent),
                  focus: fieldStateRef(transparent),
                  disabled: fieldStateRef(transparent),
                  readOnly: fieldStateRef(transparent)
                }
              },
              error: {
                medium: {
                  rest: transparent,
                  hover: fieldStateRef(transparent),
                  focus: fieldStateRef(transparent),
                  disabled: fieldStateRef(transparent),
                  readOnly: fieldStateRef(transparent)
                }
              },
              warning: {
                medium: {
                  rest: transparent,
                  hover: fieldStateRef(transparent),
                  focus: fieldStateRef(transparent),
                  disabled: fieldStateRef(transparent),
                  readOnly: fieldStateRef(transparent)
                }
              }
            }
          }
        }
      };
    }),
    placeholder: buildBySegment(segmentNames, (s) => ({
      light: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: c(s, 'l', 'neutral.v2', 45)
              }
            },
            error: {
              medium: {
                rest: c(s, 'l', 'textField.error', 60)
              }
            },
            warning: {
              medium: {
                rest: c(s, 'l', 'textField.warning', 60)
              }
            }
          }
        }
      },
      dark: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: c(s, 'd', 'neutral.v2', 70)
              }
            },
            error: {
              medium: {
                rest: c(s, 'd', 'textField.error', 80)
              }
            },
            warning: {
              medium: {
                rest: c(s, 'd', 'textField.warning', 80)
              }
            }
          }
        }
      }
    })),
    label: buildBySegment(segmentNames, (s) => ({
      light: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: c(s, 'l', 'neutral.v2', 45),
                hover: fieldStateRef(c(s, 'l', 'neutral.v2', 35)),
                focus: fieldStateRef(c(s, 'l', 'primary', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 38)),
                readOnly: fieldStateRef(c(s, 'l', 'neutral.v2', 55))
              }
            },
            error: {
              medium: {
                rest: c(s, 'l', 'textField.error', 60),
                hover: fieldStateRef(c(s, 'l', 'textField.error', 55)),
                focus: fieldStateRef(c(s, 'l', 'textField.error', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 38)),
                readOnly: fieldStateRef(c(s, 'l', 'textField.error', 65))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'l', 'textField.warning', 60),
                hover: fieldStateRef(c(s, 'l', 'textField.warning', 55)),
                focus: fieldStateRef(c(s, 'l', 'textField.warning', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 38)),
                readOnly: fieldStateRef(c(s, 'l', 'textField.warning', 65))
              }
            }
          }
        }
      },
      dark: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: c(s, 'd', 'neutral.v2', 70),
                hover: fieldStateRef(c(s, 'd', 'neutral.v2', 80)),
                focus: fieldStateRef(c(s, 'd', 'primary', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'neutral.v2', 60))
              }
            },
            error: {
              medium: {
                rest: c(s, 'd', 'textField.error', 80),
                hover: fieldStateRef(c(s, 'd', 'textField.error', 85)),
                focus: fieldStateRef(c(s, 'd', 'textField.error', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'textField.error', 75))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'd', 'textField.warning', 80),
                hover: fieldStateRef(c(s, 'd', 'textField.warning', 85)),
                focus: fieldStateRef(c(s, 'd', 'textField.warning', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'textField.warning', 75))
              }
            }
          }
        }
      }
    })),
    input: buildBySegment(segmentNames, (s) => ({
      light: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: c(s, 'l', 'neutral', 90),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 38)),
                readOnly: fieldStateRef(c(s, 'l', 'neutral', 85))
              }
            },
            error: {
              medium: {
                rest: c(s, 'l', 'neutral', 90),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 38)),
                readOnly: fieldStateRef(c(s, 'l', 'neutral', 85))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'l', 'neutral', 90),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 38)),
                readOnly: fieldStateRef(c(s, 'l', 'neutral', 85))
              }
            }
          }
        }
      },
      dark: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: c(s, 'd', 'neutral', 90),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 90, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'neutral', 85))
              }
            },
            error: {
              medium: {
                rest: c(s, 'd', 'neutral', 90),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 90, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'neutral', 85))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'd', 'neutral', 90),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 90, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'neutral', 85))
              }
            }
          }
        }
      }
    })),
    message: buildBySegment(segmentNames, (s) => ({
      light: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: c(s, 'l', 'neutral.v2', 45),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 38))
              }
            },
            error: {
              medium: {
                rest: c(s, 'l', 'textField.error', 60),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 38))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'l', 'textField.warning', 60),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 38))
              }
            }
          }
        }
      },
      dark: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: c(s, 'd', 'neutral.v2', 70),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38))
              }
            },
            error: {
              medium: {
                rest: c(s, 'd', 'textField.error', 80),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'd', 'textField.warning', 80),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38))
              }
            }
          }
        }
      }
    })),
    indicatorUnderline: buildBySegment(segmentNames, (s) => ({
      light: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: c(s, 'l', 'neutral.v2', 45),
                hover: fieldStateRef(c(s, 'l', 'neutral.v2', 30)),
                focus: fieldStateRef(c(s, 'l', 'primary', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 20)),
                readOnly: fieldStateRef(c(s, 'l', 'neutral.v2', 60))
              }
            },
            error: {
              medium: {
                rest: c(s, 'l', 'textField.error', 60),
                hover: fieldStateRef(c(s, 'l', 'textField.error', 55)),
                focus: fieldStateRef(c(s, 'l', 'textField.error', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 20)),
                readOnly: fieldStateRef(c(s, 'l', 'textField.error', 65))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'l', 'textField.warning', 60),
                hover: fieldStateRef(c(s, 'l', 'textField.warning', 55)),
                focus: fieldStateRef(c(s, 'l', 'textField.warning', 60)),
                disabled: fieldStateRef(c(s, 'l', 'neutral', 90, 20)),
                readOnly: fieldStateRef(c(s, 'l', 'textField.warning', 65))
              }
            }
          }
        }
      },
      dark: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: c(s, 'd', 'neutral.v2', 55),
                hover: fieldStateRef(c(s, 'd', 'neutral.v2', 70)),
                focus: fieldStateRef(c(s, 'd', 'primary', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'neutral.v2', 45))
              }
            },
            error: {
              medium: {
                rest: c(s, 'd', 'textField.error', 80),
                hover: fieldStateRef(c(s, 'd', 'textField.error', 85)),
                focus: fieldStateRef(c(s, 'd', 'textField.error', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'textField.error', 75))
              }
            },
            warning: {
              medium: {
                rest: c(s, 'd', 'textField.warning', 80),
                hover: fieldStateRef(c(s, 'd', 'textField.warning', 85)),
                focus: fieldStateRef(c(s, 'd', 'textField.warning', 80)),
                disabled: fieldStateRef(c(s, 'd', 'neutral', 30, 38)),
                readOnly: fieldStateRef(c(s, 'd', 'textField.warning', 75))
              }
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
  const palettes = withVividSurfaceContexts(
    withLightLowEmphasisFromDarkMedium(createTextFieldElementPalettes(args)),
    args.c,
    args.transparent
  );

  return {
    options: {
      variant: 'standard',
      mode: 'outline',
      focusRingColorSource: 'component'
    },
    variants: {
      standard: {
        options: {
          mode: 'outline',
          labelPlacement: 'top'
        },
        modes: {
          outline: {
            options: {
              labelOffset: {
                square: 'none',
                rounded: 'schema',
                pill: 'radius'
              }
            },
            elements: {
              e1: {
                name: 'root'
              },
              e2: {
                name: 'label',
                typography: {
                  's:sm:1': 'label-medium',
                  's:md:1': 'label-large'
                },
                scales: {
                  marginBottom: {
                    's:sm:1': 4,
                    's:md:1': 6
                  }
                },
                palettes: palettes.label
              },
              e7: {
                name: 'inline-label',
                typography: {
                  's:sm:1': 'label-medium',
                  's:md:1': 'label-large'
                },
                scales: {
                  boxWidth: {
                    's:sm:1': 88,
                    's:md:1': 96
                  },
                  paddingRight: {
                    's:sm:1': 10,
                    's:md:1': 12
                  }
                },
                palettes: palettes.label
              },
              e3: {
                name: 'control',
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
                  borderRadius: {
                    rounded: {
                      's:sm:1': 6,
                      's:md:1': 8
                    },
                    pill: {
                      's:sm:1': 18,
                      's:md:1': 20
                    },
                    square: {
                      's:sm:1': 0,
                      's:md:1': 0
                    }
                  },
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
                palettes: withPlaceholderPalette(palettes.control, palettes.placeholder)
              },
              e4: {
                name: 'input',
                typography: {
                  's:sm:1': 'body-medium',
                  's:md:1': 'body-large'
                },
                palettes: palettes.input
              },
              e5: {
                name: 'message',
                typography: {
                  's:sm:1': 'body-small',
                  's:md:1': 'body-small'
                },
                scales: {
                  marginTop: {
                    's:sm:1': 4,
                    's:md:1': 6
                  }
                },
                palettes: palettes.message
              }
            }
          },
          underline: {
            options: {
              labelOffset: {
                square: 'none',
                rounded: 'schema',
                pill: 'schema'
              }
            },
            elements: {
              e1: {
                name: 'root'
              },
              e2: {
                name: 'label',
                typography: {
                  's:sm:1': 'label-medium',
                  's:md:1': 'label-large'
                },
                scales: {
                  marginBottom: {
                    's:sm:1': 4,
                    's:md:1': 6
                  }
                },
                palettes: palettes.label
              },
              e7: {
                name: 'inline-label',
                typography: {
                  's:sm:1': 'label-medium',
                  's:md:1': 'label-large'
                },
                scales: {
                  boxWidth: {
                    's:sm:1': 88,
                    's:md:1': 96
                  },
                  paddingRight: {
                    's:sm:1': 10,
                    's:md:1': 12
                  }
                },
                palettes: palettes.label
              },
              e3: {
                name: 'control',
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
                  borderRadius: {
                    rounded: {
                      's:sm:1': 6,
                      's:md:1': 8
                    },
                    pill: {
                      's:sm:1': 18,
                      's:md:1': 20
                    },
                    square: {
                      's:sm:1': 0,
                      's:md:1': 0
                    }
                  },
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
                palettes: withPlaceholderPalette(palettes.control, palettes.placeholder)
              },
              e4: {
                name: 'input',
                typography: {
                  's:sm:1': 'body-medium',
                  's:md:1': 'body-large'
                },
                palettes: palettes.input
              },
              e5: {
                name: 'message',
                typography: {
                  's:sm:1': 'body-small',
                  's:md:1': 'body-small'
                },
                scales: {
                  marginTop: {
                    's:sm:1': 4,
                    's:md:1': 6
                  }
                },
                palettes: palettes.message
              },
              e6: {
                name: 'indicator',
                scales: {
                  boxHeight: {
                    's:sm:1': 1,
                    's:md:1': 1
                  }
                },
                palettes: palettes.indicatorUnderline
              }
            }
          },
          borderless: {
            options: {
              labelOffset: {
                square: 'none',
                rounded: 'schema',
                pill: 'input-start'
              }
            },
            elements: {
              e1: {
                name: 'root'
              },
              e2: {
                name: 'label',
                typography: {
                  's:sm:1': 'label-medium',
                  's:md:1': 'label-large'
                },
                scales: {
                  marginBottom: {
                    's:sm:1': 4,
                    's:md:1': 6
                  }
                },
                palettes: palettes.label
              },
              e7: {
                name: 'inline-label',
                typography: {
                  's:sm:1': 'label-medium',
                  's:md:1': 'label-large'
                },
                scales: {
                  boxWidth: {
                    's:sm:1': 88,
                    's:md:1': 96
                  },
                  paddingRight: {
                    's:sm:1': 10,
                    's:md:1': 12
                  }
                },
                palettes: palettes.label
              },
              e3: {
                name: 'control',
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
                  borderRadius: {
                    rounded: {
                      's:sm:1': 6,
                      's:md:1': 8
                    },
                    pill: {
                      's:sm:1': 18,
                      's:md:1': 20
                    },
                    square: {
                      's:sm:1': 0,
                      's:md:1': 0
                    }
                  },
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
                palettes: withPlaceholderPalette(palettes.controlBorderless, palettes.placeholder)
              },
              e4: {
                name: 'input',
                typography: {
                  's:sm:1': 'body-medium',
                  's:md:1': 'body-large'
                },
                palettes: palettes.input
              },
              e5: {
                name: 'message',
                typography: {
                  's:sm:1': 'body-small',
                  's:md:1': 'body-small'
                },
                scales: {
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
      },
      floating: {
        options: {
          mode: 'notched'
        },
        modes: {
          notched: {
            options: {
              labelOffset: {
                square: 'none',
                rounded: 'radius',
                pill: 'input-start'
              }
            },
            elements: {
              e1: {
                name: 'root'
              },
              e2: {
                name: 'label',
                typography: { 's:all': 'body-small' },
                scales: {
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
                },
                palettes: palettes.label
              },
              e3: {
                name: 'control',
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
                  borderRadius: {
                    rounded: {
                      's:sm:1': 6,
                      's:md:1': 8
                    },
                    pill: {
                      's:sm:1': 24,
                      's:md:1': 28
                    },
                    square: {
                      's:sm:1': 0,
                      's:md:1': 0
                    }
                  },
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
                palettes: withPlaceholderPalette(
                  palettes.controlFloatingNotched,
                  palettes.placeholder
                )
              },
              e4: {
                name: 'input',
                typography: {
                  's:sm:1': 'body-medium',
                  's:md:1': 'body-large'
                },
                palettes: palettes.input
              },
              e5: {
                name: 'message',
                typography: {
                  's:sm:1': 'body-small',
                  's:md:1': 'body-small'
                },
                scales: {
                  marginTop: {
                    's:sm:1': 4,
                    's:md:1': 6
                  }
                },
                palettes: palettes.message
              }
            }
          },
          inside: {
            options: {
              labelOffset: {
                square: 'input-start',
                rounded: 'input-start',
                pill: 'schema'
              }
            },
            elements: {
              e1: {
                name: 'root'
              },
              e2: {
                name: 'label',
                typography: { 's:all': 'body-small' },
                scales: {
                  marginTop: 8,
                  marginLeft: 22
                },
                palettes: palettes.label
              },
              e3: {
                name: 'control',
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
                  borderRadius: {
                    rounded: {
                      's:sm:1': 6,
                      's:md:1': 8
                    },
                    pill: {
                      's:sm:1': 26,
                      's:md:1': 30
                    },
                    square: {
                      's:sm:1': 0,
                      's:md:1': 0
                    }
                  },
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
                palettes: withPlaceholderPalette(palettes.control, palettes.placeholder)
              },
              e4: {
                name: 'input',
                typography: {
                  's:sm:1': 'body-medium',
                  's:md:1': 'body-large'
                },
                scales: {
                  paddingTop: 10
                },
                palettes: palettes.input
              },
              e5: {
                name: 'message',
                typography: {
                  's:sm:1': 'body-small',
                  's:md:1': 'body-small'
                },
                scales: {
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
      }
    }
  };
}
