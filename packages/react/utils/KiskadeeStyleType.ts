import type { CSSProperties } from 'react';
import type { StyleValue } from '@/utils/property.type';
import type { ElementType, ElementVariant, Size } from '../types';
import type {
  ButtonProps,
  ButtonSchema,
  ResponsiveOption,
} from '../components/Button';

export type KiskadeeStyleType = {
  // TODO: create a generic type
  type: ButtonProps['type'];
  // TODO: create a generic variant
  variant: ButtonProps['variant'];
  size?: Size;
  componentSchema?: ComponentSchema;
  componentOptions?: ComponentOptions;
  responsiveOption?: ResponsiveOption;

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

export type Mode = 'light' | 'dark';

export type StyleBySize = Partial<Record<Size, StyleValue>>;

export type ElementTheme<T, State extends string> = Partial<
  Record<
    Mode,
    Partial<
      Record<
        string | 'default',
        {
          base?: Partial<Record<State, StyleBySize>>;
          type?: Partial<
            Record<
              ElementType,
              {
                base?: StyleBySize;
                variant?: Partial<
                  Record<ElementVariant, Partial<Record<State, StyleBySize>>>
                >;
              }
            >
          >;
        }
      >
    >
  >
>;

type ComponentMap = {
  button: ButtonSchema;
  textField: ButtonSchema;
};

export type ComponentName = keyof ComponentMap;

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
    [key in ComponentName]?: ComponentMap[key];
  };
}
