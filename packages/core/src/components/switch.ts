import type { SegmentName } from '../types/colors/colors.types.ts';
import type {
  SwitchInputElementStyleFromSchema,
  SwitchLabelElementStyleFromSchema,
  SwitchOptionsFromSchema,
  SwitchRootElementStyleFromSchema,
  SwitchStateElementStyleFromSchema,
  SwitchThumbElementStyleFromSchema,
  SwitchTrackElementStyleFromSchema,
  SwitchVariantOptionsFromSchema
} from './switch.zod.ts';

/**
 * Switch elements canonical mapping:
 * - e1: root label/control wrapper
 * - e2: native input / semantic control target
 * - e3: track / surface
 * - e4: thumb / handle
 * - e5: optional label text
 * - e6: optional state text / icon layer
 */
export type SwitchElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';
export type SwitchVariant = 'standard';
export type SwitchStandardMode = 'base';
export type SwitchMode = SwitchStandardMode;
export type SwitchModeByVariant = {
  standard: SwitchStandardMode;
};

export type SwitchOptions = SwitchOptionsFromSchema;
export type SwitchVariantOptions = SwitchVariantOptionsFromSchema;

/**
 * e1 — root label/control wrapper
 * - non-visual headless root and state scope owner
 * - schema is intentionally name-only
 */
export type SwitchRootElementStyle = SwitchRootElementStyleFromSchema;

/**
 * e2 — native input / semantic control target
 * - optional effects only
 *
 * NOTE:
 * The input is expected to preserve accessibility/form behavior. Most visible styling should stay
 * on e3/e4.
 */
export type SwitchInputElementStyle = SwitchInputElementStyleFromSchema;

/**
 * e3 — track / surface
 * - boxColor / borderColor
 * - width, height, padding, border, radius
 */
export type SwitchTrackElementStyle<TSegmentName extends SegmentName = never> =
  SwitchTrackElementStyleFromSchema<TSegmentName>;

/**
 * e4 — thumb / handle
 * - boxColor / borderColor
 * - width, height, margins, border, radius
 */
export type SwitchThumbElementStyle<TSegmentName extends SegmentName = never> =
  SwitchThumbElementStyleFromSchema<TSegmentName>;

/**
 * e5 — optional label text
 * - textColor
 * - textSize / textHeight
 * - margins
 */
export type SwitchLabelElementStyle<TSegmentName extends SegmentName = never> =
  SwitchLabelElementStyleFromSchema<TSegmentName>;

/**
 * e6 — optional state text / icon layer
 * - textColor
 * - boxWidth / boxHeight
 * - textSize / textHeight
 * - margins
 */
export type SwitchStateElementStyle<TSegmentName extends SegmentName = never> =
  SwitchStateElementStyleFromSchema<TSegmentName>;

export type SwitchElements<TSegmentName extends SegmentName = never> = {
  // e1: root label/control wrapper
  e1?: SwitchRootElementStyle;
  // e2: native input / semantic control target
  e2?: SwitchInputElementStyle;
  // e3: track / surface
  e3?: SwitchTrackElementStyle<TSegmentName>;
  // e4: thumb / handle
  e4?: SwitchThumbElementStyle<TSegmentName>;
  // e5: optional label text
  e5?: SwitchLabelElementStyle<TSegmentName>;
  // e6: optional state text / icon layer
  e6?: SwitchStateElementStyle<TSegmentName>;
};

export type SwitchModeConfig<TSegmentName extends SegmentName = never> = {
  elements: SwitchElements<TSegmentName>;
};

export type SwitchStandardVariantConfig<TSegmentName extends SegmentName = never> = {
  options?: SwitchVariantOptions;
  modes: {
    base: SwitchModeConfig<TSegmentName>;
  };
};

export type SwitchVariants<TSegmentName extends SegmentName = never> = {
  standard: SwitchStandardVariantConfig<TSegmentName>;
};
