import type { KiskadeeSchema } from '../theme.types';

export const capybaraTheme: KiskadeeSchema = {
  name: 'Capybara',
  author: 'Kiskadee',
  version: '1.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        contained: {
          base: {
            textAlign: 'center',
            padding: '10px 24px',
            borderRadius: 10,
          },
          option: {
            widthMin: '100px',
          },
          variant: {
            primary: {
              rest: {
                backgroundColor: '#007AFF',
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
            secondary: {
              rest: {
                backgroundColor: '#4d4d4d',
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
              },
              hover: {
                backgroundColor: '#49ba72',
                boxShadow:
                  '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
              },
              focus: {
                backgroundColor: '#19AE59',
                outline: '2px solid #1269ec',
                outlineOffset: '1px',
              },
              pressed: {
                backgroundColor: '#19AE59',
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
      },
      text: {
        contained: {
          base: {
            fontSize: '0.875rem',
            lineHeight: '20px',
            fontWeight: 500,
            fontFamily: 'Roboto',
            fontStyle: 'normal',
          },
          variant: {
            primary: {
              rest: {
                color: '#FFFFFF',
              },
              disabled: {
                color: '#999999',
              },
            },
            secondary: {
              rest: {
                color: '#FFFFFF',
              },
              disabled: {
                color: '#999999',
              },
            },
            success: {
              rest: {
                color: '#FFFFFF',
              },
              disabled: {
                color: '#999999',
              },
            },
            warning: {
              rest: {
                color: '#FFFFFF',
              },
              disabled: {
                color: '#999999',
              },
            },
            danger: {
              rest: {
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
  },
};
