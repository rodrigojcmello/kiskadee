import type { KiskadeeSchema } from '../theme.types';

export const fluentTheme: KiskadeeSchema = {
  component: {
    button: {
      container: {
        rest: {
          backgroundColor: '#005FB8',
          padding: '6px 20px',
          border: 'none',
          borderRadius: '4px',
        },
        hover: {
          backgroundColor: '#106EBE',
          boxShadow:
            '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        },
      },
      text: {
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
      },
    },
  },
};
