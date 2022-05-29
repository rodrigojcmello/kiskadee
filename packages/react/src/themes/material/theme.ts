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
                backgroundColor: '#3574E1',
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
      },
    },
  },
};
