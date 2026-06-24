import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';

type ElegantSegmentName = 'default';
type SwitchComponent = NonNullable<Schema<ElegantSegmentName>['components']['switch']>;

const transparent = [0, 0, 0, 0] as const;
const ios18SwitchTrackOff = [240, 4, 92, 1] as const;
const ios18SwitchTrackOffPressed = [240, 4, 86, 1] as const;
const ios18SwitchTrackOn = [136, 60, 49, 1] as const;
const ios18SwitchTrackOnPressed = [136, 54, 43, 1] as const;
const ios18SwitchTrackDisabled = [240, 4, 92, 0.42] as const;
const ios18SwitchThumb = [0, 0, 100, 1] as const;
const ios18SwitchThumbDisabled = [0, 0, 100, 0.72] as const;
const ios18SwitchLabel = [0, 0, 7, 1] as const;
const ios18SwitchLabelDisabled = [0, 0, 7, 0.3] as const;
const ios18SwitchOffIcon = [0, 0, 47.059, 0.55] as const;

export function createElegantSwitchSchema(): SwitchComponent {
  const segmentNames = ['default'] as const;

  return {
    effects: {
      activationFeedback: {
        profile: 'halo',
        origin: 'center',
        visual: {
          layer: 'underlay',
          paint: 'outline',
          tone: {
            default: 'subtle',
            byEmphasis: {
              low: 'vivid'
            }
          }
        },
        profiles: {
          halo: {
            size: 8
          }
        }
      },
      shadow: {
        e3: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            disabled: false
          }
        }
      }
    },
    options: {
      variant: 'standard',
      radius: 'pill',
      activationMotion: 'standard',
      controlTextVisibility: 'none'
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
                    's:md:1': 51
                  },
                  boxHeight: {
                    's:md:1': 31
                  },
                  borderWidth: 0,
                  borderRadius: {
                    rounded: {
                      's:md:1': 15.5
                    },
                    pill: {
                      's:md:1': 15.5
                    },
                    square: 0
                  },
                  paddingTop: {
                    's:md:1': 2
                  },
                  paddingRight: {
                    's:md:1': 2
                  },
                  paddingBottom: {
                    's:md:1': 2
                  },
                  paddingLeft: {
                    's:md:1': 2
                  }
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: {
                        medium: {
                          rest: ios18SwitchTrackOff,
                          pressed: ios18SwitchTrackOffPressed,
                          disabled: ios18SwitchTrackDisabled,
                          selected: {
                            rest: { ref: ios18SwitchTrackOn },
                            pressed: { ref: ios18SwitchTrackOnPressed }
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
                          disabled: { ref: transparent },
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
                    's:md:1': 27
                  },
                  boxHeight: {
                    's:md:1': 27
                  },
                  borderRadius: {
                    rounded: {
                      's:md:1': 13.5
                    },
                    pill: {
                      's:md:1': 13.5
                    },
                    square: 0
                  }
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: {
                        medium: {
                          rest: ios18SwitchThumb,
                          hover: { ref: ios18SwitchThumb },
                          focus: { ref: ios18SwitchThumb },
                          pressed: { ref: ios18SwitchThumb },
                          disabled: ios18SwitchThumbDisabled,
                          selected: {
                            rest: { ref: ios18SwitchThumb },
                            hover: { ref: ios18SwitchThumb },
                            focus: { ref: ios18SwitchThumb },
                            pressed: { ref: ios18SwitchThumb }
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
                          disabled: { ref: transparent },
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
              e6: {
                name: 'icon',
                scales: {
                  boxWidth: {
                    's:md:1': 16
                  },
                  boxHeight: {
                    's:md:1': 16
                  }
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    textColor: {
                      neutral: {
                        medium: {
                          rest: ios18SwitchOffIcon,
                          hover: { ref: ios18SwitchOffIcon },
                          focus: { ref: ios18SwitchOffIcon },
                          pressed: { ref: ios18SwitchOffIcon },
                          selected: {
                            rest: { ref: ios18SwitchTrackOn },
                            hover: { ref: ios18SwitchTrackOn },
                            focus: { ref: ios18SwitchTrackOn },
                            pressed: { ref: ios18SwitchTrackOn }
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
                          rest: ios18SwitchLabel,
                          disabled: ios18SwitchLabelDisabled
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
