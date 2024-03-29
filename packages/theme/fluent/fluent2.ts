import type { KiskadeeTheme } from '@kiskadee/react';

export const fluent2: KiskadeeTheme = {
  name: 'Fluent',
  author: 'Microsoft',
  version: '2.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      options: {
        widthMin: 100,
        borderRadius: 'Rounded',
        textAlign: {
          default: 'center',
          center: true,
          left: true,
        },
        icon: {
          enable: {
            right: true,
          },
        },
      },
      elements: {
        container: {
          light: {
            default: {
              base: {
                focus: {
                  md: {
                    outlineWidth: 2,
                    outlineStyle: 'solid',
                    outlineColor: '#000',
                    outlineOffset: 1,
                  },
                },
                borderRadiusRounded: {
                  md: { borderRadius: 4 },
                },
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          background: '#005FB8',
                        },
                      },
                      hover: {
                        md: {
                          background: '#1A6FBF',
                        },
                      },
                      pressed: {
                        md: {
                          background: '#327EC5',
                        },
                      },
                      disabled: {
                        md: {
                          background: '#C8C8C8',
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          background: '#FFFFFFB2',
                          borderWidth: 1,
                          borderStyle: 'solid',
                          borderLeftColor: '#EBEBEB',
                          borderTopColor: '#EBEBEB',
                          borderRightColor: '#EBEBEB',
                          borderBottomColor: '#D2D2D2',
                        },
                      },
                      hover: {
                        md: {
                          background: '#F9F9F980',
                          borderColor: 'red',
                        },
                      },
                      pressed: {
                        md: {
                          background: '#F9F9F94D',
                        },
                      },
                      disabled: {
                        md: {
                          background: '#F9F9F94D',
                        },
                      },
                      focus: {
                        md: {
                          background: '#FFFFFFB2',
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
        //   light: {
        //     default: {
        //       base: {
        //         rest: {
        //           md: {
        //             paddingLeft: 8,
        //             paddingRight: 8,
        //             fontSize: 16,
        //           },
        //         },
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
                    fontSize: '0.875rem',
                    lineHeight: '20px',
                    fontWeight: 600,
                    fontFamily: 'Segoe UI',
                    fontStyle: 'normal',
                  },
                },
              },
              type: {
                contained: {
                  base: {
                    md: {
                      paddingTop: 4,
                      paddingBottom: 6,
                      paddingLeft: 11,
                      paddingRight: 11,
                    },
                  },
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          color: '#FFFFFF',
                        },
                      },
                      pressed: {
                        md: {
                          color: '#ffffffb3',
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          color: '#000000E4',
                          paddingTop: 3,
                          paddingBottom: 5,
                          paddingLeft: 10,
                          paddingRight: 10,
                        },
                      },
                      disabled: {
                        md: {
                          color: '#0000005C',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // rightIconAttached: {
        //   light: {
        //     default: {
        //       base: {
        //         rest: {
        //           md: {
        //             paddingLeft: 8,
        //             paddingRight: 8,
        //             fontSize: 16,
        //           },
        //         },
        //       },
        //     },
        //   },
        // },
      },
    },
  },
};
