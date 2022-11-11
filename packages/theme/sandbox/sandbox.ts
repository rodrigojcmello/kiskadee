import type { KiskadeeTheme } from '@kiskadee/react';

export const sandbox: KiskadeeTheme = {
  name: 'Sandbox',
  author: 'Kiskadee',
  version: '1.0',
  kiskadeeVersion: '0.0.1',
  // theme: {
  //   light: 'default',
  //   dark: 'default',
  // },
  component: {
    button: {
      option: {
        widthMin: 100,
        borderRadius: 'Rounded',
        textAlign: {
          default: 'center',
          center: true,
          left: true,
          right: true,
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
        responsive: {
          smallScreenBP1: 'md',
          mediumScreenBP1: 'sm',
        },
      },
      elements: {
        container: {
          light: {
            default: {
              base: {
                focus: {
                  md: {
                    outline: 'none',
                  },
                },
                pressed: {
                  md: {
                    boxShadow: 'none',
                  },
                },
                disabled: {
                  md: {
                    boxShadow: 'none',
                    background: '#E4E4E4',
                  },
                },
                borderRadiusRounded: {
                  xl: { borderRadius: 24 },
                  lg: { borderRadius: 18 },
                  md: { borderRadius: 16 },
                  sm: { borderRadius: 10 },
                },
                borderRadiusFull: {
                  xl: { borderRadius: 48 },
                  lg: { borderRadius: 30 },
                  md: { borderRadius: 20 },
                  sm: { borderRadius: 16 },
                },
                borderRadiusNone: {},
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          background: '#6750A4',
                          rippleColor: '#ffffff80',
                        },
                        sm: {
                          background: 'red',
                        },
                      },
                      hover: {
                        md: {
                          background: '#735EAB',
                          boxShadow:
                            '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      focus: {
                        md: {
                          background: '#7965AF',
                        },
                      },
                      pressed: {
                        md: {
                          background: '#7965AF',
                        },
                      },
                      disabled: {
                        md: {
                          boxShadow: 'none',
                          background: '#E4E4E4',
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          background: '#E8DEF8',
                          rippleColor: '#6750a480',
                        },
                      },
                      hover: {
                        md: {
                          background: '#D8CEE8',
                          boxShadow:
                            '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      focus: {
                        md: {
                          background: '#D0C6DF',
                        },
                      },
                      pressed: {
                        md: {
                          background: '#D0C6DF',
                        },
                      },
                      disabled: {
                        md: {
                          boxShadow: 'none',
                          background: '#E4E4E4',
                        },
                      },
                    },
                    tertiary: {
                      rest: {
                        md: {
                          background: '#F7F2FA',
                          rippleColor: '#6750a480',
                          boxShadow:
                            '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      hover: {
                        md: {
                          background: '#E8E0F0',
                          boxShadow:
                            '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      focus: {
                        md: {
                          background: '#E6DFF0',
                          boxShadow:
                            '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      pressed: {
                        md: {
                          background: '#E6DFF0',
                          boxShadow:
                            '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      disabled: {
                        md: {
                          background: '#E4E4E4',
                          boxShadow: 'none',
                        },
                      },
                    },
                    instagram: {
                      rest: {
                        md: {
                          background:
                            'linear-gradient(87.1deg, #FFD522 -10.92%, #F1000B 48.02%, #B900B3 106.81%)',
                          rippleColor: '#ffffff80',
                        },
                      },
                      hover: {
                        md: {
                          boxShadow:
                            '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                    },
                  },
                },
                outline: {
                  base: {
                    md: {
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: '#79747E',
                      rippleColor: '#6750a480',
                    },
                  },
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          background: '#FFFFFF',
                        },
                      },
                      hover: {
                        md: {
                          background: '#F3F1F8',
                        },
                      },
                      focus: {
                        md: {
                          background: '#ECEAF4',
                          borderColor: '#6750A4',
                        },
                      },
                      pressed: {
                        md: {
                          background: '#ECEAF4',
                        },
                      },
                      disabled: {
                        md: {
                          background: '#FFFFFF',
                          borderColor: '#1f1f1f1f',
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
                          rippleColor: '#6750a480',
                          background: '#FFFFFF',
                        },
                      },
                      hover: {
                        md: {
                          background: '#F3F1F8',
                        },
                      },
                      focus: {
                        md: {
                          background: '#ECEAF4',
                        },
                      },
                      pressed: {
                        md: {
                          background: '#ECEAF4',
                        },
                      },
                      disabled: {
                        md: {
                          background: '#FFFFFF',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          dark: {
            default: {
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          background: '#D0BCFF',
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
                    minWidth: 24,
                    width: 24,
                    height: 24,
                    paddingTop: 7,
                    paddingBottom: 7,
                    paddingLeft: 7,
                    paddingRight: 7,
                  },
                  lg: {
                    paddingTop: 18,
                    paddingBottom: 18,
                    paddingLeft: 18,
                    paddingRight: 18,
                  },
                  sm: {
                    fontSize: 20,
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingLeft: 5,
                    paddingRight: 5,
                  },
                },
                iconAlone: {
                  md: {
                    color: '#FFFFFF',
                  },
                },
                iconAttached: {
                  md: {
                    marginRight: 4,
                  },
                },
                iconDetached: {
                  md: {
                    marginLeft: 1,
                    background: '#FFFFFF',
                    color: '#6750A4',
                  },
                },
                borderRadiusRounded: {
                  md: {
                    borderTopLeftRadius: 15,
                    borderBottomLeftRadius: 15,
                  },
                  sm: {
                    borderTopLeftRadius: 9,
                    borderBottomLeftRadius: 9,
                  },
                },
                borderRadiusFull: {
                  md: {
                    borderRadius: 20,
                  },
                },
              },
              type: {
                contained: {
                  variant: {
                    instagram: {
                      iconDetached: {
                        md: {
                          color: '#d50060',
                        },
                      },
                    },
                  },
                },
                outline: {
                  base: {
                    md: {
                      paddingTop: 7,
                      paddingBottom: 7,
                      paddingLeft: 7,
                      paddingRight: 7,
                    },
                    lg: {
                      paddingTop: 17,
                      paddingBottom: 17,
                      paddingLeft: 17,
                      paddingRight: 17,
                    },
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
                  sm: {
                    fontSize: 16,
                  },
                  md: {
                    fontSize: 24,
                    paddingTop: 8,
                    paddingBottom: 8,
                    paddingLeft: 8,
                    paddingRight: 8,
                  },
                  lg: {
                    paddingTop: 16,
                    paddingBottom: 16,
                    paddingLeft: 16,
                    paddingRight: 16,
                  },
                },
              },
              type: {
                outline: {
                  base: {
                    md: {
                      paddingTop: 7,
                      paddingBottom: 7,
                      paddingLeft: 7,
                    },
                  },
                },
              },
            },
          },
        },
        text: {
          light: {
            default: {
              base: {
                rest: {
                  md: {
                    fontSize: '0.875rem',
                    lineHeight: '20px',
                    fontWeight: 500,
                    fontFamily: 'Roboto',
                    fontStyle: 'normal',
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 24,
                    paddingRight: 24,
                  },
                  sm: {
                    paddingTop: 6,
                    paddingBottom: 6,
                    paddingLeft: 16,
                    paddingRight: 16,
                  },
                  lg: {
                    paddingTop: 18,
                    paddingBottom: 18,
                    paddingLeft: 18,
                    paddingRight: 18,
                  },
                  xl: {
                    fontSize: '2rem',
                    paddingTop: 38,
                    paddingBottom: 38,
                    paddingLeft: 38,
                    paddingRight: 38,
                  },
                },
                disabled: {
                  md: {
                    color: '#979798',
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
                          color: '#1D192B',
                        },
                      },
                    },
                    tertiary: {
                      rest: {
                        md: {
                          color: '#6750A4',
                        },
                      },
                    },
                    instagram: {
                      rest: {
                        md: {
                          color: '#FFFFFF',
                        },
                      },
                    },
                  },
                },
                outline: {
                  base: {
                    sm: {
                      paddingTop: 5,
                      paddingBottom: 5,
                      paddingLeft: 15,
                      paddingRight: 15,
                    },
                    md: {
                      color: '#6750A4',
                      paddingTop: 9,
                      paddingBottom: 9,
                      paddingLeft: 23,
                      paddingRight: 23,
                    },
                    lg: {
                      paddingTop: 17,
                      paddingBottom: 17,
                      paddingLeft: 17,
                      paddingRight: 17,
                    },
                    xl: {
                      paddingTop: 37,
                      paddingBottom: 37,
                      paddingLeft: 37,
                      paddingRight: 37,
                    },
                  },
                  variant: {
                    primary: {
                      disabled: {
                        md: {
                          color: '#1b1a1e61',
                        },
                      },
                    },
                  },
                },
                flat: {
                  base: {
                    md: {
                      color: '#6750A4',
                    },
                  },
                  variant: {
                    primary: {
                      disabled: {
                        md: {
                          color: '#1b1a1e61',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          dark: {
            default: {
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          color: '#381E72',
                        },
                      },
                    },
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
