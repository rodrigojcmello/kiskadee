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
          borderRadius: {
            default: 4,
            rounded: 4,
          },
          textAlign: {
            default: 'center',
            center: true,
            left: true,
          },
        },
        base: {
          focus: {
            outlineWidth: 2,
            outlineStyle: 'solid',
            outlineColor: '#000',
            outlineOffset: 1,
          },
        },
        type: {
          contained: {
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
                disabled: {
                  backgroundColor: '#C8C8C8',
                },
              },
              secondary: {
                rest: {
                  backgroundColor: '#FFFFFFB2',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#0000000F',
                },
                hover: {
                  backgroundColor: '#F9F9F980',
                },
                pressed: {
                  backgroundColor: '#F9F9F94D',
                },
                disabled: {
                  backgroundColor: '#F9F9F94D',
                },
                focus: {
                  backgroundColor: '#FFFFFFB2',
                },
              },
            },
          },
        },
      },
      leftIcon: {
        base: {
          rest: {
            paddingTop: 3,
            paddingBottom: 3,
            paddingLeft: 3,
            paddingRight: 3,
            color: '#ffffff',
            fontSize: '24px',
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
            base: {
              paddingTop: 4,
              paddingBottom: 6,
              paddingLeft: 11,
              paddingRight: 11,
            },
            variant: {
              primary: {
                rest: {
                  color: '#FFFFFF',
                },
                pressed: {
                  color: '#ffffffb3',
                },
              },
              secondary: {
                rest: {
                  color: '#000000E4',
                  paddingTop: 3,
                  paddingBottom: 5,
                  paddingLeft: 10,
                  paddingRight: 10,
                },
                disabled: {
                  color: '#0000005C',
                },
              },
            },
          },
        },
      },
    },
  },
};
