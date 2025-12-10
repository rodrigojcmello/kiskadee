// Font Family -------------------------------------------------------------------------------------

/** Represents the name of a font family. */
export type TextFontValue = 'body' | 'heading' | 'code';

// Text Italic -------------------------------------------------------------------------------------

/** Defines whether the text should be italic. */
export type TextItalicValue = boolean;

/** Represents the boolean value of 'textItalic' in string format, used within a styleKey. */
export type TextItalicKeyToken = 'true' | 'false';

/** Defines the possible values for the CSS `font-style` property. */
export type CssFontStyleValue = 'normal' | 'italic';

// Text Weight -------------------------------------------------------------------------------------

/** Represents the allowed font weight values, derived from the keys of the `CssTextWeightValue` enum. */
export type TextWeightValue = keyof typeof CssTextWeightValue;

/** Maps human-readable font weight names to their corresponding numeric CSS `font-weight` values. */
export enum CssTextWeightValue {
  thin = '100',
  extraLight = '200',
  light = '300',
  normal = '400',
  medium = '500',
  semiBold = '600',
  bold = '700',
  extraBold = '800',
  black = '900'
}

// Text Decoration ---------------------------------------------------------------------------------

// TODO: Should "underline dotted", "overline" and "underline dotted red" be supported?
// TODO: Where is the default value defined?
/** Defines the possible text decoration styles. */
export type TextLineTypeProperty = 'textLineType';
export type TextLineTypeValue = keyof typeof CssTextDecorationValue;

/** Maps custom text decoration values to the standard CSS `text-decoration` property values. */
export enum CssTextDecorationValue {
  none = 'none', // Default
  underline = 'underline',
  lineThrough = 'line-through'
}

// Text Align --------------------------------------------------------------------------------------

// TODO: Should "right" be the default in languages read from right to left, such as Japanese?
// TODO: I'm not sure if the "justify" value will actually be used
// TODO: What does "default" mean? So far there is no specific treatment for that

/** Defines the possible horizontal alignment options for text. */
export type TextAlignValue = keyof typeof CssTextAlignValue;

/** Maps text alignment values to the standard CSS `text-align` property values. */
export enum CssTextAlignValue {
  left = 'left', // Default
  center = 'center',
  right = 'right',
  justify = 'justify'
}

// Border Style ------------------------------------------------------------------------------------

/** Defines the possible styles for a border. */
export type BorderStyleValue = keyof typeof CssBorderStyleValue;

/** Maps border style values to the standard CSS `border-style` property values. */
export enum CssBorderStyleValue {
  none = 'none', // Default
  dotted = 'dotted',
  dashed = 'dashed',
  solid = 'solid'
}

// Appearance --------------------------------------------------------------------------------------

export enum CssDecorationProperty {
  textFont = 'font-family',
  textItalic = 'font-style',
  textWeight = 'font-weight',
  textLineType = 'text-decoration',
  textAlign = 'text-align',
  borderStyle = 'border-style'
}

export type DecorationProperty = keyof typeof CssDecorationProperty;

/**
 * Appearance represents style properties that are solid in nature – meaning they do not vary with
 * interaction state (rest, hover, active) nor are they influenced by responsive size or media-query
 * adjustments.
 *
 * This category includes text settings (italic, weight, decoration, transform, align), cursor
 * styles, border styles, and other properties that define the overall look rather than behavior.
 *
 * Note: Shadow properties are included in Appearance even though they may change on interaction
 * state (for example, more pronounced on hover) because a shadow doesn't necessarily represent a
 * color. Shadows are often defined by simple numeric values (blur, offset) and sometimes a color;
 * however, their dynamic behavior is specific to rendering.
 */
export interface DecorationSchema {
  textFont?: TextFontValue;
  textItalic?: TextItalicValue;
  textWeight?: TextWeightValue;
  textLineType?: TextLineTypeValue;
  textAlign?: TextAlignValue;
  borderStyle?: BorderStyleValue;
}
