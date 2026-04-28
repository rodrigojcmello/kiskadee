import type { SegmentName } from '../types/colors/colors.types';
import type {
  TextFieldControlElementStyleFromSchema,
  TextFieldInputElementStyleFromSchema,
  TextFieldLabelElementStyleFromSchema,
  TextFieldMessageElementStyleFromSchema,
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
 */
export type TextFieldElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';
export type TextFieldVariant = 'standard' | 'floating';
export type TextFieldValidationStatus = 'error' | 'warning';

export type TextFieldOptions = TextFieldOptionsFromSchema;

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
};

export type TextFieldVariantConfig<TSegmentName extends SegmentName = never> = {
  elements: TextFieldElements<TSegmentName>;
};

export type TextFieldVariants<TSegmentName extends SegmentName = never> = Partial<{
  standard: TextFieldVariantConfig<TSegmentName>;
  floating: TextFieldVariantConfig<TSegmentName>;
}>;
