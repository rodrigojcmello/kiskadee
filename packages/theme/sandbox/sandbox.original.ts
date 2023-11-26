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
  components: {
    label: {
      elements: {
        container: {
          dark: {
            default: {
              base: {
                rest: {
                  md: {
                    position: {
                      type: 'absolute',
                    },
                  },
                },
              },
              type: {
                contained: {
                  base: {
                    md: {
                      font: {
                        color: '#FFFFFF',
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
    button: {
      // // TODO: review all options
      // options: {
      //   widthMin: 100,
      //   borderRadius: 'Rounded',
      //   textAlign: {
      //     default: 'center',
      //     center: true,
      //     left: true,
      //     right: true,
      //   },
      //   icon: {
      //     enable: {
      //       right: true,
      //       left: true,
      //     },
      //   },
      //   size: {
      //     md: true,
      //     sm: true,
      //     lg: true,
      //   },
      //   responsive: {
      //     smallScreenBP1: 'md',
      //     mediumScreenBP1: 'sm',
      //   },
      // },
      elements: {
        group: {
          light: {
            default: {
              base: {
                rest: {
                  md: {
                    position: {
                      top: {
                        value: 12,
                        unit: 'px',
                      },
                    },
                    box: {
                      height: {
                        value: 16,
                        unit: 'px',
                      },
                    },
                  },
                  // md: {
                  //   top: '12px',
                  //   height: '16px',
                  // },
                },
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          box: {
                            color: '#745eb0',
                          },
                        },
                        sm: {
                          box: {
                            color: '#d22649',
                            height: {
                              value: 12,
                              unit: 'px',
                            },
                          },
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          box: {
                            color: '#d8cee8',
                            height: {
                              value: 16,
                              unit: 'px',
                            },
                          },
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
                          box: {
                            color: '#f3f1f8',
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
        container: {
          light: {
            default: {
              base: {
                focus: {
                  md: {
                    outline: {
                      color: '#e8def8',
                      style: 'solid',
                      width: {
                        value: 2,
                        unit: 'px',
                      },
                    },
                    // outlineOffset: 0,
                  },
                },
                pressed: {
                  md: {
                    shadow: 'none',
                  },
                },
                disabled: {
                  md: {
                    shadow: 'none',
                    box: {
                      color: '#e4e4e4',
                    },
                  },
                },
                // borderRadiusRounded: {
                //   xl: { borderRadius: '24px' },
                //   lg: { borderRadius: '18px' },
                //   md: { borderRadius: '16px' },
                //   sm: { borderRadius: '10px' },
                // },
                // borderRadiusFull: {
                //   xl: { borderRadius: '48px' },
                //   lg: { borderRadius: '30px' },
                //   md: { borderRadius: '20px' },
                //   sm: { borderRadius: '16px' },
                // },
                // borderRadiusNone: {},
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          box: {
                            color: '#6750a4',
                          },
                          border: {
                            color: '#6750a4',
                            style: 'solid',
                            width: {
                              value: 1,
                              unit: 'px',
                            },
                          },
                        },
                        sm: {
                          box: {
                            color: '#d22649',
                          },
                        },
                      },
                      hover: {
                        md: {
                          box: {
                            color: '#7965af',
                          },
                          border: {
                            color: '#7965af',
                          },
                          // boxShadow:
                          //   '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      focus: {
                        md: {
                          box: {
                            color: '#7965AF',
                          },
                        },
                      },
                      pressed: {
                        md: {
                          box: {
                            color: '#564389',
                          },
                          border: {
                            color: '#564389',
                          },
                        },
                      },
                      disabled: {
                        md: {
                          shadow: 'none',
                          box: {
                            color: '#E4E4E4',
                          },
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          box: {
                            color: '#E8DEF8',
                          },
                          border: {
                            color: '#E8DEF8',
                            style: 'solid',
                            width: {
                              value: 1,
                              unit: 'px',
                            },
                          },
                          // rippleColor: '#6750a480',
                        },
                      },
                      hover: {
                        md: {
                          box: {
                            color: '#D8CEE8',
                          },
                          border: {
                            color: '#D8CEE8',
                          },
                          // boxShadow:
                          //   '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      focus: {
                        md: {
                          box: {
                            color: '#D0C6DF',
                          },
                        },
                      },
                      pressed: {
                        md: {
                          box: {
                            color: '#D0C6DF',
                          },
                          border: {
                            color: '#D0C6DF',
                          },
                        },
                      },
                      disabled: {
                        md: {
                          shadow: 'none',
                          box: {
                            color: '#E4E4E4',
                          },
                        },
                      },
                    },
                    tertiary: {
                      rest: {
                        md: {
                          box: {
                            color: '#F7F2FA',
                          },
                          // rippleColor: '#6750a480',
                          // boxShadow:
                          //   '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      hover: {
                        md: {
                          box: {
                            color: '#E8E0F0',
                          },
                          // boxShadow:
                          //   '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      focus: {
                        md: {
                          box: {
                            color: '#E6DFF0',
                          },
                          // boxShadow:
                          //   '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      pressed: {
                        md: {
                          box: {
                            color: '#E6DFF0',
                          },
                          // boxShadow:
                          //   '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      disabled: {
                        md: {
                          box: {
                            color: '#E4E4E4',
                          },
                          shadow: 'none',
                        },
                      },
                    },
                    instagram: {
                      rest: {
                        md: {
                          // bgColor:
                          //   'linear-gradient(87.1deg, #FFD522 -10.92%, #F1000B 48.02%, #B900B3 106.81%)',
                          // rippleColor: '#ffffff80',
                        },
                      },
                      hover: {
                        md: {
                          // boxShadow:
                          //   '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                        },
                      },
                    },
                  },
                },
                outline: {
                  base: {
                    md: {
                      border: {
                        color: '#79747E',
                        style: 'solid',
                        width: {
                          value: 1,
                          unit: 'px',
                        },
                      },

                      // rippleColor: '#6750a480',
                    },
                  },
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          box: {
                            color: '#FFFFFF',
                          },
                        },
                      },
                      hover: {
                        md: {
                          box: {
                            color: '#F3F1F8',
                          },
                          // borderColor: 'red',
                        },
                      },
                      focus: {
                        md: {
                          box: {
                            color: '#ECEAF4',
                          },
                          border: {
                            color: '#6750A4',
                          },
                        },
                      },
                      pressed: {
                        md: {
                          box: { color: '#ECEAF4' },
                        },
                      },
                      disabled: {
                        md: {
                          box: { color: '#FFFFFF' },
                          border: {
                            // color: '#1f1f1f1f',
                          },
                        },
                      },
                    },
                    danger: {
                      rest: {
                        md: {
                          box: { color: '#FFFFFF' },
                          border: {
                            color: '#ff99c7',
                          },
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
                          // rippleColor: '#6750a480',
                          box: { color: '#FFFFFF' },
                          border: {
                            color: '#FFFFFF',
                            style: 'solid',
                            width: {
                              value: 1,
                              unit: 'px',
                            },
                          },
                        },
                      },
                      hover: {
                        md: {
                          box: { color: '#F3F1F8' },
                        },
                      },
                      focus: {
                        md: {
                          box: { color: '#ECEAF4' },
                        },
                      },
                      pressed: {
                        md: {
                          box: { color: '#ECEAF4' },
                          border: {
                            color: '#dedaec',
                          },
                        },
                      },
                      disabled: {
                        md: {
                          box: { color: '#FFFFFF' },
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
                          box: { color: '#D0BCFF' },
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
                    font: {
                      size: {
                        value: 24,
                        unit: 'px',
                      },
                    },
                    padding: {
                      top: {
                        value: 7,
                        unit: 'px',
                      },
                      right: {
                        value: 7,
                        unit: 'px',
                      },
                      bottom: {
                        value: 7,
                        unit: 'px',
                      },
                      left: {
                        value: 7,
                        unit: 'px',
                      },
                    },
                    // color: '#6750A4',
                  },
                  lg: {
                    padding: {
                      top: {
                        value: 18,
                        unit: 'px',
                      },
                      right: {
                        value: 18,
                        unit: 'px',
                      },
                      bottom: {
                        value: 18,
                        unit: 'px',
                      },
                      left: {
                        value: 18,
                        unit: 'px',
                      },
                    },
                  },
                  sm: {
                    font: {
                      size: {
                        value: 20,
                        unit: 'px',
                      },
                    },
                    padding: {
                      top: {
                        value: 5,
                        unit: 'px',
                      },
                      right: {
                        value: 5,
                        unit: 'px',
                      },
                      bottom: {
                        value: 5,
                        unit: 'px',
                      },
                      left: {
                        value: 5,
                        unit: 'px',
                      },
                    },
                  },
                },
                // iconAlone: {
                //   md: {
                //     color: '#6750A4',
                //   },
                // },
                // iconAttached: {
                //   md: {
                //     marginRight: '4px',
                //   },
                // },
                // borderRadiusRounded: {
                //   md: {
                //     borderTopLeftRadius: '15px',
                //     borderBottomLeftRadius: '15px',
                //   },
                //   sm: {
                //     borderTopLeftRadius: '9px',
                //     borderBottomLeftRadius: '9px',
                //   },
                // },
                // borderRadiusFull: {
                //   xl: { borderRadius: '47px' },
                //   lg: { borderRadius: '29px' },
                //   md: { borderRadius: '19px' },
                //   sm: { borderRadius: '15px' },
                // },
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      // iconDetached: {
                      //   md: {
                      //     bgColor3: '#FFFFFF',
                      //     // color: '#6750A4',
                      //     // borderWidth: 1,
                      //     // borderStyle: 'solid',
                      //     // borderColor: '#6750A4',
                      //   },
                      // },
                    },
                    secondary: {
                      // iconAlone: {
                      //   md: {
                      //     color: '#6750A4',
                      //   },
                      // },
                    },
                    instagram: {
                      // iconDetached: {
                      //   md: {
                      //     color: '#d50060',
                      //     // border: 'none',
                      //     paddingTop: '7px',
                      //     paddingRight: '7px',
                      //     paddingBottom: '7px',
                      //     paddingLeft: '7px',
                      //     marginTop: '1px',
                      //     marginRight: '1px',
                      //     marginBottom: '1px',
                      //     marginLeft: '1px',
                      //     box: {color:'rgb}(255 255 255 / 85%)',
                      //   },
                      // },
                    },
                  },
                },
                outline: {
                  base: {
                    md: {
                      padding: {
                        top: {
                          value: 7,
                          unit: 'px',
                        },
                        right: {
                          value: 7,
                          unit: 'px',
                        },
                        bottom: {
                          value: 7,
                          unit: 'px',
                        },
                        left: {
                          value: 7,
                          unit: 'px',
                        },
                      },
                    },
                    lg: {
                      padding: {
                        top: {
                          value: 17,
                          unit: 'px',
                        },
                        right: {
                          value: 17,
                          unit: 'px',
                        },
                        bottom: {
                          value: 17,
                          unit: 'px',
                        },
                        left: {
                          value: 17,
                          unit: 'px',
                        },
                      },
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
                    font: {
                      size: {
                        value: 16,
                        unit: 'px',
                      },
                    },
                  },
                  md: {
                    font: {
                      size: {
                        value: 24,
                        unit: 'px',
                      },
                    },
                    padding: {
                      top: {
                        value: 7,
                        unit: 'px',
                      },
                      right: {
                        value: 7,
                        unit: 'px',
                      },
                      bottom: {
                        value: 7,
                        unit: 'px',
                      },
                      left: {
                        value: 7,
                        unit: 'px',
                      },
                    },
                  },
                  lg: {
                    padding: {
                      top: {
                        value: 16,
                        unit: 'px',
                      },
                      right: {
                        value: 16,
                        unit: 'px',
                      },
                      bottom: {
                        value: 16,
                        unit: 'px',
                      },
                      left: {
                        value: 16,
                        unit: 'px',
                      },
                    },
                  },
                },
              },
              type: {
                outline: {
                  base: {
                    md: {
                      padding: {
                        top: {
                          value: 7,
                          unit: 'px',
                        },
                        bottom: {
                          value: 7,
                          unit: 'px',
                        },
                        left: {
                          value: 7,
                          unit: 'px',
                        },
                      },
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
                    font: {
                      size: {
                        value: 0.875,
                        unit: 'rem',
                      },
                      height: {
                        value: 1.25,
                        unit: 'rem',
                      },
                      weight: 500,
                      family: 'Roboto',
                      style: 'normal',
                    },
                    padding: {
                      top: {
                        value: 9,
                        unit: 'px',
                      },
                      right: {
                        value: 23,
                        unit: 'px',
                      },
                      bottom: {
                        value: 9,
                        unit: 'px',
                      },
                      left: {
                        value: 23,
                        unit: 'px',
                      },
                    },
                  },
                  sm: {
                    padding: {
                      top: {
                        value: 5,
                        unit: 'px',
                      },
                      right: {
                        value: 15,
                        unit: 'px',
                      },
                      bottom: {
                        value: 5,
                        unit: 'px',
                      },
                      left: {
                        value: 15,
                        unit: 'px',
                      },
                    },
                  },
                  lg: {
                    padding: {
                      top: {
                        value: 17,
                        unit: 'px',
                      },
                      right: {
                        value: 17,
                        unit: 'px',
                      },
                      bottom: {
                        value: 17,
                        unit: 'px',
                      },
                      left: {
                        value: 17,
                        unit: 'px',
                      },
                    },
                  },
                  xl: {
                    font: {
                      size: {
                        value: 2,
                        unit: 'rem',
                      },
                    },
                    padding: {
                      top: {
                        value: 37,
                        unit: 'px',
                      },
                      right: {
                        value: 37,
                        unit: 'px',
                      },
                      bottom: {
                        value: 37,
                        unit: 'px',
                      },
                      left: {
                        value: 37,
                        unit: 'px',
                      },
                    },
                  },
                },
                disabled: {
                  md: {
                    font: {
                      color: '#979798',
                    },
                  },
                },
                // iconDetached: {
                //   md: {
                //     paddingLeft: '16px',
                //     paddingRight: '16px',
                //   },
                // },
                // iconAttached: {
                //   md: {
                //     paddingLeft: '14px',
                //     paddingRight: '14px',
                //   },
                // },
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          font: {
                            color: '#FFFFFF',
                          },
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          font: {
                            color: '#1D192B',
                          },
                        },
                      },
                    },
                    tertiary: {
                      rest: {
                        md: {
                          font: {
                            color: '#6750A4',
                          },
                        },
                      },
                    },
                    instagram: {
                      rest: {
                        md: {
                          font: {
                            color: '#FFFFFF',
                          },
                        },
                      },
                    },
                  },
                },
                outline: {
                  base: {
                    sm: {
                      padding: {
                        top: {
                          value: 5,
                          unit: 'px',
                        },
                        right: {
                          value: 15,
                          unit: 'px',
                        },
                        bottom: {
                          value: 5,
                          unit: 'px',
                        },
                        left: {
                          value: 15,
                          unit: 'px',
                        },
                      },
                    },
                    md: {
                      font: {
                        color: '#6750A4',
                      },
                      padding: {
                        top: {
                          value: 9,
                          unit: 'px',
                        },
                        right: {
                          value: 23,
                          unit: 'px',
                        },
                        bottom: {
                          value: 9,
                          unit: 'px',
                        },
                        left: {
                          value: 23,
                          unit: 'px',
                        },
                      },
                    },
                    lg: {
                      padding: {
                        top: {
                          value: 17,
                          unit: 'px',
                        },
                        right: {
                          value: 17,
                          unit: 'px',
                        },
                        bottom: {
                          value: 17,
                          unit: 'px',
                        },
                        left: {
                          value: 17,
                          unit: 'px',
                        },
                      },
                    },
                    xl: {
                      padding: {
                        top: {
                          value: 37,
                          unit: 'px',
                        },
                        right: {
                          value: 37,
                          unit: 'px',
                        },
                        bottom: {
                          value: 37,
                          unit: 'px',
                        },
                        left: {
                          value: 37,
                          unit: 'px',
                        },
                      },
                    },
                  },
                  variant: {
                    primary: {
                      disabled: {
                        md: {
                          font: {
                            color: '#1b1a1e61',
                          },
                        },
                      },
                    },
                    danger: {
                      rest: {
                        md: {
                          font: {
                            color: '#d50060',
                          },
                        },
                      },
                    },
                  },
                },
                flat: {
                  base: {
                    md: {
                      font: {
                        color: '#6750A4',
                      },
                    },
                  },
                  variant: {
                    primary: {
                      disabled: {
                        md: {
                          font: {
                            color: '#1b1a1e61',
                          },
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
                          font: {
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
  },
};
