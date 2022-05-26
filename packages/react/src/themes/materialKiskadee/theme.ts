import type { KiskadeeSchema } from '../theme.types';

export const materialKiskadeeTheme: KiskadeeSchema = {
  name: 'Material',
  author: 'Kiskadee',
  version: '3.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        contained: {
          primary: {
            rest: {
              backgroundColor: '#007AFF',
              padding: '10px 24px',
              borderRadius: '100px',
            },
            hover: {
              backgroundColor: '#008fff',
              boxShadow:
                '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
            },
            focus: {
              backgroundColor: '#1269ec',
              outline: '2px solid #1269ec',
              outlineOffset: '1px',
            },
            pressed: {
              backgroundColor: '#1269ec',
              boxShadow: 'none',
            },
            visited: {
              backgroundColor: '#7828c8',
            },
            disabled: {
              backgroundColor: '#d9d9d9',
            },
          },
          success: {
            rest: {
              backgroundColor: '#19ae59',
              padding: '10px 24px',
              borderRadius: '100px',
            },
            hover: {
              backgroundColor: '#008fff',
              boxShadow:
                '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
            },
            focus: {
              backgroundColor: '#1269ec',
              outline: '2px solid #1269ec',
              outlineOffset: '1px',
            },
            pressed: {
              backgroundColor: '#1269ec',
              boxShadow: 'none',
            },
            visited: {
              backgroundColor: '#7828c8',
            },
            disabled: {
              backgroundColor: '#d9d9d9',
            },
          },
          warning: {
            rest: {
              backgroundColor: '#f5a425',
              padding: '10px 24px',
              borderRadius: '100px',
            },
            hover: {
              backgroundColor: '#008fff',
              boxShadow:
                '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
            },
            focus: {
              backgroundColor: '#1269ec',
              outline: '2px solid #1269ec',
              outlineOffset: '1px',
            },
            pressed: {
              backgroundColor: '#1269ec',
              boxShadow: 'none',
            },
            visited: {
              backgroundColor: '#7828c8',
            },
            disabled: {
              backgroundColor: '#d9d9d9',
            },
          },
          danger: {
            rest: {
              backgroundColor: '#f31260',
              padding: '10px 24px',
              borderRadius: '100px',
            },
            hover: {
              backgroundColor: '#008fff',
              boxShadow:
                '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
            },
            focus: {
              backgroundColor: '#1269ec',
              outline: '2px solid #1269ec',
              outlineOffset: '1px',
            },
            pressed: {
              backgroundColor: '#1269ec',
              boxShadow: 'none',
            },
            visited: {
              backgroundColor: '#7828c8',
            },
            disabled: {
              backgroundColor: '#d9d9d9',
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
              color: '#999999',
            },
          },
        },
      },
    },
  },
};
