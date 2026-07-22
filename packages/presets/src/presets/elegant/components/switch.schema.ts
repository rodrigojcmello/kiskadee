import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';

type ElegantSegmentName = 'default';
type SwitchComponent = NonNullable<Schema<ElegantSegmentName>['components']['switch']>;

const transparent = '#00000000' as const;
const ios18SwitchTrackOff = '#eaeaeb' as const;
const elegantSwitchTrackOffHover = '#efeff0' as const;
const elegantSwitchTrackOffPressed = '#dadadd' as const;
const ios18SwitchTrackOn = '#32c85a' as const;
const elegantSwitchTrackOnHoverFocus = '#43d069' as const;
const ios18SwitchTrackOnPressed = '#32a952' as const;
const ios18SwitchTrackDisabled = '#eaeaeb6b' as const;
const ios18SwitchThumb = '#ffffff' as const;
const ios18SwitchThumbDisabled = '#ffffffb8' as const;
const ios18SwitchLabel = '#121212' as const;
const ios18SwitchLabelDisabled = '#1212124d' as const;
const ios18SwitchOffIcon = '#7878788c' as const;

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
                    's:md:1': 40
                  },
                  boxHeight: {
                    's:md:1': 22
                  },
                  borderWidth: 0,
                  borderRadius: {
                    rounded: {
                      's:md:1': 11
                    },
                    pill: {
                      's:md:1': 11
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
                    default: {
                      boxColor: {
                        neutral: {
                          medium: {
                            rest: ios18SwitchTrackOff,
                            hover: { ref: elegantSwitchTrackOffHover },
                            pressed: { ref: elegantSwitchTrackOffPressed },
                            disabled: { ref: ios18SwitchTrackDisabled },
                            selected: {
                              rest: { ref: ios18SwitchTrackOn },
                              hover: { ref: elegantSwitchTrackOnHoverFocus },
                              focus: { ref: elegantSwitchTrackOnHoverFocus },
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
                  }
                }))
              },
              e3: {
                name: 'thumb',
                effects: {
                  shadow: {
                    x: { rest: 1, hover: 1, pressed: 1 },
                    y: { rest: 1, hover: 2, pressed: 1 },
                    blur: { rest: 2, hover: 4, pressed: 2 },
                    color: {
                      rest: '#00000038',
                      hover: '#00000042',
                      pressed: '#00000038'
                    }
                  }
                },
                scales: {
                  boxWidth: {
                    's:md:1': 18
                  },
                  boxHeight: {
                    's:md:1': 18
                  },
                  borderRadius: {
                    rounded: {
                      's:md:1': 9
                    },
                    pill: {
                      's:md:1': 9
                    },
                    square: 0
                  }
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    default: {
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
                    default: {
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
                    default: {
                      textColor: {
                        neutral: {
                          medium: {
                            rest: ios18SwitchLabel,
                            disabled: ios18SwitchLabelDisabled
                          }
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
