import type { KiskadeeSchema } from '../theme.types';

export const fluentTheme: KiskadeeSchema = {
  name: 'Fluent',
  author: 'Microsoft',
  version: '2.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      option: {
        widthMin: 100,
        borderRadius: {
          default: 'rounded',
          variant: {
            rounded: {
              md: 4,
            },
          },
        },
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
              },
              type: {
                contained: {
                  variant: {
                    primary: {
                      rest: {
                        md: {
                          backgroundColor: '#005FB8',
                        },
                      },
                      hover: {
                        md: {
                          backgroundColor: '#1A6FBF',
                        },
                      },
                      pressed: {
                        md: {
                          backgroundColor: '#327EC5',
                        },
                      },
                      disabled: {
                        md: {
                          backgroundColor: '#C8C8C8',
                        },
                      },
                    },
                    secondary: {
                      rest: {
                        md: {
                          backgroundColor: '#FFFFFFB2',
                          borderWidth: 1,
                          borderStyle: 'solid',
                          borderColor: '#0000000F',
                        },
                      },
                      hover: {
                        md: {
                          backgroundColor: '#F9F9F980',
                        },
                      },
                      pressed: {
                        md: {
                          backgroundColor: '#F9F9F94D',
                        },
                      },
                      disabled: {
                        md: {
                          backgroundColor: '#F9F9F94D',
                        },
                      },
                      focus: {
                        md: {
                          backgroundColor: '#FFFFFFB2',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        leftIconAttached: {
          light: {
            default: {
              base: {
                rest: {
                  md: {
                    paddingLeft: 8,
                    paddingRight: 8,
                    fontSize: 16,
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
        rightIconAttached: {
          light: {
            default: {
              base: {
                rest: {
                  md: {
                    paddingLeft: 8,
                    paddingRight: 8,
                    fontSize: 16,
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
