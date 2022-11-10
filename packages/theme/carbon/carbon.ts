import type { KiskadeeTheme } from '@kiskadee/react';

export const carbon: KiskadeeTheme = {
  name: 'Carbon',
  author: 'IBM',
  version: '0.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      option: {
        widthMin: 100,
        borderRadius: 'None',
        textAlign: {
          default: 'left',
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
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          background: '#0F62FE',
                        },
                      },
                      hover: {
                        md: {
                          background: '#0353E9 ',
                        },
                      },
                      focus: {
                        md: {
                          outlineWidth: 1,
                          outlineColor: '#ffffff',
                          outlineStyle: 'solid',
                          outlineOffset: -3,
                        },
                      },
                      pressed: {
                        md: {
                          background: '#002D9C',
                        },
                      },
                      disabled: {
                        md: {
                          background: '#E4E4E4',
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          background: '#393939',
                        },
                      },
                      hover: {
                        md: {
                          background: '#474747',
                        },
                      },
                      focus: {
                        md: {
                          outlineWidth: 1,
                          outlineColor: '#ffffff',
                          outlineStyle: 'solid',
                          outlineOffset: -3,
                        },
                      },
                      pressed: {
                        md: {
                          background: '#6f6f6f',
                        },
                      },
                      disabled: {
                        md: {
                          background: '#E4E4E4',
                        },
                      },
                    },
                    danger: {
                      rest: {
                        md: {
                          background: '#da1e28',
                        },
                      },
                      hover: {
                        md: {
                          background: '#b81922',
                        },
                      },
                      focus: {
                        md: {
                          outlineWidth: 1,
                          outlineColor: '#ffffff',
                          outlineStyle: 'solid',
                          outlineOffset: -3,
                        },
                      },
                      pressed: {
                        md: {
                          background: '#750e13',
                        },
                      },
                      disabled: {
                        md: {
                          background: '#E4E4E4',
                        },
                      },
                    },
                  },
                },
                outline: {
                  base: {
                    md: {
                      borderWidth: 1,
                      borderStyle: 'solid',
                    },
                  },
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          background: '#ffffff',
                          borderColor: '#0F62FE',
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
                    fontSize: '1rem',
                    lineHeight: '1.375rem',
                    fontWeight: 400,
                    fontFamily: 'IBM Plex Sans',
                    fontStyle: 'normal',
                    paddingTop: 13,
                    paddingBottom: 13,
                    paddingLeft: 16,
                    paddingRight: 64,
                  },
                },
                disabled: {
                  md: {
                    color: '#8d8d8d',
                  },
                },
              },
              type: {
                contained: {
                  base: {
                    md: {
                      color: '#FFFFFF',
                    },
                  },
                },
                outline: {
                  base: {
                    md: {
                      paddingTop: 12,
                      paddingBottom: 12,
                      paddingLeft: 15,
                      paddingRight: 63,
                    },
                  },
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          color: '#0F62FE',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // rightIconDetached: {
        //   light: {
        //     default: {
        //       base: {
        //         rest: {
        //           md: {
        //             fontSize: 16,
        //             paddingRight: 16,
        //             paddingLeft: 16,
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
