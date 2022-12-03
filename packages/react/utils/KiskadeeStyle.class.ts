import { css } from '@stitches/core';
import type {
  ButtonStyleProps,
  ButtonOptions,
  ContrastStyle,
  Size,
  StitchesProperties,
  GenericCSSProperties,
  KiskadeeStyleType,
  ComponentSchema,
  KiskadeeTheme,
  Breakpoint,
  ResponsiveOption,
} from '@kiskadee/react';
import type { CSSProperties } from 'react';
import { CacheStyle } from './CacheStyle.class';

const cacheStyle = new CacheStyle();

export class KiskadeeStyle {
  readonly componentSchema?: ComponentSchema;

  component:
    | keyof Exclude<KiskadeeTheme['component'], undefined>
    | 'buttonGroup'
    | undefined;

  readonly type: ButtonStyleProps['type'];

  readonly variant: ButtonStyleProps['variant'];

  readonly size: ButtonStyleProps['size'];

  readonly info: KiskadeeStyleType['info'];

  responsiveOption?: ResponsiveOption;

  // Transition ----------------------------------------------------------------

  readonly timingFunction: CSSProperties['animationTimingFunction'];

  readonly duration: number;

  // Responsive ----------------------------------------------------------------

  readonly responsive: Record<
    keyof Exclude<ButtonOptions['responsive'], undefined>,
    number
  >;

  constructor(style: KiskadeeStyleType) {
    // Required ----------------------------------------------------------------

    this.type = style.type;
    this.variant = style.variant;
    // this.type = 'contained';
    // this.variant = 'primary';

    // Optional ----------------------------------------------------------------

    this.size = style.size;
    this.componentSchema = style.componentSchema;
    this.info = style.info;
    this.responsiveOption = style.responsiveOption;

    // Transition --------------------------------------------------------------

    this.timingFunction = 'ease-in';
    this.duration = 270;

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

    if (style?.info) {
      cacheStyle.checkCache(
        style?.info.name,
        style?.info.version,
        style?.info.author,
        // TODO: find a new way to enable dark mode globally
        style?.info.themeMode?.only
      );
    }
  }

  cache<T>(keys: string[], callback: () => T): T {
    // TODO: review this
    const key = [this.component as string, this.type, this.variant, ...keys];

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
      return KiskadeeStyle.render({
        transitionDuration: `${this.duration}ms`,
        transitionTimingFunction: this.timingFunction,
      });
    });
  }

  common() {
    return {
      transition: this.getTransition(),
    };
  }

  propertyRadiusStyle(element: string, state?: string): string | undefined {
    const elementStyle = this.getResponsiveStyle(element, state);

    const { '@media (min-width: 0px)': elementRest, ...elementResponsive } =
      KiskadeeStyle.pickResponsiveProperties(elementStyle, [
        'borderTopLeftRadius',
        'borderTopRightRadius',
        'borderBottomLeftRadius',
        'borderBottomRightRadius',

        /**
         * Unique property needs to be last to override the others
         */
        'borderRadius',
      ]);

    return KiskadeeStyle.render({
      ...elementRest,
      ...elementResponsive,
    });
  }

  getStyleEssential<T extends CSSProperties>(element: string): T {
    return this.cache([element, 'essential'], () => {
      const base = this.componentSchema?.[element];
      const type = base?.light?.default?.type?.[this.type];
      const variant = type?.variant?.[this.variant];

      return {
        ...base?.light?.default?.base?.rest?.md,
        ...type?.base?.md,
        ...variant?.rest?.md,
      } as T;
    });
  }

  getStyleState(element: string, state: string, size?: Size): CSSProperties {
    const sizeValue = size || this.size || 'md';
    return this.cache([element, state, sizeValue], () => {
      const base = this.componentSchema?.[element];
      const type = base?.light?.default?.type?.[this.type];
      const variant = type?.variant?.[this.variant];

      return {
        ...base?.light?.default?.base?.[state]?.md,
        ...base?.light?.default?.base?.[state]?.[sizeValue],
        ...variant?.[state]?.md,
        ...variant?.[state]?.[sizeValue],
      };
    });
  }

  getStyleDark<T>(element: string): T {
    return this.cache([element, 'dark'], () => {
      // @ts-ignore
      const base = this.componentSchema?.[element];
      const type = base?.dark?.default?.type?.[this.type];
      const variant = type?.variant?.[this.variant];

      return {
        ...base?.dark?.default?.base?.rest?.md,
        ...type?.base?.md,
        ...variant?.rest?.md,
      } as T;
    });
  }

  getResponsiveStyle(
    element: string,
    state?: string
  ): {
    [mediaQuery: string]: GenericCSSProperties;
  } {
    return this.cache(
      [element, 'responsive', this.size || 'md', state || '-'],
      () => {
        const responsive: { [mediaQuery: string]: GenericCSSProperties } = {};

        if (this.size) {
          // TODO: remove ts-ignore
          responsive['@media (min-width: 0px)'] = {
            // @ts-ignores
            ...this.getStyleEssential(element),
            // @ts-ignore
            ...(!this.size || this.size === 'md'
              ? // @ts-ignore
                {}
              : this.getStyleSize(element, this.size)),
            // @ts-ignore
            ...(state ? this.getStyleState(element, state) : {}),
          };
        } else {
          for (const breakpoint of Object.keys(this.responsiveOption || {})) {
            const size = this.responsiveOption?.[breakpoint as Breakpoint];
            if (size) {
              responsive[
                `@media (min-width: ${
                  this.responsive[breakpoint as Breakpoint]
                }px)`
              ] =
                size === 'md'
                  ? {
                      ...this.getStyleEssential(element),
                      ...(state
                        ? this.getStyleState(element, state, size)
                        : {}),
                    }
                  : {
                      ...this.getStyleSize(element, size),
                      ...(state
                        ? this.getStyleState(element, state, size)
                        : {}),
                    };
            }
          }
        }

        return responsive;
      }
    );
  }

  getStyleSize<T>(element: string, size: Exclude<Size, 'md'>): T {
    return this.cache([element, size], () => {
      // @ts-ignore
      const base = this.componentSchema?.[element];
      const type = base?.light?.default?.type?.[this.type];
      const variant = type?.variant?.[this.variant];

      return {
        ...base?.light?.default?.base?.rest?.[size],
        ...type?.base?.[size],
        ...variant?.rest?.[size],
      } as T;
    });
  }

  getContrastStyle(element: string, state?: string): ContrastStyle {
    return this.cache([element, 'contrast', state || '-'], () => {
      const responsive: ContrastStyle = {};

      const light: CSSProperties = {
        ...this.getStyleEssential(element),
        ...(state ? this.getStyleState(element, state) : {}),
      };

      const dark: CSSProperties = {
        ...light,
        ...this.getStyleDark(element),
      };

      if (!this.info?.themeMode?.only) {
        responsive.contrastMode = dark;
      }

      responsive.defaultMode =
        this.info?.themeMode?.only === 'dark' ? dark : light;

      return responsive;
    });
  }

  // Property Style ------------------------------------------------------------

  propertyBackgroundStyle(
    element: string,
    status?: string
  ): string | undefined {
    return this.cache([element, 'background', status || '-'], () => {
      const style = this.getContrastStyle(element, status);

      return KiskadeeStyle.render({
        background: style.defaultMode?.background,

        '@media (prefers-color-scheme: dark)': style && {
          // @ts-ignore
          color: style.contrastMode?.background,
        },
      });
    });
  }

  static pickResponsiveProperties(
    responsive: {
      [mediaQuery: string]: GenericCSSProperties;
    },
    properties: string[]
  ): {
    [mediaQuery: string]: GenericCSSProperties;
  } {
    const newObject: {
      [mediaQuery: string]: GenericCSSProperties;
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

  propertyBorderStyle(element: string, status?: string): string | undefined {
    return this.cache([element, 'border', status || '-'], () => {
      const { defaultMode, contrastMode } = this.getContrastStyle(
        element,
        status
      );

      return KiskadeeStyle.render({
        border: defaultMode?.border || '0px solid transparent',

        ...(defaultMode?.border === 'none'
          ? {}
          : {
              borderColor: defaultMode?.borderColor,
              borderStyle: defaultMode?.borderStyle,
              borderWidth: defaultMode?.borderWidth,

              '@media (prefers-color-scheme: dark)': contrastMode
                ? {
                    borderColor: contrastMode.borderColor,
                    borderStyle: contrastMode.borderStyle,
                    borderWidth: contrastMode.borderWidth,
                  }
                : undefined,
            }),
      });
    });
  }
}
