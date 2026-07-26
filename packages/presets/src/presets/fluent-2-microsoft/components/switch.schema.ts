import { type Schema, type SolidColor, withAlpha } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SwitchComponent = NonNullable<Schema<never>['components']['switch']>;
type Fluent2MicrosoftSegmentName = 'default';

type CreateFluent2MicrosoftSwitchSchemaArgs = {
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
};

function fluentSwitchColorWithAlpha(color: SolidColor, visibility: number): SolidColor {
  const alphaColor = withAlpha(color, visibility);
  if (alphaColor === undefined) {
    throw new Error('Expected Fluent switch color before applying transparent alpha.');
  }
  return alphaColor;
}

export function createFluent2MicrosoftSwitchSchema({
  c
}: CreateFluent2MicrosoftSwitchSchemaArgs): SwitchComponent {
  const white = c('default', 'l', 'switch.neutral', 0);
  const transparent = withAlpha(c('default', 'l', 'switch.neutral', 100), 0);
  const neutral6 = c('default', 'l', 'switch.neutral', 6);
  const neutral25 = c('default', 'l', 'switch.neutral', 26);
  const neutral70 = c('default', 'l', 'switch.neutral', 70);
  const primary60 = c('default', 'l', 'primary', 60);
  const primary70 = c('default', 'l', 'primary', 70);
  const primary80 = c('default', 'l', 'primary', 80);
  const polarityOffThumb = '#c50f1f';
  const polarityOnTrack = '#107c10';
  const onPrimaryTrack = fluentSwitchColorWithAlpha(white, 28);
  const onPrimaryTrackHover = fluentSwitchColorWithAlpha(white, 36);
  const onPrimaryTrackPressed = fluentSwitchColorWithAlpha(white, 44);
  const onPrimaryTrackDisabled = fluentSwitchColorWithAlpha(white, 12);
  const onPrimaryBorder = fluentSwitchColorWithAlpha(white, 72);
  const onPrimaryBorderHover = fluentSwitchColorWithAlpha(white, 88);
  const onPrimaryBorderDisabled = fluentSwitchColorWithAlpha(white, 20);
  const onPrimaryTextDisabled = fluentSwitchColorWithAlpha(white, 38);

  if (transparent === undefined) {
    throw new Error('Expected Fluent switch.neutral tone 100 before applying transparent alpha.');
  }

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
                              rest: '#616161', // cinza carvão (tom escuro)
                              hover: { ref: '#575757' }, // cinza carvão (tom muito escuro)
                              focus: { ref: '#616161' }, // cinza carvão (tom escuro)
                              pressed: { ref: neutral70 },
                              selected: {
                                rest: { ref: transparent },
                                hover: { ref: transparent },
                                focus: { ref: transparent },
                                pressed: { ref: transparent }
                              },
                              disabled: { ref: '#d1d1d1' } // cinza claro
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
                              rest: '#616161',
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
                              rest: '#616161', // cinza carvão (tom escuro)
                              hover: { ref: '#424242' }, // cinza grafite (tom bem escuro)
                              focus: { ref: '#616161' }, // cinza carvão (tom escuro)
                              pressed: { ref: '#424242' }, // cinza grafite (tom bem escuro)
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
                scales: {
                  boxWidth: { 's:md:1': 10 },
                  boxHeight: { 's:md:1': 10 }
                },
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
                decorations: {
                  textFont: 'body',
                  textWeight: 'normal'
                },
                scales: {
                  textSize: { 's:md:1': 14 },
                  textHeight: { 's:md:1': 20 },
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
                              rest: '#242424', // preto acinzentado (quase preto)
                              disabled: { ref: neutral25 }
                            },
                            low: {
                              rest: white,
                              disabled: { ref: onPrimaryTextDisabled }
                            }
                          },
                          polarity: {
                            medium: {
                              rest: '#242424' // preto acinzentado (quase preto)
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
                decorations: {
                  textFont: 'body',
                  textWeight: 'normal'
                },
                scales: {
                  textSize: { 's:md:1': 14 },
                  textHeight: { 's:md:1': 20 },
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
                              rest: '#242424',
                              disabled: { ref: neutral25 }
                            },
                            low: {
                              rest: white,
                              disabled: { ref: onPrimaryTextDisabled }
                            }
                          },
                          polarity: {
                            medium: {
                              rest: '#242424'
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
