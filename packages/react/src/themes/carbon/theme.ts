import type { KiskadeeSchema } from '../theme.types';

export const carbonTheme: KiskadeeSchema = {
  name: 'Carbon',
  author: 'IBM',
  version: '0.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        option: {
          widthMin: '100px',
        },
        base: {
          rest: {
            textAlign: 'left',
            padding: '13px 64px 13px 16px',
          },
        },
        type: {
          contained: {
            variant: {
              primary: {
                rest: {
                  backgroundColor: '#0F62FE',
                },
                hover: {
                  backgroundColor: '#0353E9 ',
                },
                focus: {
                  outline: '1px solid #ffffff',
                  outlineOffset: '-3px',
                },
                pressed: {
                  backgroundColor: '#002D9C',
                },
                disabled: {
                  backgroundColor: '#E4E4E4',
                },
              },
              secondary: {
                rest: {
                  backgroundColor: '#393939',
                },
                hover: {
                  backgroundColor: '#474747',
                },
                focus: {
                  outline: '1px solid #ffffff',
                  outlineOffset: '-3px',
                },
                pressed: {
                  backgroundColor: '#6f6f6f',
                },
                disabled: {
                  backgroundColor: '#E4E4E4',
                },
              },
              danger: {
                rest: {
                  backgroundColor: '#da1e28',
                },
                hover: {
                  backgroundColor: '#b81922',
                },
                focus: {
                  outline: '1px solid #ffffff',
                  outlineOffset: '-3px',
                },
                pressed: {
                  backgroundColor: '#750e13',
                },
                disabled: {
                  backgroundColor: '#E4E4E4',
                },
              },
            },
          },
          outline: {
            base: {
              borderWidth: '1px',
              borderStyle: 'solid',
              padding: '12px 63px 12px 15px',
            },
            variant: {
              primary: {
                rest: {
                  backgroundColor: '#ffffff',
                  borderColor: '#0F62FE',
                },
              },
            },
          },
        },
      },
      text: {
        base: {
          rest: {
            fontSize: '1rem',
            lineHeight: '1.375rem',
            fontWeight: 400,
            fontFamily: 'IBM Plex Sans',
            fontStyle: 'normal',
          },
          disabled: {
            color: '#8d8d8d',
          },
        },
        type: {
          contained: {
            base: {
              color: '#FFFFFF',
            },
          },
          outline: {
            variant: {
              primary: {
                rest: {
                  color: '#0F62FE',
                },
              },
            },
          },
        },
      },
    },
  },
};
