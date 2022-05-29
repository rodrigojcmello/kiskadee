import type { KiskadeeSchema } from '../theme.types';

export const iosTheme: KiskadeeSchema = {
  name: 'iOs',
  author: 'Apple',
  version: '15.2',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        contained: {
          base: {
            textAlign: 'center',
            padding: '14px 20px',
            borderRadius: '10px',
          },
          variant: {
            primary: {
              rest: {
                backgroundColor: '#007AFF',
              },
              disabled: {
                backgroundColor: '#74748114',
              },
            },
            secondary: {
              rest: {
                backgroundColor: '#E1EBFE',
              },
              disabled: {
                backgroundColor: '#74748114',
              },
            },
            tertiary: {
              rest: {
                backgroundColor: '#E9E9EA',
              },
              disabled: {
                backgroundColor: '#74748114',
              },
            },
          },
        },
      },
      text: {
        contained: {
          primary: {
            rest: {
              fontSize: '1.0625rem',
              color: '#FFFFFF',
              lineHeight: '22px',
              fontWeight: 600,
              fontFamily: 'SF Pro Text',
              fontStyle: 'normal',
            },
            disabled: {
              color: '#3c3c444d',
            },
          },
          secondary: {
            rest: {
              fontSize: '1.0625rem',
              color: '#307DF6',
              lineHeight: '22px',
              fontWeight: 600,
              fontFamily: 'SF Pro Text',
              fontStyle: 'normal',
            },
            disabled: {
              color: '#3c3c444d',
            },
          },
          tertiary: {
            rest: {
              fontSize: '1.0625rem',
              color: '#307DF6',
              lineHeight: '22px',
              fontWeight: 600,
              fontFamily: 'SF Pro Text',
              fontStyle: 'normal',
            },
            disabled: {
              color: '#3c3c444d',
            },
          },
        },
      },
    },
  },
};
