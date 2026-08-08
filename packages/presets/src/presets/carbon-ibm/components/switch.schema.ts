import type { Schema } from '@kiskadee/core';

type CarbonIbmSegmentName = 'default';
type SwitchComponent = NonNullable<Schema<CarbonIbmSegmentName>['components']['switch']>;

function switchStateRef<T>(value: T): { ref: T } {
  return { ref: value };
}

const carbonSwitchColor = {
  textSecondary: '#525252',
  textPrimary: '#161616',
  textOnDark: '#f4f4f4',
  textDisabled: '#c6c6c6',
  iconOnColor: '#ffffff',
  iconOnColorDisabled: '#8d8d8d',
  supportSuccess: '#24a148',
  supportSuccessOnDark: '#42be65',
  buttonDisabled: '#c6c6c6',
  toggleOff: '#8d8d8d',
  toggleOffOnDark: '#6b6b6b',
  transparent: '#00000000' as const
} as const;

export function createCarbonIbmSwitchSchema(): SwitchComponent {
  const mediumTrackColor = {
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
  };
  const lowTrackColor = {
    rest: carbonSwitchColor.toggleOffOnDark,
    hover: switchStateRef(carbonSwitchColor.toggleOffOnDark),
    focus: switchStateRef(carbonSwitchColor.toggleOffOnDark),
    pressed: switchStateRef(carbonSwitchColor.toggleOffOnDark),
    disabled: switchStateRef(carbonSwitchColor.buttonDisabled),
    selected: {
      rest: switchStateRef(carbonSwitchColor.supportSuccessOnDark),
      hover: switchStateRef(carbonSwitchColor.supportSuccessOnDark),
      focus: switchStateRef(carbonSwitchColor.supportSuccessOnDark),
      pressed: switchStateRef(carbonSwitchColor.supportSuccessOnDark)
    }
  };
  const mediumIconColor = {
    rest: carbonSwitchColor.toggleOff,
    hover: switchStateRef(carbonSwitchColor.toggleOff),
    focus: switchStateRef(carbonSwitchColor.toggleOff),
    pressed: switchStateRef(carbonSwitchColor.toggleOff),
    disabled: switchStateRef(carbonSwitchColor.textDisabled),
    selected: {
      rest: switchStateRef(carbonSwitchColor.supportSuccess),
      hover: switchStateRef(carbonSwitchColor.supportSuccess),
      focus: switchStateRef(carbonSwitchColor.supportSuccess),
      pressed: switchStateRef(carbonSwitchColor.supportSuccess)
    }
  };
  const lowIconColor = {
    rest: carbonSwitchColor.toggleOffOnDark,
    hover: switchStateRef(carbonSwitchColor.toggleOffOnDark),
    focus: switchStateRef(carbonSwitchColor.toggleOffOnDark),
    pressed: switchStateRef(carbonSwitchColor.toggleOffOnDark),
    disabled: switchStateRef(carbonSwitchColor.textDisabled),
    selected: {
      rest: switchStateRef(carbonSwitchColor.supportSuccessOnDark),
      hover: switchStateRef(carbonSwitchColor.supportSuccessOnDark),
      focus: switchStateRef(carbonSwitchColor.supportSuccessOnDark),
      pressed: switchStateRef(carbonSwitchColor.supportSuccessOnDark)
    }
  };
  const thumbColor = {
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
  };
  const transparentBorder = {
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
  };

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
                  boxWidth: { 's:sm:1': 32, 's:md:1': 48 },
                  boxHeight: { 's:sm:1': 16, 's:md:1': 24 },
                  borderWidth: 0,
                  borderRadius: {
                    rounded: 2,
                    pill: { 's:sm:1': 8, 's:md:1': 12 },
                    square: 0
                  },
                  paddingTop: { 's:sm:1': 3, 's:md:1': 2 },
                  paddingRight: { 's:sm:1': 3, 's:md:1': 2 },
                  paddingBottom: { 's:sm:1': 3, 's:md:1': 2 },
                  paddingLeft: { 's:sm:1': 3, 's:md:1': 2 }
                },
                palettes: {
                  default: {
                    light: {
                      onSubtle: {
                        boxColor: {
                          neutral: {
                            medium: mediumTrackColor,
                            low: lowTrackColor
                          }
                        },
                        borderColor: {
                          neutral: {
                            medium: transparentBorder,
                            low: transparentBorder
                          }
                        }
                      }
                    },
                    dark: {
                      onSubtle: {
                        boxColor: {
                          neutral: {
                            medium: lowTrackColor
                          }
                        },
                        borderColor: {
                          neutral: {
                            medium: transparentBorder
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
                  boxWidth: { 's:sm:1': 10, 's:md:1': 20 },
                  boxHeight: { 's:sm:1': 10, 's:md:1': 20 },
                  borderWidth: 0,
                  borderRadius: {
                    rounded: 2,
                    pill: { 's:sm:1': 5, 's:md:1': 10 },
                    square: 0
                  }
                },
                palettes: {
                  default: {
                    light: {
                      onSubtle: {
                        boxColor: {
                          neutral: {
                            medium: thumbColor,
                            low: thumbColor
                          }
                        },
                        borderColor: {
                          neutral: {
                            medium: transparentBorder,
                            low: transparentBorder
                          }
                        }
                      }
                    },
                    dark: {
                      onSubtle: {
                        boxColor: {
                          neutral: {
                            medium: thumbColor
                          }
                        },
                        borderColor: {
                          neutral: {
                            medium: transparentBorder
                          }
                        }
                      }
                    }
                  }
                }
              },
              e6: {
                name: 'icon',
                scales: {
                  boxWidth: { 's:sm:1': 6, 's:md:1': 14 },
                  boxHeight: { 's:sm:1': 6, 's:md:1': 14 }
                },
                palettes: {
                  default: {
                    light: {
                      onSubtle: {
                        textColor: {
                          neutral: {
                            medium: mediumIconColor,
                            low: lowIconColor
                          }
                        }
                      }
                    },
                    dark: {
                      onSubtle: {
                        textColor: {
                          neutral: {
                            medium: lowIconColor
                          }
                        }
                      }
                    }
                  }
                }
              },
              e4: {
                name: 'label',
                typography: { 's:md:1': 'label-01' },
                scales: {
                  marginRight: { 's:md:1': 8 }
                },
                palettes: {
                  default: {
                    light: {
                      onSubtle: {
                        textColor: {
                          neutral: {
                            medium: {
                              rest: carbonSwitchColor.textSecondary,
                              disabled: switchStateRef(carbonSwitchColor.textDisabled)
                            },
                            low: {
                              rest: carbonSwitchColor.textDisabled,
                              disabled: switchStateRef(carbonSwitchColor.textDisabled)
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
                              rest: carbonSwitchColor.textDisabled,
                              disabled: switchStateRef(carbonSwitchColor.textDisabled)
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              e5: {
                name: 'control text',
                typography: { 's:md:1': 'body-compact-01' },
                scales: {
                  marginRight: { 's:md:1': 8 }
                },
                palettes: {
                  default: {
                    light: {
                      onSubtle: {
                        textColor: {
                          neutral: {
                            medium: {
                              rest: carbonSwitchColor.textPrimary,
                              disabled: switchStateRef(carbonSwitchColor.textDisabled)
                            },
                            low: {
                              rest: carbonSwitchColor.textOnDark,
                              disabled: switchStateRef(carbonSwitchColor.textDisabled)
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
                              rest: carbonSwitchColor.textOnDark,
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
    }
  };
}
