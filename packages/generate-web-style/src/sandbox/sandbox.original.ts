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
                      top: 12,
                    },
                    box: {
                      height: 16,
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
                            height: 12,
                          },
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          box: {
                            color: '#d8cee8',
                            height: 16,
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
                      width: 2,
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
                            width: 1,
                          },
                        },
                        sm: {
                          box: {
                            color: '#d22649',
                          },
                          border: 'none',
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
                          shadow: [
                            {
                              x: 0,
                              y: 1,
                              blur: 2,
                              color: {
                                hex: '#000000',
                                alpha: 0.3,
                              },
                            },
                            {
                              x: 0,
                              y: 1,
                              blur: 3,
                              spread: 1,
                              color: {
                                hex: '#000000',
                                alpha: 0.15,
                              },
                            },
                          ],
                        },
                      },
                      focus: {
                        md: {
                          box: {
                            color: '#7965AF',
                          },
                          border: 'none',
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
                            width: 1,
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
                          shadow: [
                            {
                              x: 0,
                              y: 1,
                              blur: 2,
                              color: {
                                hex: '#000000',
                                alpha: 0.3,
                              },
                            },
                            {
                              x: 0,
                              y: 1,
                              blur: 3,
                              spread: 1,
                              color: {
                                hex: '#000000',
                                alpha: 0.15,
                              },
                            },
                          ],
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
                          shadow: [
                            {
                              x: 0,
                              y: 1,
                              blur: 2,
                              color: {
                                hex: '#000000',
                                alpha: 0.3,
                              },
                            },
                            {
                              x: 0,
                              y: 1,
                              blur: 3,
                              spread: 1,
                              color: {
                                hex: '#000000',
                                alpha: 0.15,
                              },
                            },
                          ],
                        },
                      },
                      hover: {
                        md: {
                          box: {
                            color: '#E8E0F0',
                          },
                          shadow: [
                            {
                              x: 0,
                              y: 1,
                              blur: 2,
                              color: {
                                hex: '#000000',
                                alpha: 0.3,
                              },
                            },
                            {
                              x: 0,
                              y: 1,
                              blur: 3,
                              spread: 1,
                              color: {
                                hex: '#000000',
                                alpha: 0.15,
                              },
                            },
                          ],
                        },
                      },
                      focus: {
                        md: {
                          box: {
                            color: '#E6DFF0',
                          },
                          shadow: [
                            {
                              x: 0,
                              y: 1,
                              blur: 2,
                              color: {
                                hex: '#000000',
                                alpha: 0.3,
                              },
                            },
                            {
                              x: 0,
                              y: 1,
                              blur: 3,
                              spread: 1,
                              color: {
                                hex: '#000000',
                                alpha: 0.15,
                              },
                            },
                          ],
                        },
                      },
                      pressed: {
                        md: {
                          box: {
                            color: '#E6DFF0',
                          },
                          shadow: [
                            {
                              x: 0,
                              y: 1,
                              blur: 2,
                              color: {
                                hex: '#000000',
                                alpha: 0.3,
                              },
                            },
                            {
                              x: 0,
                              y: 1,
                              blur: 3,
                              spread: 1,
                              color: {
                                hex: '#000000',
                                alpha: 0.15,
                              },
                            },
                          ],
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
                          shadow: [
                            {
                              x: 0,
                              y: 1,
                              blur: 2,
                              color: {
                                hex: '#000000',
                                alpha: 0.3,
                              },
                            },
                          ],
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
                        width: 1,
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
                          box: {
                            color: '#ECEAF4',
                          },
                        },
                      },
                      disabled: {
                        md: {
                          box: {
                            color: '#FFFFFF',
                          },
                          border: {
                            // color: '#1f1f1f1f',
                          },
                        },
                      },
                    },
                    danger: {
                      rest: {
                        md: {
                          box: {
                            color: '#FFFFFF',
                          },
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
                          box: {
                            color: '#FFFFFF',
                          },
                          border: {
                            color: '#FFFFFF',
                            style: 'solid',
                            width: 1,
                          },
                        },
                      },
                      hover: {
                        md: {
                          box: {
                            color: '#F3F1F8',
                          },
                        },
                      },
                      focus: {
                        md: {
                          box: {
                            color: '#ECEAF4',
                          },
                        },
                      },
                      pressed: {
                        md: {
                          box: {
                            color: '#ECEAF4',
                          },
                          border: {
                            color: '#dedaec',
                          },
                        },
                      },
                      disabled: {
                        md: {
                          box: {
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
          dark: {
            default: {
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          box: {
                            color: '#D0BCFF',
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
        iconLeft: {
          light: {
            default: {
              base: {
                rest: {
                  md: {
                    font: {
                      size: 24,
                    },
                    padding: 7,
                    // color: '#6750A4',
                  },
                  lg: {
                    padding: 18,
                  },
                  sm: {
                    font: {
                      size: 20,
                    },
                    padding: 5,
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
                      // border: 'none',
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
                      padding: 7,
                    },
                    lg: {
                      padding: 17,
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
                      size: 16,
                    },
                  },
                  md: {
                    font: {
                      size: 24,
                    },
                    padding: 7,
                  },
                  lg: {
                    padding: 16,
                  },
                },
              },
              type: {
                outline: {
                  base: {
                    md: {
                      padding: {
                        top: 7,
                        bottom: 7,
                        left: 7,
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
                      weight: 'medium',
                      family: ['Roboto'],
                      style: 'normal',
                    },
                    padding: {
                      top: 9,
                      right: 23,
                      bottom: 9,
                      left: 23,
                    },
                  },
                  sm: {
                    padding: {
                      top: 5,
                      right: 15,
                      bottom: 5,
                      left: 15,
                    },
                  },
                  lg: {
                    padding: 17,
                  },
                  xl: {
                    font: {
                      size: {
                        value: 2,
                        unit: 'rem',
                      },
                    },
                    padding: 37,
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
                        top: 5,
                        right: 15,
                        bottom: 5,
                        left: 15,
                      },
                    },
                    md: {
                      font: {
                        color: '#6750A4',
                      },
                      padding: {
                        top: 9,
                        right: 23,
                        bottom: 9,
                        left: 23,
                      },
                    },
                    lg: {
                      padding: 17,
                    },
                    xl: {
                      padding: 37,
                    },
                  },
                  variant: {
                    primary: {
                      disabled: {
                        md: {
                          font: {
                            // color: '#1b1a1e61',
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
                            // color: '#1b1a1e61',
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
