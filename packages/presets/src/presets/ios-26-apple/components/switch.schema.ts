import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Ios26AppleSegmentName = 'default';
type SwitchComponent = NonNullable<Schema<Ios26AppleSegmentName>['components']['switch']>;

type CreateIos26AppleSwitchSchemaArgs = {
  c: PresetColorGetter<Ios26AppleSegmentName>;
  segmentNames: readonly Ios26AppleSegmentName[];
  transparent: readonly [number, number, number, number];
};

const iosSwitchOffTrack = [0, 0, 47.059, 0.2] as const;
const iosSwitchThumb = [0, 0, 100, 1] as const;

export function createIos26AppleSwitchSchema({
  c,
  segmentNames,
  transparent
}: CreateIos26AppleSwitchSchemaArgs): SwitchComponent {
  const iosSwitchOnTrack = c('default', 'l', 'switch.neutral', 50);

  return {
    options: {
      variant: 'standard',
      radius: 'pill',
      activationMotion: 'standard'
    },
    variants: {
      standard: {
        options: {
          mode: 'base'
        },
        modes: {
          base: {
            elements: {
              e2: {
                name: 'track',
                decorations: {
                  borderStyle: 'none'
                },
                scales: {
                  boxWidth: {
                    's:sm:3': 36,
                    's:sm:2': 44,
                    's:sm:1': 54,
                    's:md:1': 64,
                    's:lg:1': 80
                  },
                  boxHeight: {
                    's:sm:3': 16,
                    's:sm:2': 20,
                    's:sm:1': 24,
                    's:md:1': 28,
                    's:lg:1': 36
                  },
                  borderWidth: 0,
                  borderRadius: {
                    rounded: 6,
                    pill: {
                      's:sm:3': 8,
                      's:sm:2': 10,
                      's:sm:1': 12,
                      's:md:1': 14,
                      's:lg:1': 18
                    },
                    square: 0
                  },
                  paddingTop: {
                    's:sm:3': 1.5,
                    's:sm:2': 2,
                    's:sm:1': 2,
                    's:md:1': 2,
                    's:lg:1': 3
                  },
                  paddingRight: {
                    's:sm:3': 1.5,
                    's:sm:2': 2,
                    's:sm:1': 2,
                    's:md:1': 2,
                    's:lg:1': 3
                  },
                  paddingBottom: {
                    's:sm:3': 1.5,
                    's:sm:2': 2,
                    's:sm:1': 2,
                    's:md:1': 2,
                    's:lg:1': 3
                  },
                  paddingLeft: {
                    's:sm:3': 1.5,
                    's:sm:2': 2,
                    's:sm:1': 2,
                    's:md:1': 2,
                    's:lg:1': 3
                  }
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: {
                        medium: {
                          rest: iosSwitchOffTrack,
                          hover: { ref: iosSwitchOffTrack },
                          focus: { ref: iosSwitchOffTrack },
                          pressed: { ref: iosSwitchOffTrack },
                          selected: {
                            rest: { ref: iosSwitchOnTrack },
                            hover: { ref: iosSwitchOnTrack },
                            focus: { ref: iosSwitchOnTrack },
                            pressed: { ref: iosSwitchOnTrack }
                          }
                        }
                      }
                    },
                    borderColor: {
                      neutral: {
                        medium: {
                          rest: transparent,
                          hover: { ref: transparent },
                          focus: { ref: transparent },
                          pressed: { ref: transparent },
                          selected: {
                            rest: { ref: transparent },
                            hover: { ref: transparent },
                            focus: { ref: transparent },
                            pressed: { ref: transparent }
                          }
                        }
                      }
                    }
                  }
                }))
              },
              e3: {
                name: 'thumb',
                scales: {
                  boxWidth: {
                    's:sm:3': 21,
                    's:sm:2': 26,
                    's:sm:1': 32,
                    's:md:1': 38,
                    's:lg:1': 47
                  },
                  boxHeight: {
                    's:sm:3': 13,
                    's:sm:2': 16,
                    's:sm:1': 20,
                    's:md:1': 24,
                    's:lg:1': 30
                  },
                  borderRadius: {
                    rounded: 6,
                    pill: {
                      's:sm:3': 6.5,
                      's:sm:2': 8,
                      's:sm:1': 10,
                      's:md:1': 12,
                      's:lg:1': 15
                    },
                    square: 0
                  }
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: {
                        medium: {
                          rest: iosSwitchThumb,
                          hover: { ref: iosSwitchThumb },
                          focus: { ref: iosSwitchThumb },
                          pressed: { ref: iosSwitchThumb },
                          selected: {
                            rest: { ref: iosSwitchThumb },
                            hover: { ref: iosSwitchThumb },
                            focus: { ref: iosSwitchThumb },
                            pressed: { ref: iosSwitchThumb }
                          }
                        }
                      }
                    },
                    borderColor: {
                      neutral: {
                        medium: {
                          rest: transparent,
                          selected: {
                            rest: { ref: transparent }
                          }
                        }
                      }
                    }
                  }
                }))
              },
              e4: {
                name: 'label',
                decorations: {
                  textFont: 'body',
                  textWeight: 'normal'
                },
                scales: {
                  textSize: {
                    's:md:1': 17
                  },
                  textHeight: {
                    's:md:1': 22
                  },
                  marginLeft: {
                    's:md:1': 12
                  },
                  marginRight: {
                    's:md:1': 12
                  }
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    textColor: {
                      neutral: {
                        medium: {
                          rest: c('default', 'l', 'button.neutral', 100)
                        }
                      }
                    }
                  }
                }))
              }
            }
          }
        }
      }
    }
  };
}
