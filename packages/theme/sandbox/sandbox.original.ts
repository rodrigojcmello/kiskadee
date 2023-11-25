/* eslint-disable max-lines */
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
      // TODO: review all options
      options: {
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
        group: {
          light: {
            default: {
              base: {
                rest: {
                  md: {
                    top: '12px',
                    height: '16px',
                  },
                },
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          background: '#745eb0',
                        },
                        sm: {
                          background: 'red',
                          height: '12px',
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          background: '#d8cee8',
                          height: '16px',
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
                          background: '#f3f1f8',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        container: {
          light: {
            default: {
              base: {
                focus: {
                  md: {
                    outlineWidth: '2px',
                    outlineColor: '#e8def8',
                    outlineStyle: 'solid',
                    // outlineOffset: 0,
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
                  xl: { borderRadius: '24px' },
                  lg: { borderRadius: '18px' },
                  md: { borderRadius: '16px' },
                  sm: { borderRadius: '10px' },
                },
                borderRadiusFull: {
                  xl: { borderRadius: '48px' },
                  lg: { borderRadius: '30px' },
                  md: { borderRadius: '20px' },
                  sm: { borderRadius: '16px' },
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
                          borderWidth: '1px',
                          borderColor: '#6750A4',
                          borderStyle: 'solid',
                        },
                        sm: {
                          background: 'red',
                        },
                      },
                      hover: {
                        md: {
                          background: '#735EAB',
                          borderColor: '#735EAB',
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
                          background: '#5c4893',
                          borderColor: '#564389',
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
                          borderWidth: '1px',
                          borderColor: '#E8DEF8',
                          borderStyle: 'solid',
                          rippleColor: '#6750a480',
                        },
                      },
                      hover: {
                        md: {
                          background: '#D8CEE8',
                          borderColor: '#D8CEE8',
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
                          borderColor: '#c4b7d7',
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
                          // borderColor: 'red',
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
                    danger: {
                      rest: {
                        md: {
                          background: '#FFFFFF',
                          borderColor: '#ff99c7',
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
                          borderWidth: '1px',
                          borderColor: '#FFFFFF',
                          borderStyle: 'solid',
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
                          borderColor: '#dedaec',
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
                    fontSize: '24px',
                    paddingTop: '7px',
                    paddingBottom: '7px',
                    paddingLeft: '7px',
                    paddingRight: '7px',
                    // color: '#6750A4',
                  },
                  lg: {
                    paddingTop: '18px',
                    paddingBottom: '18px',
                    paddingLeft: '18px',
                    paddingRight: '18px',
                  },
                  sm: {
                    fontSize: '20px',
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    paddingLeft: '5px',
                    paddingRight: '5px',
                  },
                },
                // iconAlone: {
                //   md: {
                //     color: '#6750A4',
                //   },
                // },
                iconAttached: {
                  md: {
                    marginRight: '4px',
                  },
                },
                borderRadiusRounded: {
                  md: {
                    borderTopLeftRadius: '15px',
                    borderBottomLeftRadius: '15px',
                  },
                  sm: {
                    borderTopLeftRadius: '9px',
                    borderBottomLeftRadius: '9px',
                  },
                },
                borderRadiusFull: {
                  xl: { borderRadius: '47px' },
                  lg: { borderRadius: '29px' },
                  md: { borderRadius: '19px' },
                  sm: { borderRadius: '15px' },
                },
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      iconDetached: {
                        md: {
                          background: '#FFFFFF',
                          color: '#6750A4',
                          // borderWidth: 1,
                          // borderStyle: 'solid',
                          // borderColor: '#6750A4',
                        },
                      },
                    },
                    secondary: {
                      iconAlone: {
                        md: {
                          color: '#6750A4',
                        },
                      },
                    },
                    instagram: {
                      iconDetached: {
                        md: {
                          color: '#d50060',
                          border: 'none',
                          padding22222222222222222222: '7px',
                          margin: '1px',
                          background: 'rgb(255 255 255 / 85%)',
                        },
                      },
                    },
                  },
                },
                outline: {
                  base: {
                    md: {
                      paddingTop: '7px',
                      paddingBottom: '7px',
                      paddingLeft: '7px',
                      paddingRight: '7px',
                    },
                    lg: {
                      paddingTop: '17px',
                      paddingBottom: '17px',
                      paddingLeft: '17px',
                      paddingRight: '17px',
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
                    fontSize: '16px',
                  },
                  md: {
                    fontSize: '24px',
                    padding: '7px',
                  },
                  lg: {
                    padding: '16px',
                  },
                },
              },
              type: {
                outline: {
                  base: {
                    md: {
                      paddingTop: '7px',
                      paddingBottom: '7px',
                      paddingLeft: '7px',
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
                    fontWeight: '500',
                    fontFamily: 'Roboto',
                    fontStyle: 'normal',
                    paddingTop: '9px',
                    paddingBottom: '9px',
                    paddingLeft: '23px',
                    paddingRight: '23px',
                  },
                  sm: {
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    paddingLeft: '15px',
                    paddingRight: '15px',
                  },
                  lg: {
                    paddingTop: '17px',
                    paddingBottom: '17px',
                    paddingLeft: '17px',
                    paddingRight: '17px',
                  },
                  xl: {
                    fontSize: '2rem',
                    paddingTop: '37px',
                    paddingBottom: '37px',
                    paddingLeft: '37px',
                    paddingRight: '37px',
                  },
                },
                disabled: {
                  md: {
                    color: '#979798',
                  },
                },
                iconDetached: {
                  md: {
                    paddingLeft: '16px',
                    paddingRight: '16px',
                  },
                },
                iconAttached: {
                  md: {
                    paddingLeft: '14px',
                    paddingRight: '14px',
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
                      paddingTop: '5px',
                      paddingBottom: '5px',
                      paddingLeft: '15px',
                      paddingRight: '15px',
                    },
                    md: {
                      color: '#6750A4',
                      paddingTop: '9px',
                      paddingBottom: '9px',
                      paddingLeft: '23px',
                      paddingRight: '23px',
                    },
                    lg: {
                      paddingTop: '17px',
                      paddingBottom: '17px',
                      paddingLeft: '17px',
                      paddingRight: '17px',
                    },
                    xl: {
                      paddingTop: '37px',
                      paddingBottom: '37px',
                      paddingLeft: '37px',
                      paddingRight: '37px',
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
                    danger: {
                      rest: {
                        md: {
                          color: '#d50060',
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
