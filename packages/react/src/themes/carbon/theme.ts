import type { KiskadeeSchema } from '../theme.types';

export const carbonTheme: KiskadeeSchema = {
  name: 'Carbon',
  author: 'IBM',
  version: '0.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        contained: {
          primary: {
            rest: {
              backgroundColor: '#0f62fe',
              padding: '11px 15px',
              textAlign: 'left',
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
          secondary: {
            rest: {
              backgroundColor: '#393939',
              textAlign: 'left',
              padding: '11px 15px',
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
          danger: {
            rest: {
              backgroundColor: '#da1e28',
              textAlign: 'left',
              padding: '11px 15px',
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
              backgroundColor: '#c6c6c6',
            },
          },
        },
      },
      text: {
        contained: {
          primary: {
            rest: {
              fontSize: '0.875rem',
              color: '#FFFFFF',
              height: '20px',
              lineHeight: '20px',
              fontWeight: 500,
              fontFamily: 'Roboto',
              fontStyle: 'normal',
            },
            hover: {
              color: '#FFFFFF',
            },
            disabled: {
              color: '#8d8d8d',
            },
          },
          secondary: {
            rest: {
              fontSize: '0.875rem',
              color: '#FFFFFF',
              height: '20px',
              lineHeight: '20px',
              fontWeight: 500,
              fontFamily: 'Roboto',
              fontStyle: 'normal',
            },
            hover: {
              color: '#FFFFFF',
            },
          },
          danger: {
            rest: {
              fontSize: '0.875rem',
              color: '#FFFFFF',
              height: '20px',
              lineHeight: '20px',
              fontWeight: 500,
              fontFamily: 'Roboto',
              fontStyle: 'normal',
            },
            hover: {
              color: '#FFFFFF',
            },
          },
        },
      },
    },
  },
};
