import type { SegmentName } from '../types/colors/colors.types.ts';
import type {
  SwitchActivationMotionSchemaValue,
  SwitchControlTextVisibilitySchemaValue,
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
 * - e2: track / surface
 * - e3: thumb / handle
 * - e4: optional label text
 * - e5: optional control text
 */
export type SwitchElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';
export type SwitchVariant = 'standard';
export type SwitchStandardMode = 'base';
export type SwitchMode = SwitchStandardMode;
export type SwitchActivationMotion = SwitchActivationMotionSchemaValue;
export type SwitchControlTextVisibility = SwitchControlTextVisibilitySchemaValue;
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
 * e2 — track / surface
 * - boxColor / borderColor
 * - width, height, padding, border, radius
 */
export type SwitchTrackElementStyle<TSegmentName extends SegmentName = never> =
  SwitchTrackElementStyleFromSchema<TSegmentName>;

/**
 * e3 — thumb / handle
 * - boxColor / borderColor
 * - width, height, margins, border, radius
 */
export type SwitchThumbElementStyle<TSegmentName extends SegmentName = never> =
  SwitchThumbElementStyleFromSchema<TSegmentName>;

/**
 * e4 — optional label text
 * - textColor
 * - textSize / textHeight
 * - margins
 */
export type SwitchLabelElementStyle<TSegmentName extends SegmentName = never> =
  SwitchLabelElementStyleFromSchema<TSegmentName>;

/**
 * e5 — optional control text
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
  // e2: track / surface
  e2?: SwitchTrackElementStyle<TSegmentName>;
  // e3: thumb / handle
  e3?: SwitchThumbElementStyle<TSegmentName>;
  // e4: optional label text
  e4?: SwitchLabelElementStyle<TSegmentName>;
  // e5: optional control text
  e5?: SwitchStateElementStyle<TSegmentName>;
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
