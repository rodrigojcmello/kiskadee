import type { KiskadeeSchema } from '../theme.types';

export const materialTheme: KiskadeeSchema = {
  name: 'Material',
  author: 'Google',
  version: '3.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        base: {
          rest: {
            borderRadius: '20px',
            textAlign: 'center',
            padding: '10px 24px',
          },
          focus: {
            outline: 'none',
          },
          pressed: {
            boxShadow: 'none',
          },
        },
        option: {
          widthMin: '100px',
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
            },
          },
          outline: {
            base: {
              padding: '9px 23px',
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
            base: {
              color: '#FFFFFF',
            },
            variant: {
              primary: {
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
