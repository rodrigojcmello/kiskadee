import type { SegmentName } from '../types/colors/colors.types.ts';
import type {
  SliderActiveTrackElementStyleFromSchema,
  SliderControlRowElementStyleFromSchema,
  SliderEndpointElementStyleFromSchema,
  SliderEndpointIconElementStyleFromSchema,
  SliderEndpointLabelElementStyleFromSchema,
  SliderFieldLabelElementStyleFromSchema,
  SliderHelperTextElementStyleFromSchema,
  SliderMarkElementStyleFromSchema,
  SliderMarkLabelElementStyleFromSchema,
  SliderEdgeMarksSchemaValue,
  SliderMarksSchemaValue,
  SliderOptionsFromSchema,
  SliderRootElementStyleFromSchema,
  SliderThumbElementStyleFromSchema,
  SliderTrackElementStyleFromSchema,
  SliderValueDisplaySchemaValue,
  SliderValueIndicatorElementStyleFromSchema,
  SliderValueSummaryElementStyleFromSchema,
  SliderVariantOptionsFromSchema
} from './slider.zod.ts';

/**
 * Slider elements canonical mapping:
 * - e1: root state and field wrapper
 * - e2: field label
 * - e3: value summary
 * - e4: control row
 * - e5: endpoint wrapper
 * - e6: endpoint icon
 * - e7: endpoint label
 * - e8: track
 * - e9: active track / selected range
 * - e10: thumb / handle
 * - e11: value indicator / tooltip
 * - e12: mark / tick
 * - e13: mark label
 * - e14: helper text
 */
export type SliderElementName =
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'e9'
  | 'e10'
  | 'e11'
  | 'e12'
  | 'e13'
  | 'e14';

export type SliderVariant = 'standard';
export type SliderStandardMode = 'base';
export type SliderMode = SliderStandardMode;
export type SliderValueDisplay = SliderValueDisplaySchemaValue;
export type SliderMarks = SliderMarksSchemaValue;
export type SliderEdgeMarks = SliderEdgeMarksSchemaValue;
export type SliderModeByVariant = {
  standard: SliderStandardMode;
};

export type SliderOptions = SliderOptionsFromSchema;
export type SliderVariantOptions = SliderVariantOptionsFromSchema;

/**
 * e1 — root state and field wrapper
 * - non-visual headless root and state scope owner
 */
export type SliderRootElementStyle = SliderRootElementStyleFromSchema;

/**
 * e2 — field label
 * - textColor
 * - textSize / textHeight
 * - margins
 */
export type SliderFieldLabelElementStyle<TSegmentName extends SegmentName = never> =
  SliderFieldLabelElementStyleFromSchema<TSegmentName>;

/**
 * e3 — value summary
 * - textColor
 * - textSize / textHeight
 * - margins
 */
export type SliderValueSummaryElementStyle<TSegmentName extends SegmentName = never> =
  SliderValueSummaryElementStyleFromSchema<TSegmentName>;

/**
 * e4 — control row
 * - non-visual layout row for endpoints and track
 * - marginTop defines the conditional gap below the header row
 */
export type SliderControlRowElementStyle = SliderControlRowElementStyleFromSchema;

/**
 * e5 — endpoint wrapper
 * - non-visual endpoint composition wrapper
 * - marginLeft / marginRight define endpoint-to-track spacing
 */
export type SliderEndpointElementStyle = SliderEndpointElementStyleFromSchema;

/**
 * e6 — endpoint icon
 * - textColor maps to CSS color for currentColor-driven icons
 * - boxWidth / boxHeight define the icon slot box
 */
export type SliderEndpointIconElementStyle<TSegmentName extends SegmentName = never> =
  SliderEndpointIconElementStyleFromSchema<TSegmentName>;

/**
 * e7 — endpoint label
 * - textColor
 * - textSize / textHeight
 * - margins
 */
export type SliderEndpointLabelElementStyle<TSegmentName extends SegmentName = never> =
  SliderEndpointLabelElementStyleFromSchema<TSegmentName>;

/**
 * e8 — track
 * - boxColor / borderColor
 * - width, height, padding, border, radius
 * - boxWidth is consumed structurally as the minimum useful inline size
 */
export type SliderTrackElementStyle<TSegmentName extends SegmentName = never> =
  SliderTrackElementStyleFromSchema<TSegmentName>;

/**
 * e9 — active track / selected range
 * - boxColor / borderColor
 * - width, height, padding, border, radius
 */
export type SliderActiveTrackElementStyle<TSegmentName extends SegmentName = never> =
  SliderActiveTrackElementStyleFromSchema<TSegmentName>;

/**
 * e10 — thumb / handle
 * - boxColor / borderColor
 * - width, height, margins, border, radius
 */
export type SliderThumbElementStyle<TSegmentName extends SegmentName = never> =
  SliderThumbElementStyleFromSchema<TSegmentName>;

/**
 * e11 — value indicator / tooltip
 * - boxColor / borderColor / textColor
 * - height, padding, text size, marginBottom, border, radius
 */
export type SliderValueIndicatorElementStyle<TSegmentName extends SegmentName = never> =
  SliderValueIndicatorElementStyleFromSchema<TSegmentName>;

/**
 * e12 — mark / tick
 * - boxColor / borderColor
 * - width, height, border, radius
 */
export type SliderMarkElementStyle<TSegmentName extends SegmentName = never> =
  SliderMarkElementStyleFromSchema<TSegmentName>;

/**
 * e13 — mark label
 * - textColor
 * - textSize / textHeight
 * - margins
 */
export type SliderMarkLabelElementStyle<TSegmentName extends SegmentName = never> =
  SliderMarkLabelElementStyleFromSchema<TSegmentName>;

/**
 * e14 — helper text
 * - textColor
 * - textSize / textHeight
 * - margins
 */
export type SliderHelperTextElementStyle<TSegmentName extends SegmentName = never> =
  SliderHelperTextElementStyleFromSchema<TSegmentName>;

export type SliderElements<TSegmentName extends SegmentName = never> = {
  // e1: root state and field wrapper
  e1?: SliderRootElementStyle;
  // e2: field label
  e2?: SliderFieldLabelElementStyle<TSegmentName>;
  // e3: value summary
  e3?: SliderValueSummaryElementStyle<TSegmentName>;
  // e4: control row
  e4?: SliderControlRowElementStyle;
  // e5: endpoint wrapper
  e5?: SliderEndpointElementStyle;
  // e6: endpoint icon
  e6?: SliderEndpointIconElementStyle<TSegmentName>;
  // e7: endpoint label
  e7?: SliderEndpointLabelElementStyle<TSegmentName>;
  // e8: track
  e8?: SliderTrackElementStyle<TSegmentName>;
  // e9: active track / selected range
  e9?: SliderActiveTrackElementStyle<TSegmentName>;
  // e10: thumb / handle
  e10?: SliderThumbElementStyle<TSegmentName>;
  // e11: value indicator / tooltip
  e11?: SliderValueIndicatorElementStyle<TSegmentName>;
  // e12: mark / tick
  e12?: SliderMarkElementStyle<TSegmentName>;
  // e13: mark label
  e13?: SliderMarkLabelElementStyle<TSegmentName>;
  // e14: helper text
  e14?: SliderHelperTextElementStyle<TSegmentName>;
};

export type SliderModeConfig<TSegmentName extends SegmentName = never> = {
  elements: SliderElements<TSegmentName>;
};

export type SliderStandardVariantConfig<TSegmentName extends SegmentName = never> = {
  options?: SliderVariantOptions;
  modes: {
    base: SliderModeConfig<TSegmentName>;
  };
};

export type SliderVariants<TSegmentName extends SegmentName = never> = {
  standard: SliderStandardVariantConfig<TSegmentName>;
};
