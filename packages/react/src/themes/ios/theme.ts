import type { KiskadeeSchema } from '../theme.types';

export const iosTheme: KiskadeeSchema = {
  name: 'iOs',
  author: 'Apple',
  version: '15.2',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        option: {
          borderRadius: {
            default: 10,
            rounded: 10,
            none: 0,
          },
          widthMin: 100,
        },
        base: {
          rest: {
            textAlign: 'center',
            paddingTop: 14,
            paddingBottom: 14,
            paddingLeft: 20,
            paddingRight: 20,
          },
          disabled: {
            backgroundColor: '#74748114',
          },
        },
        type: {
          contained: {
            variant: {
              primary: {
                rest: {
                  backgroundColor: '#007AFF',
                },
              },
              secondary: {
                rest: {
                  backgroundColor: '#E1EBFE',
                },
              },
              tertiary: {
                rest: {
                  backgroundColor: '#E9E9EA',
                },
              },
            },
          },
        },
      },
      text: {
        base: {
          rest: {
            fontSize: '1.0625rem',
            lineHeight: '22px',
            fontWeight: 600,
            fontFamily: 'SF Pro Text',
            fontStyle: 'normal',
          },
          disabled: {
            color: '#3c3c444d',
          },
        },
        type: {
          contained: {
            variant: {
              primary: {
                rest: {
                  color: '#FFFFFF',
                },
              },
              secondary: {
                rest: {
                  color: '#307DF6',
                },
              },
              tertiary: {
                rest: {
                  color: '#307DF6',
                },
              },
            },
          },
        },
      },
    },
  },
};
