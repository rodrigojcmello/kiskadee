import type { CSSProperties } from 'react';
import type { ButtonType, ButtonVariant, Size } from '../types';
import type { ButtonProps, ButtonSchema } from '../components/Button';

export type KiskadeeStyleType = {
  // TODO: create a generic type
  type: ButtonProps['type'];
  // TODO: create a generic variant
  variant: ButtonProps['variant'];
  size?: Size;
  componentSchema?: ComponentSchema;
  componentOptions?: ComponentOptions;

  info: {
    name: string;
    version: string;
    author: string;
    themeMode?: KiskadeeTheme['themeMode'];
  };
};

export type ComponentSchema = {
  [element: string]: ElementTheme<CSSProperties, string>;
};

export type ComponentOptions = Record<string, unknown>;

export type ElementTheme<T, State extends string> = Partial<
  Record<
    'light' | 'dark',
    Partial<
      Record<
        string | 'default',
        {
          base?: Partial<Record<State, Partial<Record<Size, T>>>>;
          type?: Partial<
            Record<
              ButtonType,
              {
                base?: Partial<Record<Size, T>>;
                variant?: Partial<
                  Record<
                    ButtonVariant,
                    Partial<Record<State, Partial<Record<Size, T>>>>
                  >
                >;
              }
            >
          >;
        }
      >
    >
  >
>;

export interface KiskadeeTheme {
  name: string;
  author: string;
  version: string;
  kiskadeeVersion: string;
  themeMode?: {
    only?: 'light' | 'dark';
    light?: string | 'default';
    dark?: string | 'default';
  };
  component?: {
    button?: ButtonSchema;
  };
}
