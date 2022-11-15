import type { KiskadeeTheme } from '@kiskadee/react';

export const ios15: KiskadeeTheme = {
  name: 'iOs',
  author: 'Apple',
  version: '15.2',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      option: {
        borderRadius: 'Rounded',
        widthMin: 100,
        textAlign: {
          default: 'center',
          center: true,
        },
        icon: {
          enable: {
            right: true,
            left: true,
          },
        },
        size: {
          md: true,
          sm: true,
          lg: true,
        },
      },
      elements: {
        container: {
          light: {
            default: {
              base: {
                disabled: {
                  md: {
                    background: '#74748114',
                  },
                },
                borderRadiusRounded: {
                  md: { borderRadius: 10 },
                  sm: { borderRadius: 8 },
                },
                borderRadiusFull: {
                  md: { borderRadius: 25 },
                  sm: { borderRadius: 18 },
                },
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          background: '#007AFF',
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          background: '#E1EBFE',
                        },
                      },
                    },
                    tertiary: {
                      rest: {
                        md: {
                          background: '#76767F1E',
                        },
                      },
                    },
                  },
                },
                flat: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          background: 'none',
                        },
                      },
                      disabled: {
                        md: {
                          background: 'none',
                        },
                      },
                    },
                    danger: {
                      rest: {
                        md: {
                          background: 'none',
                        },
                      },
                      disabled: {
                        md: {
                          background: 'none',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // leftIconAttached: {
        //   base: {
        //     rest: {
        //       md: {
        //         fontSize: 24,
        //         paddingRight: 8,
        //         paddingLeft: 16,
        //       },
        //     },
        //   },
        // },
        // leftIconDetached: {
        //   base: {
        //     rest: {
        //       md: {
        //         fontSize: 24,
        //         paddingRight: 8,
        //         paddingLeft: 16,
        //       },
        //     },
        //   },
        // },
        // rightIconAttached: {
        //   base: {
        //     rest: {
        //       md: {
        //         fontSize: 24,
        //         paddingRight: 8,
        //         paddingLeft: 16,
        //       },
        //     },
        //   },
        // },
        // rightIconDetached: {
        //   base: {
        //     rest: {
        //       md: {
        //         fontSize: 24,
        //         paddingRight: 8,
        //         paddingLeft: 16,
        //       },
        //     },
        //   },
        // },
        text: {
          light: {
            default: {
              base: {
                rest: {
                  md: {
                    fontSize: '1.0625rem',
                    lineHeight: '22px',
                    fontWeight: 600,
                    fontFamily: 'SF Pro Text',
                    fontStyle: 'normal',
                    paddingTop: 14,
                    paddingBottom: 14,
                    paddingLeft: 20,
                    paddingRight: 20,
                  },
                  sm: {
                    paddingTop: 7,
                    paddingBottom: 7,
                    paddingLeft: 10,
                    paddingRight: 10,
                  },
                  lg: {
                    paddingTop: 28,
                    paddingBottom: 28,
                    paddingLeft: 40,
                    paddingRight: 40,
                  },
                },
                disabled: {
                  md: {
                    color: '#3c3c444d',
                  },
                },
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          color: '#FFFFFF',
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          color: '#307DF6',
                        },
                      },
                    },
                    tertiary: {
                      rest: {
                        md: {
                          color: '#307DF6',
                        },
                      },
                    },
                  },
                },
                flat: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          color: '#307DF6',
                        },
                      },
                      disabled: {
                        md: {
                          color: '#0000004d',
                        },
                      },
                    },
                    danger: {
                      rest: {
                        md: {
                          color: '#EB4C3B',
                        },
                      },
                      disabled: {
                        md: {
                          color: '#0000004d',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        iconLeft: {
          light: {
            default: {
              base: {
                rest: {
                  md: {
                    fontSize: 24,
                    paddingTop: 13,
                    paddingBottom: 13,
                    paddingLeft: 13,
                    paddingRight: 13,
                  },
                },
              },
            },
          },
        },
        iconRight: {
          light: {
            default: {
              base: {
                rest: {
                  md: {
                    fontSize: 24,
                    paddingTop: 13,
                    paddingBottom: 13,
                    paddingLeft: 13,
                    paddingRight: 13,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
