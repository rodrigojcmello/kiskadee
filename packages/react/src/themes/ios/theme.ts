import type { KiskadeeSchema } from '../theme.types';

export const iosTheme: KiskadeeSchema = {
  name: 'iOs',
  author: 'Apple',
  version: '15.2',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        base: {
          rest: {
            textAlign: 'center',
            padding: '14px 20px',
            borderRadius: '10px',
          },
          disabled: {
            backgroundColor: '#74748114',
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
