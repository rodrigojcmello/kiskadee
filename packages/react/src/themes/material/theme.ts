import type { KiskadeeSchema } from '../theme.types';

export const materialTheme: KiskadeeSchema = {
  name: 'Material',
  author: 'Google',
  version: '3.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      option: {
        widthMin: 100,
        borderRadius: {
          default: 'rounded',
          variant: {
            rounded: { xl: 24, lg: 18, md: 16, sm: 12 },
            full: { xl: 48, lg: 30, md: 20, sm: 16 },
          },
          none: 0,
        },
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
        responsive: {
          smallScreenBP1: 'md',
          // mediumScreenBP1: 'sm',
        },
      },
      elements: {
        container: {
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
          },
          type: {
            contained: {
              variant: {
                primary: {
                  rest: {
                    md: {
                      backgroundColor: '#6750A4',
                    },
                    sm: {
                      backgroundColor: 'red',
                    },
                  },
                  hover: {
                    md: {
                      backgroundColor: '#735EAB',
                      boxShadow:
                        '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                    },
                  },
                  focus: {
                    md: {
                      backgroundColor: '#7965AF',
                    },
                  },
                  pressed: {
                    md: {
                      backgroundColor: '#7965AF',
                    },
                  },
                  disabled: {
                    md: {
                      boxShadow: 'none',
                      backgroundColor: '#E4E4E4',
                    },
                  },
                },
                secondary: {
                  rest: {
                    md: {
                      backgroundColor: '#E8DEF8',
                    },
                  },
                  hover: {
                    md: {
                      backgroundColor: '#D8CEE8',
                      boxShadow:
                        '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                    },
                  },
                  focus: {
                    md: {
                      backgroundColor: '#D0C6DF',
                    },
                  },
                  pressed: {
                    md: {
                      backgroundColor: '#D0C6DF',
                    },
                  },
                  disabled: {
                    md: {
                      boxShadow: 'none',
                      backgroundColor: '#E4E4E4',
                    },
                  },
                },
                tertiary: {
                  rest: {
                    md: {
                      backgroundColor: '#F7F2FA',
                      boxShadow:
                        '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                    },
                  },
                  hover: {
                    md: {
                      backgroundColor: '#E8E0F0',
                      boxShadow:
                        '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
                    },
                  },
                  focus: {
                    md: {
                      backgroundColor: '#E6DFF0',
                      boxShadow:
                        '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                    },
                  },
                  pressed: {
                    md: {
                      backgroundColor: '#E6DFF0',
                      boxShadow:
                        '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                    },
                  },
                  disabled: {
                    md: {
                      backgroundColor: '#E4E4E4',
                      boxShadow: 'none',
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
                },
              },
              variant: {
                primary: {
                  rest: {
                    md: {
                      backgroundColor: '#FFFFFF',
                    },
                  },
                  hover: {
                    md: {
                      backgroundColor: '#F3F1F8',
                    },
                  },
                  focus: {
                    md: {
                      backgroundColor: '#ECEAF4',
                      borderColor: '#6750A4',
                    },
                  },
                  pressed: {
                    md: {
                      backgroundColor: '#ECEAF4',
                    },
                  },
                  disabled: {
                    md: {
                      backgroundColor: '#FFFFFF',
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
                      backgroundColor: '#FFFFFF',
                    },
                  },
                  hover: {
                    md: {
                      backgroundColor: '#F3F1F8',
                    },
                  },
                  focus: {
                    md: {
                      backgroundColor: '#ECEAF4',
                    },
                  },
                  pressed: {
                    md: {
                      backgroundColor: '#ECEAF4',
                    },
                  },
                  disabled: {
                    md: {
                      backgroundColor: '#FFFFFF',
                    },
                  },
                },
              },
            },
          },
        },
        iconAlone: {
          base: {
            rest: {
              md: {
                fontSize: 24,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 8,
                paddingRight: 8,
              },
              lg: {
                paddingTop: 18,
                paddingBottom: 18,
                paddingLeft: 18,
                paddingRight: 18,
              },
              sm: {
                fontSize: 16,
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
        leftIconAttached: {
          base: {
            rest: {
              md: {
                fontSize: 24,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 8,
                paddingRight: 8,
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
        leftIconDetached: {
          base: {
            rest: {
              lg: {
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 16,
                paddingRight: 0,
              },
              md: {
                fontSize: 24,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 8,
                paddingRight: 8,
              },
              sm: {
                fontSize: 16,
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
        rightIconAttached: {
          base: {
            rest: {
              md: {
                fontSize: 24,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 8,
                paddingRight: 8,
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
        rightIconDetached: {
          base: {
            rest: {
              md: {
                fontSize: 24,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 8,
                paddingRight: 8,
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
        text: {
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
                paddingTop: 38,
                paddingBottom: 38,
                paddingLeft: 38,
                paddingRight: 38,
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
                  disabled: {
                    md: {
                      color: '#1b1a1e61',
                    },
                  },
                },
                secondary: {
                  rest: {
                    md: {
                      color: '#1D192B',
                    },
                  },
                  disabled: {
                    md: {
                      color: '#1b1a1e61',
                    },
                  },
                },
                tertiary: {
                  rest: {
                    md: {
                      color: '#6750A4',
                    },
                  },
                  disabled: {
                    md: {
                      color: '#1b1a1e61',
                    },
                  },
                },
              },
            },
            outline: {
              base: {
                md: {
                  color: '#6750A4',
                  paddingTop: 9,
                  paddingBottom: 9,
                  paddingLeft: 23,
                  paddingRight: 23,
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
    },
  },
};
