import type { RadiusMode } from '../schema';
import type { SegmentName } from '../types/colors/colors.types';
import type {
  TextFieldControlElementStyleFromSchema,
  TextFieldIndicatorElementStyleFromSchema,
  TextFieldInputElementStyleFromSchema,
  TextFieldLabelElementStyleFromSchema,
  TextFieldMessageElementStyleFromSchema,
  TextFieldModeOptionsFromSchema,
  TextFieldOptionsFromSchema,
  TextFieldRootElementStyleFromSchema
} from './text-field.zod';

/**
 * TextField elements canonical mapping:
 * - e1: root wrapper
 * - e2: label
 * - e3: control shell
 * - e4: input
 * - e5: validation/supporting message
 * - e6: indicator layer
 */
export type TextFieldElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';
export type TextFieldVariant = 'standard' | 'floating';
export type TextFieldStandardMode = 'outline' | 'underline' | 'borderless';
export type TextFieldFloatingMode = 'notched' | 'inside';
export type TextFieldMode = TextFieldStandardMode | TextFieldFloatingMode;
export type TextFieldValidationStatus = 'error' | 'warning';
export type TextFieldModeByVariant = {
  standard: TextFieldStandardMode;
  floating: TextFieldFloatingMode;
};
export type TextFieldLabelOffsetStrategy = 'schema' | 'radius' | 'input-start' | 'none';
export type TextFieldLabelOffsetByRadius = Partial<
  Record<RadiusMode, TextFieldLabelOffsetStrategy>
>;

export type TextFieldOptions = TextFieldOptionsFromSchema;
export type TextFieldModeOptions = TextFieldModeOptionsFromSchema;

/**
 * e1 — root wrapper
 * - optional width scale
 */
export type TextFieldRootElementStyle = TextFieldRootElementStyleFromSchema;

/**
 * e2 — label
 * - textColor
 * - textSize / textHeight
 * - marginBottom for standard spacing
 * - optional marginTop / marginLeft / paddingRight / paddingLeft for floating label geometry
 */
export type TextFieldLabelElementStyle<TSegmentName extends SegmentName = never> =
  TextFieldLabelElementStyleFromSchema<TSegmentName>;

/**
 * e3 — control shell
 * - boxColor / borderColor
 * - padding, boxHeight, borderWidth, borderRadius
 */
export type TextFieldControlElementStyle<TSegmentName extends SegmentName = never> =
  TextFieldControlElementStyleFromSchema<TSegmentName>;

/**
 * e4 — input text
 * - textColor
 * - textSize / textHeight
 * - optional paddingTop for floating inside input positioning
 */
export type TextFieldInputElementStyle<TSegmentName extends SegmentName = never> =
  TextFieldInputElementStyleFromSchema<TSegmentName>;

/**
 * e5 — validation/supporting message
 * - textColor
 * - textSize / textHeight
 * - marginTop
 */
export type TextFieldMessageElementStyle<TSegmentName extends SegmentName = never> =
  TextFieldMessageElementStyleFromSchema<TSegmentName>;

/**
 * e6 — indicator layer
 * - boxHeight
 * - boxColor
 *
 * NOTE:
 * This is a visual layer inside the control shell. It is intended for underline/focus treatments
 * that must not compete with input padding or layout geometry.
 */
export type TextFieldIndicatorElementStyle<TSegmentName extends SegmentName = never> =
  TextFieldIndicatorElementStyleFromSchema<TSegmentName>;

export type TextFieldElements<TSegmentName extends SegmentName = never> = {
  // e1: root wrapper
  e1?: TextFieldRootElementStyle;
  // e2: label
  e2?: TextFieldLabelElementStyle<TSegmentName>;
  // e3: control shell
  e3?: TextFieldControlElementStyle<TSegmentName>;
  // e4: input
  e4?: TextFieldInputElementStyle<TSegmentName>;
  // e5: validation/supporting message
  e5?: TextFieldMessageElementStyle<TSegmentName>;
  // e6: indicator layer
  e6?: TextFieldIndicatorElementStyle<TSegmentName>;
};

export type TextFieldVariantConfig = {
  options?: {
    mode?: TextFieldMode;
  };
};

export type TextFieldModeConfig<TSegmentName extends SegmentName = never> = {
  options?: TextFieldModeOptions;
  elements: TextFieldElements<TSegmentName>;
};

export type TextFieldStandardVariantConfig<TSegmentName extends SegmentName = never> =
  TextFieldVariantConfig & {
    options?: {
      mode?: TextFieldStandardMode;
    };
    modes: Partial<{
      outline: TextFieldModeConfig<TSegmentName>;
      underline: TextFieldModeConfig<TSegmentName>;
      borderless: TextFieldModeConfig<TSegmentName>;
    }>;
  };

export type TextFieldFloatingVariantConfig<TSegmentName extends SegmentName = never> =
  TextFieldVariantConfig & {
    options?: {
      mode?: TextFieldFloatingMode;
    };
    modes: Partial<{
      notched: TextFieldModeConfig<TSegmentName>;
      inside: TextFieldModeConfig<TSegmentName>;
    }>;
  };

export type TextFieldVariants<TSegmentName extends SegmentName = never> = Partial<{
  standard: TextFieldStandardVariantConfig<TSegmentName>;
  floating: TextFieldFloatingVariantConfig<TSegmentName>;
}>;
