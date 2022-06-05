import type { KiskadeeSchema } from '../theme.types';

export const materialTheme: KiskadeeSchema = {
  name: 'Material',
  author: 'Google',
  version: '3.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        option: {
          widthMin: '100px',
          borderRadius: {
            default: 20,
            rounded: 16,
            full: 20,
            none: 0,
          },
          textAlign: {
            default: 'center',
            center: true,
          },
        },
        base: {
          rest: {
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 24,
            paddingRight: 24,
          },
          focus: {
            outline: 'none',
          },
          pressed: {
            boxShadow: 'none',
          },
        },
        type: {
          contained: {
            variant: {
              primary: {
                rest: {
                  backgroundColor: '#6750A4',
                },
                hover: {
                  backgroundColor: '#735EAB',
                  boxShadow:
                    '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                },
                focus: {
                  backgroundColor: '#7965AF',
                },
                pressed: {
                  backgroundColor: '#7965AF',
                },
                disabled: {
                  boxShadow: 'none',
                  backgroundColor: '#E4E4E4',
                },
              },
              secondary: {
                rest: {
                  backgroundColor: '#E8DEF8',
                },
                hover: {
                  backgroundColor: '#D8CEE8',
                  boxShadow:
                    '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                },
                focus: {
                  backgroundColor: '#D0C6DF',
                },
                pressed: {
                  backgroundColor: '#D0C6DF',
                },
                disabled: {
                  boxShadow: 'none',
                  backgroundColor: '#E4E4E4',
                },
              },
              tertiary: {
                rest: {
                  backgroundColor: '#F7F2FA',
                  boxShadow:
                    '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                },
                hover: {
                  backgroundColor: '#E8E0F0',
                  boxShadow:
                    '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
                },
                focus: {
                  backgroundColor: '#E6DFF0',
                  boxShadow:
                    '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                },
                pressed: {
                  backgroundColor: '#E6DFF0',
                  boxShadow:
                    '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
                },
                disabled: {
                  backgroundColor: '#E4E4E4',
                  boxShadow: 'none',
                },
              },
            },
          },
          outline: {
            base: {
              paddingTop: 9,
              paddingBottom: 9,
              paddingLeft: 23,
              paddingRight: 23,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#79747E',
            },
            variant: {
              primary: {
                rest: {
                  backgroundColor: '#FFFFFF',
                },
                hover: {
                  backgroundColor: '#F3F1F8',
                },
                focus: {
                  backgroundColor: '#ECEAF4',
                  borderColor: '#6750A4',
                },
                pressed: {
                  backgroundColor: '#ECEAF4',
                },
                disabled: {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#1f1f1f1f',
                },
              },
            },
          },
          flat: {
            variant: {
              primary: {
                rest: {
                  backgroundColor: '#FFFFFF',
                },
                hover: {
                  backgroundColor: '#F3F1F8',
                },
                focus: {
                  backgroundColor: '#ECEAF4',
                },
                pressed: {
                  backgroundColor: '#ECEAF4',
                },
                disabled: {
                  backgroundColor: '#FFFFFF',
                },
              },
            },
          },
        },
      },
      text: {
        base: {
          rest: {
            fontSize: '0.875rem',
            lineHeight: '20px',
            fontWeight: 500,
            fontFamily: 'Roboto',
            fontStyle: 'normal',
          },
        },
        type: {
          contained: {
            variant: {
              primary: {
                rest: {
                  color: '#FFFFFF',
                },
                disabled: {
                  color: '#1b1a1e61',
                },
              },
              secondary: {
                rest: {
                  color: '#1D192B',
                },
                disabled: {
                  color: '#1b1a1e61',
                },
              },
              tertiary: {
                rest: {
                  color: '#6750A4',
                },
                disabled: {
                  color: '#1b1a1e61',
                },
              },
            },
          },
          outline: {
            base: {
              color: '#6750A4',
            },
            variant: {
              primary: {
                disabled: {
                  color: '#1b1a1e61',
                },
              },
            },
          },
          flat: {
            base: {
              color: '#6750A4',
            },
            variant: {
              primary: {
                disabled: {
                  color: '#1b1a1e61',
                },
              },
            },
          },
        },
      },
    },
  },
};
