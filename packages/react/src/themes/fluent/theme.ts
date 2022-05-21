import type { KiskadeeSchema } from '../theme.types';

export const fluentTheme: KiskadeeSchema = {
  component: {
    button: {
      container: {
        rest: {
          backgroundColor: '#005FB8',
          padding: '5px 12px 7px 12px',
          borderRadius: '4px',
          borderColor:
            'linear-gradient(180deg, hsl(0deg 0% 100% / 8%) 90%, hsl(0deg 0% 0% / 40%) 100%)',
          borderWidth: '1px',
        },
        hover: {
          backgroundColor: '#1A6FBF',
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
