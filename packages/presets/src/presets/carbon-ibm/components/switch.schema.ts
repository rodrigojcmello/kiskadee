import type { Schema } from '@kiskadee/core';

type CarbonIbmSegmentName = 'default';
type SwitchComponent = NonNullable<Schema<CarbonIbmSegmentName>['components']['switch']>;

function switchStateRef<T>(value: T): { ref: T } {
  return { ref: value };
}

const carbonSwitchColor = {
  textSecondary: '#525252',
  textPrimary: '#161616',
  textDisabled: '#C6C6C6',
  iconOnColor: '#FFFFFF',
  iconOnColorDisabled: '#8D8D8D',
  supportSuccess: '#24A148',
  buttonDisabled: '#C6C6C6',
  toggleOff: '#8D8D8D',
  transparent: [0, 0, 0, 0] as const
} as const;

export function createCarbonIbmSwitchSchema(): SwitchComponent {
  return {
    effects: {
      activationFeedback: {
        profile: 'halo',
        origin: 'center',
        visual: {
          layer: 'underlay',
          paint: 'halo',
          tone: {
            default: 'subtle'
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
      controlTextVisibility: 'always'
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
                  boxWidth: { 's:md:1': 48 },
                  boxHeight: { 's:md:1': 24 },
                  borderWidth: 0,
                  borderRadius: {
                    rounded: 2,
                    pill: 12,
                    square: 0
                  },
                  paddingTop: { 's:md:1': 2 },
                  paddingRight: { 's:md:1': 2 },
                  paddingBottom: { 's:md:1': 2 },
                  paddingLeft: { 's:md:1': 2 }
                },
                palettes: {
                  default: {
                    light: {
                      boxColor: {
                        neutral: {
                          medium: {
                            rest: carbonSwitchColor.toggleOff,
                            hover: switchStateRef(carbonSwitchColor.toggleOff),
                            focus: switchStateRef(carbonSwitchColor.toggleOff),
                            pressed: switchStateRef(carbonSwitchColor.toggleOff),
                            disabled: switchStateRef(carbonSwitchColor.buttonDisabled),
                            selected: {
                              rest: switchStateRef(carbonSwitchColor.supportSuccess),
                              hover: switchStateRef(carbonSwitchColor.supportSuccess),
                              focus: switchStateRef(carbonSwitchColor.supportSuccess),
                              pressed: switchStateRef(carbonSwitchColor.supportSuccess)
                            }
                          }
                        }
                      },
                      borderColor: {
                        neutral: {
                          medium: {
                            rest: carbonSwitchColor.transparent,
                            hover: switchStateRef(carbonSwitchColor.transparent),
                            focus: switchStateRef(carbonSwitchColor.transparent),
                            pressed: switchStateRef(carbonSwitchColor.transparent),
                            disabled: switchStateRef(carbonSwitchColor.transparent),
                            selected: {
                              rest: switchStateRef(carbonSwitchColor.transparent),
                              hover: switchStateRef(carbonSwitchColor.transparent),
                              focus: switchStateRef(carbonSwitchColor.transparent),
                              pressed: switchStateRef(carbonSwitchColor.transparent)
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              e3: {
                name: 'thumb',
                decorations: {
                  borderStyle: 'none'
                },
                scales: {
                  boxWidth: { 's:md:1': 20 },
                  boxHeight: { 's:md:1': 20 },
                  borderWidth: 0,
                  borderRadius: {
                    rounded: 2,
                    pill: 10,
                    square: 0
                  }
                },
                palettes: {
                  default: {
                    light: {
                      boxColor: {
                        neutral: {
                          medium: {
                            rest: carbonSwitchColor.iconOnColor,
                            hover: switchStateRef(carbonSwitchColor.iconOnColor),
                            focus: switchStateRef(carbonSwitchColor.iconOnColor),
                            pressed: switchStateRef(carbonSwitchColor.iconOnColor),
                            disabled: switchStateRef(carbonSwitchColor.iconOnColorDisabled),
                            selected: {
                              rest: switchStateRef(carbonSwitchColor.iconOnColor),
                              hover: switchStateRef(carbonSwitchColor.iconOnColor),
                              focus: switchStateRef(carbonSwitchColor.iconOnColor),
                              pressed: switchStateRef(carbonSwitchColor.iconOnColor)
                            }
                          }
                        }
                      },
                      borderColor: {
                        neutral: {
                          medium: {
                            rest: carbonSwitchColor.transparent,
                            hover: switchStateRef(carbonSwitchColor.transparent),
                            focus: switchStateRef(carbonSwitchColor.transparent),
                            pressed: switchStateRef(carbonSwitchColor.transparent),
                            disabled: switchStateRef(carbonSwitchColor.transparent),
                            selected: {
                              rest: switchStateRef(carbonSwitchColor.transparent),
                              hover: switchStateRef(carbonSwitchColor.transparent),
                              focus: switchStateRef(carbonSwitchColor.transparent),
                              pressed: switchStateRef(carbonSwitchColor.transparent)
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              e4: {
                name: 'label',
                decorations: {
                  textFont: 'body',
                  textWeight: 'normal'
                },
                scales: {
                  textSize: { 's:md:1': 12 },
                  textHeight: { 's:md:1': 16 },
                  marginRight: { 's:md:1': 8 }
                },
                palettes: {
                  default: {
                    light: {
                      textColor: {
                        neutral: {
                          medium: {
                            rest: carbonSwitchColor.textSecondary,
                            disabled: switchStateRef(carbonSwitchColor.textDisabled)
                          }
                        }
                      }
                    }
                  }
                }
              },
              e5: {
                name: 'control text',
                decorations: {
                  textFont: 'body',
                  textWeight: 'normal'
                },
                scales: {
                  textSize: { 's:md:1': 14 },
                  textHeight: { 's:md:1': 18 },
                  marginRight: { 's:md:1': 8 }
                },
                palettes: {
                  default: {
                    light: {
                      textColor: {
                        neutral: {
                          medium: {
                            rest: carbonSwitchColor.textPrimary,
                            disabled: switchStateRef(carbonSwitchColor.textDisabled)
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}
