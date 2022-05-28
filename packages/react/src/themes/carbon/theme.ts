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
              backgroundColor: '#0F62FE',
              textAlign: 'left',
              padding: '13px 64px 13px 16px',
            },
            hover: {
              backgroundColor: '#0353E9 ',
            },
            focus: {
              outline: '1px solid #ffffff',
              outlineOffset: '-3px',
            },
            pressed: {
              backgroundColor: '#002D9C',
            },
            disabled: {
              backgroundColor: '#E4E4E4',
            },
          },
          secondary: {
            rest: {
              backgroundColor: '#393939',
              textAlign: 'left',
              padding: '13px 64px 13px 16px',
            },
            hover: {
              backgroundColor: '#474747',
            },
            focus: {
              outline: '1px solid #ffffff',
              outlineOffset: '-3px',
            },
            pressed: {
              backgroundColor: '#6f6f6f',
            },
            disabled: {
              backgroundColor: '#E4E4E4',
            },
          },
          danger: {
            rest: {
              backgroundColor: '#da1e28',
              textAlign: 'left',
              padding: '13px 64px 13px 16px',
            },
            hover: {
              backgroundColor: '#b81922',
            },
            focus: {
              outline: '1px solid #ffffff',
              outlineOffset: '-3px',
            },
            pressed: {
              backgroundColor: '#750e13',
            },
            disabled: {
              backgroundColor: '#E4E4E4',
            },
          },
        },
      },
      text: {
        contained: {
          primary: {
            rest: {
              fontSize: '1rem',
              color: '#FFFFFF',
              height: '1.375rem',
              lineHeight: '1.375rem',
              fontWeight: 400,
              fontFamily: 'IBM Plex Sans',
              fontStyle: 'normal',
            },
            disabled: {
              color: '#8d8d8d',
            },
          },
          secondary: {
            rest: {
              fontSize: '1rem',
              color: '#FFFFFF',
              height: '1.375rem',
              lineHeight: '1.375rem',
              fontWeight: 400,
              fontFamily: 'IBM Plex Sans',
              fontStyle: 'normal',
            },
            disabled: {
              color: '#8d8d8d',
            },
          },
          danger: {
            rest: {
              fontSize: '1rem',
              color: '#FFFFFF',
              height: '1.375rem',
              lineHeight: '1.375rem',
              fontWeight: 400,
              fontFamily: 'IBM Plex Sans',
              fontStyle: 'normal',
            },
            disabled: {
              color: '#8d8d8d',
            },
          },
        },
      },
    },
  },
};
