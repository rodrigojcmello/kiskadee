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
          widthMin: 100,
          borderRadius: {
            default: 0,
            none: 0,
          },
          textAlign: {
            default: 'left',
            left: true,
          },
          icon: {
            rightDetached: true,
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
                  outlineWidth: 1,
                  outlineColor: '#ffffff',
                  outlineStyle: 'solid',
                  outlineOffset: -3,
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
                  outlineWidth: 1,
                  outlineColor: '#ffffff',
                  outlineStyle: 'solid',
                  outlineOffset: -3,
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
                  outlineWidth: 1,
                  outlineColor: '#ffffff',
                  outlineStyle: 'solid',
                  outlineOffset: -3,
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
              borderWidth: 1,
              borderStyle: 'solid',
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
      leftIcon: {
        base: {
          rest: {
            fontSize: 16,
            paddingRight: 16,
            paddingLeft: 16,
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
            paddingTop: 13,
            paddingBottom: 13,
            paddingLeft: 16,
            paddingRight: 64,
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
            base: {
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: 15,
              paddingRight: 63,
            },
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
      rightIcon: {
        base: {
          rest: {
            fontSize: 16,
            paddingRight: 16,
            paddingLeft: 16,
          },
        },
      },
    },
  },
};
