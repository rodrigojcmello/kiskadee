import type { ButtonSchema } from '../components/Button/Button.types';

export interface KiskadeeSchema {
  name: string;
  author: string;
  version: string;
  kiskadeeVersion: string;
  component: {
    button?: ButtonSchema;
  };
}
