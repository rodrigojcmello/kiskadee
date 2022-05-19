import type { KiskadeeSchema } from '../theme.types';

export const materialtheme: KiskadeeSchema = {
  component: {
    button: {
      container: {
        rest: {
          backgroundColor: '#6750A4',
          padding: '10px 24px',
          border: 'none',
          borderRadius: '100px',
        },
        hover: {
          backgroundColor: '#735EAB',
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
};
