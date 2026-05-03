import type { BreakpointValue, ElementSizeValue } from '../../breakpoints.ts';

export type PixelValue = number; // px

export const SCALE_PROPERTIES = [
  // Text
  'textSize',
  'textHeight',
  // Padding
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  // Margin
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  // Box
  'boxHeight',
  'boxWidth',
  // Border
  'borderWidth',
  'borderRadiusRounded',
  'borderRadiusPill',
  'borderRadiusSquare',
  'borderRadius'
] as const;

export type ScaleProperty = (typeof SCALE_PROPERTIES)[number];

export const scaleProperties: ScaleProperty[] = [...SCALE_PROPERTIES];

export type ScaleByBreakpoint = Partial<Record<BreakpointValue, PixelValue>>;

export type BorderRadiusMode = 'rounded' | 'pill' | 'square';
export type ScaleBySize = Partial<Record<ElementSizeValue, ScaleByBreakpoint | PixelValue>>;
export type BorderRadiusScaleSchema = Partial<Record<BorderRadiusMode, ScaleBySize | PixelValue>>;

export type StandardScaleProperty = Exclude<
  ScaleProperty,
  'borderRadius' | 'borderRadiusRounded' | 'borderRadiusPill' | 'borderRadiusSquare'
>;

export type ScaleSchema = Partial<Record<StandardScaleProperty, ScaleBySize | PixelValue>> & {
  borderRadius?: BorderRadiusScaleSchema;
};
