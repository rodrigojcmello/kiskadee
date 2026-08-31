import { primitive, type Schema } from '@kiskadee/core';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';

type SwitchComponent = NonNullable<Schema<never>['components']['switch']>;

type CreateFluent2MicrosoftSwitchSchemaArgs = {
  c: Fluent2MicrosoftColorResolver;
};

export function createFluent2MicrosoftSwitchSchema({
  c
}: CreateFluent2MicrosoftSwitchSchemaArgs): SwitchComponent {
  const resolve = (locator: Parameters<Fluent2MicrosoftColorResolver['resolve']>[2]) =>
    c.resolve('default', 'l', locator);
  const white = resolve(absoluteCap(primitive('black', 'v1'), 'light'));
  const transparent = resolve(absoluteCap(primitive('black', 'v1'), 'light', 0));
  const neutral6 = resolve(exactColor('switch.neutral', 6, 'component.switch'));
  const neutral25 = resolve(exactColor('switch.neutral', 26, 'component.switch'));
  const neutral70 = resolve(exactColor('switch.neutral', 70, 'component.switch'));
  const primary60 = resolve(referenceColor('primary', 'vivid', 2));
  const primary70 = resolve(referenceColor('primary', 'vivid', 4));
  const primary80 = resolve(referenceColor('primary', 'vivid', 6));
  const polarityOffThumb = resolve(referenceColor('redLike', 'vivid'));
  const polarityOnTrack = resolve(referenceColor('greenLike', 'vivid'));
  const charcoalRest = resolve(exactColor(primitive('black', 'v1'), 50, 'component.switch'));
  const charcoalHover = resolve(exactColor(primitive('black', 'v1'), 55, 'component.switch'));
  const graphite = resolve(exactColor(primitive('black', 'v1'), 65, 'component.switch'));
  const disabledStroke = resolve(exactColor(primitive('black', 'v1'), 10, 'component.switch'));
  const neutralForeground = resolve(referenceColor('switch.neutral', 'vivid'));
  const onPrimaryTrack = resolve(absoluteCap(primitive('black', 'v1'), 'light', 28));
  const onPrimaryTrackHover = resolve(absoluteCap(primitive('black', 'v1'), 'light', 36));
  const onPrimaryTrackPressed = resolve(absoluteCap(primitive('black', 'v1'), 'light', 44));
  const onPrimaryTrackDisabled = resolve(absoluteCap(primitive('black', 'v1'), 'light', 12));
  const onPrimaryBorder = resolve(absoluteCap(primitive('black', 'v1'), 'light', 72));
  const onPrimaryBorderHover = resolve(absoluteCap(primitive('black', 'v1'), 'light', 88));
  const onPrimaryBorderDisabled = resolve(absoluteCap(primitive('black', 'v1'), 'light', 20));
  const onPrimaryTextDisabled = resolve(absoluteCap(primitive('black', 'v1'), 'light', 38));

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
      activationMotion: 'slow',
      controlTextVisibility: 'largeOnly'
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
                  borderStyle: 'solid'
                },
                scales: {
                  boxWidth: { 's:md:1': 40 },
                  boxHeight: { 's:md:1': 20 },
                  borderWidth: 1,
                  borderRadius: {
                    rounded: 4,
                    pill: 10,
                    square: 0
                  },
                  paddingTop: { 's:md:1': 1 },
                  paddingRight: { 's:md:1': 3 },
                  paddingBottom: { 's:md:1': 1 },
                  paddingLeft: { 's:md:1': 3 }
                },
                palettes: {
                  default: {
                    light: {
                      onSubtle: {
                        boxColor: {
                          neutral: {
                            medium: {
                              rest: white,
                              hover: { ref: white },
                              focus: { ref: white },
                              pressed: { ref: white },
                              selected: {
                                rest: { ref: primary60 },
                                hover: { ref: primary70 },
                                focus: { ref: primary60 },
                                pressed: { ref: primary80 }
                              },
                              disabled: { ref: neutral6 }
                            },
                            low: {
                              rest: onPrimaryTrack,
                              hover: { ref: onPrimaryTrackHover },
                              focus: { ref: onPrimaryTrack },
                              pressed: { ref: onPrimaryTrackPressed },
                              selected: {
                                rest: { ref: white },
                                hover: { ref: white },
                                focus: { ref: white },
                                pressed: { ref: white }
                              },
                              disabled: { ref: onPrimaryTrackDisabled }
                            }
                          },
                          polarity: {
                            medium: {
                              rest: white,
                              selected: {
                                rest: { ref: polarityOnTrack }
                              }
                            },
                            low: {
                              rest: onPrimaryTrack,
                              selected: {
                                rest: { ref: white }
                              }
                            }
                          }
                        },
                        borderColor: {
                          neutral: {
                            medium: {
                              rest: charcoalRest,
                              hover: { ref: charcoalHover },
                              focus: { ref: charcoalRest },
                              pressed: { ref: neutral70 },
                              selected: {
                                rest: { ref: transparent },
                                hover: { ref: transparent },
                                focus: { ref: transparent },
                                pressed: { ref: transparent }
                              },
                              disabled: { ref: disabledStroke }
                            },
                            low: {
                              rest: onPrimaryBorder,
                              hover: { ref: onPrimaryBorderHover },
                              focus: { ref: onPrimaryBorder },
                              pressed: { ref: onPrimaryBorderHover },
                              selected: {
                                rest: { ref: transparent },
                                hover: { ref: transparent },
                                focus: { ref: transparent },
                                pressed: { ref: transparent }
                              },
                              disabled: { ref: onPrimaryBorderDisabled }
                            }
                          },
                          polarity: {
                            medium: {
                              rest: charcoalRest,
                              selected: {
                                rest: { ref: transparent }
                              }
                            },
                            low: {
                              rest: onPrimaryBorder,
                              selected: {
                                rest: { ref: transparent }
                              }
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
                scales: {
                  boxWidth: { 's:md:1': 14 },
                  boxHeight: { 's:md:1': 14 },
                  borderRadius: {
                    rounded: 4,
                    pill: 7,
                    square: 0
                  }
                },
                palettes: {
                  default: {
                    light: {
                      onSubtle: {
                        boxColor: {
                          neutral: {
                            medium: {
                              rest: charcoalRest,
                              hover: { ref: graphite },
                              focus: { ref: charcoalRest },
                              pressed: { ref: graphite },
                              selected: {
                                rest: { ref: white },
                                hover: { ref: white },
                                focus: { ref: white },
                                pressed: { ref: white }
                              },
                              disabled: { ref: neutral25 }
                            },
                            low: {
                              rest: white,
                              hover: { ref: white },
                              focus: { ref: white },
                              pressed: { ref: white },
                              selected: {
                                rest: { ref: primary60 },
                                hover: { ref: primary70 },
                                focus: { ref: primary60 },
                                pressed: { ref: primary80 }
                              },
                              disabled: { ref: onPrimaryTextDisabled }
                            }
                          },
                          polarity: {
                            medium: {
                              rest: polarityOffThumb,
                              selected: {
                                rest: { ref: white }
                              }
                            },
                            low: {
                              rest: white,
                              selected: {
                                rest: { ref: polarityOnTrack }
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
                              },
                              disabled: { ref: transparent }
                            },
                            low: {
                              rest: transparent,
                              selected: {
                                rest: { ref: transparent }
                              },
                              disabled: { ref: transparent }
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
                    }
                  }
                }
              },
              e6: {
                name: 'icon',
                iconSize: { 's:md:1': 's:sm:3' },
                palettes: {
                  default: {
                    light: {
                      onSubtle: {
                        textColor: {
                          neutral: {
                            medium: {
                              rest: white,
                              hover: { ref: white },
                              focus: { ref: white },
                              pressed: { ref: white },
                              selected: {
                                rest: { ref: primary60 },
                                hover: { ref: primary70 },
                                focus: { ref: primary60 },
                                pressed: { ref: primary80 }
                              },
                              disabled: { ref: neutral70 }
                            },
                            low: {
                              rest: primary60,
                              hover: { ref: primary70 },
                              focus: { ref: primary60 },
                              pressed: { ref: primary80 },
                              selected: {
                                rest: { ref: white },
                                hover: { ref: white },
                                focus: { ref: white },
                                pressed: { ref: white }
                              },
                              disabled: { ref: onPrimaryTextDisabled }
                            }
                          },
                          polarity: {
                            medium: {
                              rest: white,
                              selected: {
                                rest: { ref: polarityOnTrack }
                              }
                            },
                            low: {
                              rest: polarityOffThumb,
                              selected: {
                                rest: { ref: white }
                              }
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
                typography: { 's:md:1': 'body-medium' },
                scales: {
                  marginLeft: { 's:md:1': 8 },
                  marginRight: { 's:md:1': 8 }
                },
                palettes: {
                  default: {
                    light: {
                      onSubtle: {
                        textColor: {
                          neutral: {
                            medium: {
                              rest: neutralForeground,
                              disabled: { ref: neutral25 }
                            },
                            low: {
                              rest: white,
                              disabled: { ref: onPrimaryTextDisabled }
                            }
                          },
                          polarity: {
                            medium: {
                              rest: neutralForeground
                            },
                            low: {
                              rest: white
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
                typography: { 's:md:1': 'body-medium' },
                scales: {
                  marginLeft: { 's:md:1': 8 },
                  marginRight: { 's:md:1': 8 }
                },
                palettes: {
                  default: {
                    light: {
                      onSubtle: {
                        textColor: {
                          neutral: {
                            medium: {
                              rest: neutralForeground,
                              disabled: { ref: neutral25 }
                            },
                            low: {
                              rest: white,
                              disabled: { ref: onPrimaryTextDisabled }
                            }
                          },
                          polarity: {
                            medium: {
                              rest: neutralForeground
                            },
                            low: {
                              rest: white
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
