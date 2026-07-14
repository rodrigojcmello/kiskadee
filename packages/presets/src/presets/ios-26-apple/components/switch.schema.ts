import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Ios26AppleSegmentName = 'default';
type SwitchComponent = NonNullable<Schema<Ios26AppleSegmentName>['components']['switch']>;

type CreateIos26AppleSwitchSchemaArgs = {
  c: PresetColorGetter<Ios26AppleSegmentName>;
  segmentNames: readonly Ios26AppleSegmentName[];
  transparent: string;
};

const iosSwitchOffTrack = '#78787833' as const;
const iosSwitchThumb = '#ffffff' as const;
const iosSwitchOnPrimaryTrack = '#ffffff52' as const;
const iosSwitchOnPrimaryTrackHover = '#ffffff66' as const;
const iosSwitchOnPrimaryTrackPressed = '#ffffff7a' as const;
const iosSwitchOnPrimaryTrackDisabled = '#ffffff1f' as const;
const iosSwitchOnPrimaryTrackSelected = '#ffffff' as const;
const iosSwitchOffIcon = '#7878788c' as const;

export function createIos26AppleSwitchSchema({
  c,
  segmentNames,
  transparent
}: CreateIos26AppleSwitchSchemaArgs): SwitchComponent {
  const iosSwitchNeutralOnTrack = c('default', 'l', 'greenLike', 50);
  const iosSwitchPrimaryOnTrack = c('default', 'l', 'primary', 50);
  const iosSwitchPolarityOffTrack = c('default', 'l', 'redLike', 50);
  const iosSwitchLabelText = c('default', 'l', 'button.neutral', 100);

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
            size: 6
          }
        }
      }
    },
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
                            rest: { ref: iosSwitchNeutralOnTrack },
                            hover: { ref: iosSwitchNeutralOnTrack },
                            focus: { ref: iosSwitchNeutralOnTrack },
                            pressed: { ref: iosSwitchNeutralOnTrack }
                          }
                        },
                        low: {
                          rest: iosSwitchOnPrimaryTrack,
                          hover: { ref: iosSwitchOnPrimaryTrackHover },
                          focus: { ref: iosSwitchOnPrimaryTrack },
                          pressed: { ref: iosSwitchOnPrimaryTrackPressed },
                          disabled: { ref: iosSwitchOnPrimaryTrackDisabled },
                          selected: {
                            rest: { ref: iosSwitchOnPrimaryTrackSelected },
                            hover: { ref: iosSwitchOnPrimaryTrackSelected },
                            focus: { ref: iosSwitchOnPrimaryTrackSelected },
                            pressed: { ref: iosSwitchOnPrimaryTrackSelected }
                          }
                        }
                      },
                      primary: {
                        medium: {
                          rest: iosSwitchOffTrack,
                          hover: { ref: iosSwitchOffTrack },
                          focus: { ref: iosSwitchOffTrack },
                          pressed: { ref: iosSwitchOffTrack },
                          selected: {
                            rest: { ref: iosSwitchPrimaryOnTrack },
                            hover: { ref: iosSwitchPrimaryOnTrack },
                            focus: { ref: iosSwitchPrimaryOnTrack },
                            pressed: { ref: iosSwitchPrimaryOnTrack }
                          }
                        },
                        low: {
                          rest: iosSwitchOnPrimaryTrack,
                          hover: { ref: iosSwitchOnPrimaryTrackHover },
                          focus: { ref: iosSwitchOnPrimaryTrack },
                          pressed: { ref: iosSwitchOnPrimaryTrackPressed },
                          disabled: { ref: iosSwitchOnPrimaryTrackDisabled },
                          selected: {
                            rest: { ref: iosSwitchOnPrimaryTrackSelected },
                            hover: { ref: iosSwitchOnPrimaryTrackSelected },
                            focus: { ref: iosSwitchOnPrimaryTrackSelected },
                            pressed: { ref: iosSwitchOnPrimaryTrackSelected }
                          }
                        }
                      },
                      polarity: {
                        medium: {
                          rest: iosSwitchPolarityOffTrack,
                          hover: { ref: iosSwitchPolarityOffTrack },
                          focus: { ref: iosSwitchPolarityOffTrack },
                          pressed: { ref: iosSwitchPolarityOffTrack },
                          selected: {
                            rest: { ref: iosSwitchNeutralOnTrack },
                            hover: { ref: iosSwitchNeutralOnTrack },
                            focus: { ref: iosSwitchNeutralOnTrack },
                            pressed: { ref: iosSwitchNeutralOnTrack }
                          }
                        },
                        low: {
                          rest: iosSwitchOnPrimaryTrack,
                          hover: { ref: iosSwitchOnPrimaryTrackHover },
                          focus: { ref: iosSwitchOnPrimaryTrack },
                          pressed: { ref: iosSwitchOnPrimaryTrackPressed },
                          disabled: { ref: iosSwitchOnPrimaryTrackDisabled },
                          selected: {
                            rest: { ref: iosSwitchOnPrimaryTrackSelected },
                            hover: { ref: iosSwitchOnPrimaryTrackSelected },
                            focus: { ref: iosSwitchOnPrimaryTrackSelected },
                            pressed: { ref: iosSwitchOnPrimaryTrackSelected }
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
                        },
                        low: {
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
                      },
                      primary: {
                        medium: {
                          rest: transparent,
                          selected: {
                            rest: { ref: transparent }
                          }
                        },
                        low: {
                          rest: transparent,
                          selected: {
                            rest: { ref: transparent }
                          }
                        }
                      },
                      polarity: {
                        medium: {
                          rest: transparent,
                          selected: {
                            rest: { ref: transparent }
                          }
                        },
                        low: {
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
                        },
                        low: {
                          rest: iosSwitchThumb,
                          hover: { ref: iosSwitchThumb },
                          focus: { ref: iosSwitchThumb },
                          pressed: { ref: iosSwitchThumb },
                          disabled: { ref: iosSwitchOnPrimaryTrackDisabled },
                          selected: {
                            rest: { ref: iosSwitchNeutralOnTrack },
                            hover: { ref: iosSwitchNeutralOnTrack },
                            focus: { ref: iosSwitchNeutralOnTrack },
                            pressed: { ref: iosSwitchNeutralOnTrack }
                          }
                        }
                      },
                      primary: {
                        medium: {
                          rest: iosSwitchThumb,
                          selected: {
                            rest: { ref: iosSwitchThumb }
                          }
                        },
                        low: {
                          rest: iosSwitchThumb,
                          selected: {
                            rest: { ref: iosSwitchPrimaryOnTrack }
                          }
                        }
                      },
                      polarity: {
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
                        },
                        low: {
                          rest: iosSwitchThumb,
                          hover: { ref: iosSwitchThumb },
                          focus: { ref: iosSwitchThumb },
                          pressed: { ref: iosSwitchThumb },
                          selected: {
                            rest: { ref: iosSwitchNeutralOnTrack },
                            hover: { ref: iosSwitchNeutralOnTrack },
                            focus: { ref: iosSwitchNeutralOnTrack },
                            pressed: { ref: iosSwitchNeutralOnTrack }
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
                        },
                        low: {
                          rest: transparent,
                          selected: {
                            rest: { ref: transparent }
                          }
                        }
                      },
                      primary: {
                        medium: {
                          rest: transparent,
                          selected: {
                            rest: { ref: transparent }
                          }
                        },
                        low: {
                          rest: transparent,
                          selected: {
                            rest: { ref: transparent }
                          }
                        }
                      },
                      polarity: {
                        medium: {
                          rest: transparent,
                          selected: {
                            rest: { ref: transparent }
                          }
                        },
                        low: {
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
              e6: {
                name: 'icon',
                scales: {
                  boxWidth: {
                    's:sm:3': 8,
                    's:sm:2': 10,
                    's:sm:1': 12,
                    's:md:1': 16,
                    's:lg:1': 20
                  },
                  boxHeight: {
                    's:sm:3': 8,
                    's:sm:2': 10,
                    's:sm:1': 12,
                    's:md:1': 16,
                    's:lg:1': 20
                  }
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    textColor: {
                      neutral: {
                        medium: {
                          rest: iosSwitchOffIcon,
                          hover: { ref: iosSwitchOffIcon },
                          focus: { ref: iosSwitchOffIcon },
                          pressed: { ref: iosSwitchOffIcon },
                          selected: {
                            rest: { ref: iosSwitchNeutralOnTrack },
                            hover: { ref: iosSwitchNeutralOnTrack },
                            focus: { ref: iosSwitchNeutralOnTrack },
                            pressed: { ref: iosSwitchNeutralOnTrack }
                          }
                        },
                        low: {
                          rest: iosSwitchNeutralOnTrack,
                          hover: { ref: iosSwitchNeutralOnTrack },
                          focus: { ref: iosSwitchNeutralOnTrack },
                          pressed: { ref: iosSwitchNeutralOnTrack },
                          disabled: { ref: iosSwitchOnPrimaryTrackDisabled },
                          selected: {
                            rest: { ref: iosSwitchThumb },
                            hover: { ref: iosSwitchThumb },
                            focus: { ref: iosSwitchThumb },
                            pressed: { ref: iosSwitchThumb }
                          }
                        }
                      },
                      primary: {
                        medium: {
                          rest: iosSwitchOffIcon,
                          selected: {
                            rest: { ref: iosSwitchPrimaryOnTrack }
                          }
                        },
                        low: {
                          rest: iosSwitchPrimaryOnTrack,
                          selected: {
                            rest: { ref: iosSwitchThumb }
                          }
                        }
                      },
                      polarity: {
                        medium: {
                          rest: iosSwitchPolarityOffTrack,
                          hover: { ref: iosSwitchPolarityOffTrack },
                          focus: { ref: iosSwitchPolarityOffTrack },
                          pressed: { ref: iosSwitchPolarityOffTrack },
                          selected: {
                            rest: { ref: iosSwitchNeutralOnTrack },
                            hover: { ref: iosSwitchNeutralOnTrack },
                            focus: { ref: iosSwitchNeutralOnTrack },
                            pressed: { ref: iosSwitchNeutralOnTrack }
                          }
                        },
                        low: {
                          rest: iosSwitchPolarityOffTrack,
                          selected: {
                            rest: { ref: iosSwitchThumb }
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
                          rest: iosSwitchLabelText
                        },
                        low: {
                          rest: iosSwitchThumb
                        }
                      },
                      primary: {
                        medium: {
                          rest: iosSwitchLabelText
                        },
                        low: {
                          rest: iosSwitchThumb
                        }
                      },
                      polarity: {
                        medium: {
                          rest: iosSwitchLabelText
                        },
                        low: {
                          rest: iosSwitchThumb
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
