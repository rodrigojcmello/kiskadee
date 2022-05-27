import type { KiskadeeSchema } from '../theme.types';

export const fluentTheme: KiskadeeSchema = {
  name: 'Fluent',
  author: 'Microsoft',
  version: '2.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        contained: {
          primary: {
            rest: {
              borderRadius: '4px',
              borderWidth: '1px',
              borderStyle: 'solid',
              backgroundColor: '#005FB8',
              padding: '4px 11px 6px 11px',
              textAlign: 'center',
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
      text: {
        contained: {
          primary: {
            rest: {
              fontSize: '0.875rem',
              color: '#FFFFFF',
              height: '20px',
              lineHeight: '20px',
              fontWeight: 600,
              fontFamily: 'Segoe UI',
              fontStyle: 'normal',
            },
            hover: {
              color: '#FFFFFF',
            },
            pressed: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          },
        },
      },
    },
  },
};
