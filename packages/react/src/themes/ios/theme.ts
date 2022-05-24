import type { KiskadeeSchema } from '../theme.types';

export const iosTheme: KiskadeeSchema = {
  name: 'iOs',
  author: 'Apple',
  version: '15.0',
  kiskadeeVersion: '0.0.1',
  component: {
    button: {
      container: {
        rest: {
          backgroundColor: '#007AFF',
          padding: '13px 20px',
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
