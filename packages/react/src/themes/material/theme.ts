import type { KiskadeeSchema } from '../theme.types';

export const materialTheme: KiskadeeSchema = {
  name: 'Material',
  author: 'Google',
  version: '3.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        contained: {
          base: {
            padding: '10px 24px',
            borderRadius: '20px',
            textAlign: 'center',
          },
          option: {
            widthMin: '100px',
          },
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
                boxShadow: 'none',
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
            borderRadius: '20px',
            textAlign: 'center',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#79747E',
          },
          option: {
            widthMin: '100px',
          },
          variant: {
            primary: {
              rest: {
                backgroundColor: '#FFFFFF',
              },
              hover: {
                backgroundColor: '#F3F1F8',
                boxShadow:
                  '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
              },
              focus: {
                backgroundColor: '#ECEAF4',
              },
              pressed: {
                backgroundColor: '#ECEAF4',
                boxShadow: 'none',
              },
              disabled: {
                boxShadow: 'none',
                backgroundColor: '#FFFFFF',
              },
            },
          },
        },
        flat: {
          base: {
            padding: '10px 24px',
            borderRadius: '20px',
            textAlign: 'center',
          },
          option: {
            widthMin: '100px',
          },
          variant: {
            primary: {
              rest: {
                backgroundColor: '#FFFFFF',
              },
              hover: {
                backgroundColor: '#F3F1F8',
                boxShadow:
                  '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
              },
              focus: {
                backgroundColor: '#ECEAF4',
              },
              pressed: {
                backgroundColor: '#ECEAF4',
                boxShadow: 'none',
              },
              disabled: {
                boxShadow: 'none',
                backgroundColor: '#FFFFFF',
              },
            },
          },
        },
      },
      text: {
        contained: {
          base: {
            fontSize: '0.875rem',
            lineHeight: '20px',
            fontWeight: 500,
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            color: '#FFFFFF',
          },
        },
        outline: {
          base: {
            color: '#6750A4',
            fontSize: '0.875rem',
            lineHeight: '20px',
            fontWeight: 500,
            fontFamily: 'Roboto',
            fontStyle: 'normal',
          },
        },
        flat: {
          base: {
            color: '#6750A4',
            fontSize: '0.875rem',
            lineHeight: '20px',
            fontWeight: 500,
            fontFamily: 'Roboto',
            fontStyle: 'normal',
          },
        },
      },
    },
  },
};
