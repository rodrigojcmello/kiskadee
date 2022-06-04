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
          widthMin: 100,
        },
        type: {
          contained: {
            base: {
              paddingTop: 4,
              paddingBottom: 6,
              paddingLeft: 11,
              paddingRight: 11,
              textAlign: 'center',
              borderRadius: 4,
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
                  outlineWidth: 2,
                  outlineStyle: 'solid',
                  outlineColor: '#000',
                  outlineOffset: 1,
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
