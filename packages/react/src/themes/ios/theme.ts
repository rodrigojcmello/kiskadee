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
      },
      text: {
        rest: {
          fontSize: '1.0625rem', // 17px
          color: '#FFFFFF',
          height: '22px',
          lineHeight: '22px',
          fontWeight: 600,
          fontFamily: 'SF Pro Text',
          fontStyle: 'normal',
        },
      },
    },
  },
};
