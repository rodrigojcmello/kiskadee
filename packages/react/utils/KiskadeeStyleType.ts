import type { StyleValue } from './property.type';
import type { ElementType, ElementVariant, Size } from '../types';
import type {
  ButtonProps,
  ButtonSchema,
  ResponsiveOption,
} from '../components/Button';

export type ComponentOptions = Record<string, unknown>;

export type Mode = 'light' | 'dark';

export type StyleBySize = Partial<Record<Size, StyleValue>>;

export type Status =
  | 'rest'
  | 'hover'
  | 'focus'
  | 'pressed'
  | 'visited'
  | 'disabled';

export type ElementTheme = Partial<
  Record<
    Mode,
    Partial<
      Record<
        string | 'default',
        {
          base?: Partial<Record<Status, StyleBySize>>;
          type?: Partial<
            Record<
              ElementType,
              {
                base?: StyleBySize;
                variant?: Partial<
                  Record<ElementVariant, Partial<Record<Status, StyleBySize>>>
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

export type ComponentSchema = {
  [component: string]: {
    // options?: {};
    elements?: Partial<{
      [element: string]: ElementTheme;
    }>;
  };
};

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
  // component?: {
  //   [key in ComponentName]?: ComponentMap[key];
  // };
  components?: ComponentSchema;
}

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
