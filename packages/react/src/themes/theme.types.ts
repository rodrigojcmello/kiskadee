import type { ButtonSchema } from '../components/Button';

export interface KiskadeeSchema {
  name: string;
  author: string;
  version: string;
  kiskadeeVersion: string;
  theme?: {
    only?: 'light' | 'dark';
    light?: string | 'default';
    dark?: string | 'default';
  };
  component: {
    button?: ButtonSchema;
  };
}
