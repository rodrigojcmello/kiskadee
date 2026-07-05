import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SliderEdgeMarkLabelAlignment,
  SliderMarks as SliderArtifactMarks,
  SliderEdgeMarkLabelPlacement,
  SliderEdgeMarks,
  SliderIntent,
  SliderMarkLabelPlacement,
  SliderMode,
  SliderValueAnimation,
  SliderValueDisplay,
  SliderVariant
} from '@kiskadee/core';
import type {
  SliderRootProps as HeadlessSliderRootProps,
  SliderStatus as HeadlessSliderStatus,
  SliderValue,
  SliderValueMode
} from '@kiskadee/react-headless';
import type { ReactNode } from 'react';

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
  | 'e14'
  | 'e15';

export type SliderClassNames = Partial<Record<SliderElementName, string>>;

export type SliderClassesMap = Partial<Record<SliderElementName, ClassNameByElementJSON>>;

export type SliderModeClassesMap = Partial<Record<SliderMode, SliderClassesMap>>;

export type SliderVariantClassesMap = Partial<Record<SliderVariant, SliderModeClassesMap>>;

export type SliderStatus = HeadlessSliderStatus;

export type SliderMark = {
  value: number;
  label?: ReactNode;
  icon?: ReactNode;
};

export type SliderMarks = false | SliderArtifactMarks | readonly SliderMark[];
export type SliderEdgeMarksOption = SliderEdgeMarks;
export type SliderMarkLabelPlacementOption = SliderMarkLabelPlacement;
export type SliderResolvedMarkLabelPlacement = Exclude<SliderMarkLabelPlacementOption, 'auto'>;
export type SliderEdgeMarkLabelPlacementOption = SliderEdgeMarkLabelPlacement;
export type SliderResolvedEdgeMarkLabelPlacement = Exclude<
  SliderEdgeMarkLabelPlacementOption,
  'auto'
>;
export type SliderEdgeMarkLabelAlignmentOption = SliderEdgeMarkLabelAlignment;
export type SliderResolvedEdgeMarkLabelAlignment = Exclude<
  SliderEdgeMarkLabelAlignmentOption,
  'auto'
>;
export type SliderValueAnimationOption = SliderValueAnimation;

export type SliderThumbAriaLabels = {
  start?: string;
  end?: string;
};

export type SliderThumbAriaLabelledBy = {
  start?: string;
  end?: string;
};

export type SliderActivationFeedback = false | 'active';

export type SliderProps = Omit<
  HeadlessSliderRootProps,
  | 'children'
  | 'classNames'
  | 'labelId'
  | 'describedBy'
  | 'formatValue'
  | 'onThumbInteractionCancel'
  | 'onThumbInteractionEnd'
  | 'onThumbInteractionStart'
> & {
  id?: string;
  label?: ReactNode;
  labelAdornment?: ReactNode;
  helperText?: ReactNode;
  className?: string;
  classNames?: SliderClassNames;
  scale?: ElementSizeValue;
  emphasis?: ComponentEmphasis;
  intent?: SliderIntent;
  radius?: RadiusMode;
  variant?: SliderVariant;
  mode?: SliderMode;
  valueMode?: SliderValueMode;
  value?: SliderValue;
  defaultValue?: SliderValue;
  marks?: SliderMarks;
  edgeMarks?: SliderEdgeMarksOption;
  markLabelPlacement?: SliderMarkLabelPlacementOption;
  edgeMarkLabelPlacement?: SliderEdgeMarkLabelPlacementOption;
  edgeMarkLabelAlignment?: SliderEdgeMarkLabelAlignmentOption;
  valueDisplay?: SliderValueDisplay;
  valueAnimation?: SliderValueAnimationOption;
  activationFeedback?: SliderActivationFeedback;
  formatValue?: (value: number, index: 0 | 1) => ReactNode;
  thumbAriaLabels?: SliderThumbAriaLabels;
  thumbAriaLabelledBy?: SliderThumbAriaLabelledBy;
};
