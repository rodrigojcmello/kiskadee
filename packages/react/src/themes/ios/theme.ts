import type { KiskadeeSchema } from '../theme.types';

export const iosTheme: KiskadeeSchema = {
  component: {
    button: {
      container: {
        rest: {
          backgroundColor: '#007AFF',
          padding: '13px 20px',
          border: 'none',
          borderRadius: '10px',
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
          height: '22px',
          lineHeight: '22px',
          fontWeight: 500,
          fontFamily: 'SF Pro',
          fontStyle: 'normal',
        },
        hover: {
          color: '#FFFFFF',
        },
      },
    },
  },
};
