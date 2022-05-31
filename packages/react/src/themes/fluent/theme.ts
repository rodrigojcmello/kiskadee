import type { KiskadeeSchema } from '../theme.types';

export const fluentTheme: KiskadeeSchema = {
  name: 'Fluent',
  author: 'Microsoft',
  version: '2.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        option: {
          widthMin: '100px',
        },
        type: {
          contained: {
            base: {
              padding: '4px 11px 6px 11px',
              textAlign: 'center',
              borderRadius: '4px',
            },
            variant: {
              primary: {
                rest: {
                  backgroundColor: '#005FB8',
                },
                hover: {
                  backgroundColor: '#1A6FBF',
                },
                pressed: {
                  backgroundColor: '#327EC5',
                },
                focus: {
                  outline: '2px solid #000',
                  outlineOffset: '1px',
                },
                disabled: {
                  backgroundColor: '#C8C8C8',
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
            fontWeight: 600,
            fontFamily: 'Segoe UI',
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
                pressed: {
                  color: '#ffffffb3',
                },
              },
            },
          },
        },
      },
    },
  },
};
