import { css } from '@stitches/core';
import type {
  Breakpoint,
  ButtonSchema,
  ButtonStyleProps,
  ContainerOptions,
  ContrastStyle,
  Size,
  StitchesProperties,
  KiskadeeTheme,
  GenericCSSProperties,
  BorderRadiusState,
  ButtonElements,
  PrefixState,
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

  cache<T>(keys: string[], callback: () => T): T {
    const key = [this.component, this.type, this.variant, ...keys];

    const cache = cacheStyle.get<T>(key);
    if (cache) return cache;

    const value = callback();
    cacheStyle.set(key, value);
    return value;
  }

  static render(properties: GenericCSSProperties): string | undefined {
    const validProperties = Object.keys(properties).length > 0;

    /**
     * Empty objects generates a css class empty in Stitches library
     */
    if (validProperties) {
      return css(properties as StitchesProperties)();
    }
  }

  getTransition() {
    return this.cache(['transition'], () => {
      return Style.render({
        transitionDuration: this.duration,
        transitionTimingFunction: this.timingFunction,
      });
    });
  }

  getStyleEssential<T>(element: string): T {
    return this.cache([element, 'essential'], () => {
      // @ts-ignore
      const base = this.schema?.elements?.[element];
      const type = base?.light?.default?.type?.[this.type];
      const variant = type?.variant?.[this.variant];

      return {
        ...base?.light?.default?.base?.rest?.md,
        ...type?.base?.md,
        ...variant?.rest?.md,
      } as T;
    });
  }

  getStyleStatus<T, Status extends string>(
    element: string,
    status: Status,
    size?: Size
  ): T {
    const sizeValue = size || this.size || 'md';
    return this.cache([element, status, sizeValue], () => {
      // TODO: remove this ts-ignore
      // @ts-ignore
      const base = this.schema?.elements?.[element];
      const type = base?.light?.default?.type?.[this.type];
      const variant = type?.variant?.[this.variant];

      return {
        ...base?.light?.default?.base?.[status]?.md,
        ...base?.light?.default?.base?.[status]?.[sizeValue],
        ...variant?.[status]?.md,
        ...variant?.[status]?.[sizeValue],
      } as T;
    });
  }

  getStyleDark<T>(element: string): T {
    return this.cache([element, 'dark'], () => {
      // @ts-ignore
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

  getStyleSize<T>(element: string, size: Exclude<Size, 'md'>): T {
    return this.cache([element, size], () => {
      // @ts-ignore
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

  getResponsiveStyle(
    element: string,
    status?: string
  ): {
    [mediaQuery: string]: GenericCSSProperties;
  } {
    return this.cache(
      [element, 'responsive', this.size || 'md', status || '-'],
      () => {
        const responsive: { [mediaQuery: string]: GenericCSSProperties } = {};

        if (!this.size) {
          for (const breakpoint of Object.keys(
            this.options?.responsive || {}
          )) {
            const size = this?.options?.responsive?.[breakpoint as Breakpoint];
            if (size) {
              responsive[
                `@media (min-width: ${
                  this.responsive[breakpoint as Breakpoint]
                }px)`
              ] =
                size === 'md'
                  ? {
                      ...this.getStyleEssential(element),
                      ...(status
                        ? this.getStyleStatus(element, status, size)
                        : {}),
                    }
                  : {
                      ...this.getStyleSize(element, size),
                      ...(status
                        ? this.getStyleStatus(element, status, size)
                        : {}),
                    };
            }
          }
        } else {
          // TODO: remove ts-ignore
          responsive['@media (min-width: 0px)'] = {
            // @ts-ignores
            ...this.getStyleEssential(element),
            // @ts-ignore
            ...(!(!this.size || this.size === 'md')
              ? // @ts-ignore
                this.getStyleSize(element, this.size)
              : {}),
            // @ts-ignore
            ...(status ? this.getStyleStatus(element, status) : {}),
          };
        }

        return responsive;
      }
    );
  }

  getContrastStyle<T>(element: string, status?: string): ContrastStyle<T> {
    return this.cache([element, 'contrast', status || '-'], () => {
      const responsive: ContrastStyle<T> = {};

      const light: T = {
        ...this.getStyleEssential(element),
        ...(status ? this.getStyleStatus(element, status) : {}),
      };

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

  static pickResponsiveProperties(
    responsive: {
      [mediaQuery: string]: GenericCSSProperties;
    },
    properties: string[]
  ): {
    [mediaQuery: string]: Record<string, string>;
  } {
    const newObject: {
      [mediaQuery: string]: Record<string, string>;
    } = {};
    for (const mediaQuery of Object.keys(responsive)) {
      if (!newObject[mediaQuery]) {
        // @ts-ignore
        newObject[mediaQuery] = {} as unknown;
      }
      for (const property of properties) {
        // @ts-ignore
        if (responsive[mediaQuery]?.[property]) {
          // @ts-ignore
          newObject[mediaQuery][property] = responsive[mediaQuery][property];
        }
      }
    }
    return newObject;
  }

  propertySpacingStyle(
    element: string,
    spacing: 'margin' | 'padding',
    status?: string,
    callback?: (value: { [mediaQuery: string]: GenericCSSProperties }) => {
      [mediaQuery: string]: GenericCSSProperties;
    },
    extraKeys: string[] = []
  ): string | undefined {
    return this.cache(
      [element, spacing, this.size || 'md', status || '-', ...extraKeys],
      () => {
        let elementResponsive = this.getResponsiveStyle(element, status);

        elementResponsive = Style.pickResponsiveProperties(elementResponsive, [
          spacing,
          `${spacing}Top`,
          `${spacing}Bottom`,
          `${spacing}Right`,
          `${spacing}Left`,
        ]);

        if (callback) {
          elementResponsive = callback(elementResponsive);
        }

        const {
          '@media (min-width: 0px)': elementSpacing,
          ...elementSpacingResponsive
        } = elementResponsive;

        return Style.render({
          ...elementSpacing,
          ...elementSpacingResponsive,
        });
      }
    );
  }

  propertyRadiusStyle(element: ButtonElements) {
    let status: PrefixState<'borderRadius', BorderRadiusState> =
      'borderRadiusNone';

    if (!this.borderRadius && this.options?.borderRadius) {
      status = `borderRadius${this.options?.borderRadius}`;
    } else if (this.borderRadius === 'Rounded') {
      status = 'borderRadiusRounded';
    } else if (this.borderRadius === 'Full') {
      status = 'borderRadiusFull';
    }

    const elementStyle = this.getResponsiveStyle(element, status);

    const p = Style.pickResponsiveProperties(elementStyle, [
      'borderRadius',
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
    ]);

    const { '@media (min-width: 0px)': elementRest, ...elementResponsive } = p;

    return Style.render({
      // @ts-ignore
      ...elementRest,
      ...elementResponsive,
    });
  }
}
