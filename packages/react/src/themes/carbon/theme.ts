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
          base: {
            textAlign: 'left',
            padding: '13px 64px 13px 16px',
          },
          option: {
            widthMin: '100px',
          },
          variant: {
            primary: {
              rest: {
                backgroundColor: '#0F62FE',
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
      },
      text: {
        contained: {
          base: {
            fontSize: '1rem',
            lineHeight: '1.375rem',
            fontWeight: 400,
            fontFamily: 'IBM Plex Sans',
            fontStyle: 'normal',
          },
          variant: {
            primary: {
              rest: {
                color: '#FFFFFF',
              },
              disabled: {
                color: '#8d8d8d',
              },
            },
            secondary: {
              rest: {
                color: '#FFFFFF',
              },
              disabled: {
                color: '#8d8d8d',
              },
            },
            danger: {
              rest: {
                color: '#FFFFFF',
              },
              disabled: {
                color: '#8d8d8d',
              },
            },
          },
        },
      },
    },
  },
};
