import { css } from '@stitches/core';
import type {
  Breakpoint,
  ButtonElements,
  ButtonSchema,
  ButtonStyleProps,
  ContainerOptions,
  ContrastStyle,
  InteractionStatus,
  Size,
  StitchesProperties,
  IconType,
  KiskadeeTheme,
} from '@kiskadee/react';
import { CacheStyle } from './CacheStyle.class';

const cacheStyle = new CacheStyle();

export class Style {
  // Required ------------------------------------------------------------------

  readonly iconType: ButtonStyleProps['iconType'];

  readonly borderRadius: ButtonStyleProps['borderRadius'];

  readonly width: ButtonStyleProps['width'];

  readonly size: ButtonStyleProps['size'];

  readonly type: ButtonStyleProps['type'];

  readonly variant: ButtonStyleProps['variant'];

  readonly component: keyof KiskadeeTheme['component'];

  // Optional ------------------------------------------------------------------

  readonly options?: ContainerOptions;

  readonly textAlign?: ButtonStyleProps['textAlign'];

  readonly schema?: ButtonSchema;

  readonly theme?: ButtonStyleProps['theme']['option'];

  readonly iconLeft?: ButtonStyleProps['iconLeft'];

  readonly iconRight?: ButtonStyleProps['iconRight'];

  // Transition ----------------------------------------------------------------

  readonly timingFunction: string;

  readonly duration: string;

  // Responsive ----------------------------------------------------------------

  readonly responsive: Record<
    keyof Exclude<ContainerOptions['responsive'], undefined>,
    number
  >;

  constructor(style: ButtonStyleProps) {
    // Required ----------------------------------------------------------------

    this.iconType = style.iconType;
    this.width = style.width;
    this.type = style.type;
    this.variant = style.variant;
    this.borderRadius = style.borderRadius;
    this.component = style.component;

    // Optional ----------------------------------------------------------------

    this.size = style.size;
    this.schema = style.schema;
    this.theme = style.theme.option;
    this.textAlign = style.textAlign;
    this.options = style.schema?.option;
    this.iconLeft = style.iconLeft;
    this.iconRight = style.iconRight;

    // Transition --------------------------------------------------------------

    this.timingFunction = 'ease-in';
    this.duration = '0.250s';

    // Responsive --------------------------------------------------------------

    this.responsive = {
      smallScreenBP1: 0,
      smallScreenBP2: 321,
      smallScreenBP3: 376,

      mediumScreenBP1: 481,
      mediumScreenBP2: 641,
      mediumScreenBP3: 769,

      bigScreenBP1: 1025,
      bigScreenBP2: 1281,
      bigScreenBP3: 1441,
    };

    // Update Cache ------------------------------------------------------------

    cacheStyle.checkCache(
      style.theme.name,
      style.theme.version,
      style.theme.author,
      // TODO: find a new way to enable dark mode globally
      style.theme.option?.only
    );
  }

  cache<T>(element: string, property: string, callback: () => T): T {
    const key = [this.component, this.type, this.variant, element, property];

    const cache = cacheStyle.get<T>(key);
    if (cache) return cache;

    const value = callback();
    cacheStyle.set(key, value);
    return value;
  }

  static pickResponsiveProperties<T>(
    responsive: {
      [mediaQuery: string]: T;
    },
    properties: (keyof T)[]
  ) {
    const newObject: {
      [mediaQuery: string]: T;
    } = {};
    for (const mediaQuery of Object.keys(responsive)) {
      if (!newObject[mediaQuery]) {
        newObject[mediaQuery] = {} as T;
      }
      for (const property of properties) {
        if (responsive[mediaQuery]?.[property]) {
          newObject[mediaQuery][property] = responsive[mediaQuery][property];
        }
      }
    }
    return newObject;
  }

  /**
   * Empty objects generates a css class empty in Stitches library
   */
  static render(properties: StitchesProperties): string | undefined {
    const validProperties = Object.keys(properties).length > 0;

    if (validProperties) {
      return css(properties)();
    }
  }

  getTransition() {
    return this.cache('all', 'transition', () => {
      return Style.render({
        transitionDuration: this.duration,
        transitionTimingFunction: this.timingFunction,
      });
    });
  }

  getStyleEssential<T>(element: ButtonElements): T {
    return this.cache(element, 'essential', () => {
      const baseSchema = this.schema?.elements?.[element];
      const typeSchema = baseSchema?.light?.default?.type?.[this.type];
      const variantSchema = typeSchema?.variant?.[this.variant];

      return {
        ...baseSchema?.light?.default?.base?.rest?.md,
        ...typeSchema?.base?.md,
        ...variantSchema?.rest?.md,
      } as T;
    });
  }

  getStyleStatus<T, ExtraStatus = string | undefined>(
    element: ButtonElements,
    status: ExtraStatus extends IconType
      ? ExtraStatus | InteractionStatus
      : InteractionStatus
  ): T {
    return this.cache(element, status, () => {
      const base = this.schema?.elements?.[element];
      const type = base?.light?.default?.type?.[this.type];
      const variant = type?.variant?.[this.variant];

      return {
        ...base?.light?.default?.base?.[status]?.md,
        ...variant?.[status]?.md,
      } as T;
    });
  }

  getStyleDark<T>(element: ButtonElements): T {
    return this.cache(element, 'dark', () => {
      const base = this.schema?.elements?.[element];
      const type = base?.dark?.default?.type?.[this.type];
      const variant = type?.variant?.[this.variant];

      return {
        ...base?.dark?.default?.base?.rest?.md,
        ...type?.base?.md,
        ...variant?.rest?.md,
      } as T;
    });
  }

  getStyleSize<T>(element: ButtonElements, size: Exclude<Size, 'md'>): T {
    return this.cache(element, size, () => {
      const base = this.schema?.elements?.[element];
      const type = base?.light?.default?.type?.[this.type];
      const variant = type?.variant?.[this.variant];

      return {
        ...base?.light?.default?.base?.rest?.[size],
        ...type?.base?.[size],
        ...variant?.rest?.[size],
      } as T;
    });
  }

  getResponsiveStyle<T>(element: ButtonElements): {
    [mediaQuery: string]: T;
  } {
    const key = `responsive-${this.size ?? 'md'}`;
    return this.cache(element, key, () => {
      const responsive: { [mediaQuery: string]: T } = {};

      if (!this.size) {
        for (const breakpoint of Object.keys(this.options?.responsive || {})) {
          const size = this?.options?.responsive?.[breakpoint as Breakpoint];
          if (size) {
            responsive[
              `@media (min-width: ${
                this.responsive[breakpoint as Breakpoint]
              }px)`
            ] =
              size === 'md'
                ? this.getStyleEssential(element)
                : this.getStyleSize(element, size);
          }
        }
      } else {
        responsive['@media (min-width: 0px)'] =
          !this.size || this.size === 'md'
            ? this.getStyleEssential(element)
            : {
                ...this.getStyleEssential(element),
                ...this.getStyleSize(element, this.size),
              };
      }

      return responsive;
    });
  }

  getContrastStyle<T>(element: ButtonElements): ContrastStyle<T> {
    return this.cache(element, 'contrast', () => {
      const responsive: ContrastStyle<T> = {};

      const light: T = this.getStyleEssential(element);

      const dark: T = {
        ...light,
        ...this.getStyleDark(element),
      };

      if (!this.theme?.only) {
        responsive.contrastMode = dark;
      }

      responsive.defaultMode = this.theme?.only === 'dark' ? dark : light;

      return responsive;
    });
  }
}