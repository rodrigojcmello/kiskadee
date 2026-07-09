import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SliderActiveTrackOrigin,
  SliderEdgeMarkLabelAlignment,
  SliderMarks as SliderArtifactMarks,
  SliderEdgeMarkLabelPlacement,
  SliderEdgeMarks,
  SliderIntent,
  SliderMarkLabelPlacement,
  SliderMarkPlacement,
  SliderMode,
  SliderOriginMark,
  SliderSnapMotion,
  SliderThumbBehavior,
  SliderThumbEdgeBehavior,
  SliderThumbCrossing,
  SliderValueAnimation,
  SliderValueDisplay,
  SliderValueSummaryPlacement,
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
  | 'e15'
  | 'e16';

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
export type SliderMarkPlacementOption = SliderMarkPlacement;
export type SliderMarkLabelPlacementOption = SliderMarkLabelPlacement;
export type SliderResolvedMarkLabelPlacement = Exclude<SliderMarkLabelPlacementOption, 'auto'>;
export type SliderEdgeMarkLabelPlacementOption = SliderEdgeMarkLabelPlacement;
export type SliderResolvedEdgeMarkLabelPlacement = Exclude<
  SliderEdgeMarkLabelPlacementOption,
  'adaptive'
>;
export type SliderEdgeMarkLabelAlignmentOption = SliderEdgeMarkLabelAlignment;
export type SliderResolvedEdgeMarkLabelAlignment = Exclude<
  SliderEdgeMarkLabelAlignmentOption,
  'adaptive'
>;
export type SliderValueAnimationOption = SliderValueAnimation;
export type SliderValueSummaryPlacementOption = SliderValueSummaryPlacement;
export type SliderSnapMotionOption = SliderSnapMotion;
export type SliderThumbBehaviorOption = SliderThumbBehavior;
export type SliderThumbCrossingOption = SliderThumbCrossing;
export type SliderThumbEdgeBehaviorOption = SliderThumbEdgeBehavior;
export type SliderActiveTrackOriginOption = SliderActiveTrackOrigin;
export type SliderOriginMarkOption = SliderOriginMark;

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
  | 'onThumbInteractionSwitch'
  | 'thumbBehavior'
  | 'thumbCrossing'
  | 'thumbEdgeBehavior'
  | 'activeTrackOrigin'
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
  markStep?: number;
  edgeMarks?: SliderEdgeMarksOption;
  markPlacement?: SliderMarkPlacementOption;
  markLabelPlacement?: SliderMarkLabelPlacementOption;
  edgeMarkLabelPlacement?: SliderEdgeMarkLabelPlacementOption;
  edgeMarkLabelAlignment?: SliderEdgeMarkLabelAlignmentOption;
  thumbEdgeBehavior?: SliderThumbEdgeBehaviorOption;
  activeTrackOrigin?: SliderActiveTrackOriginOption;
  originMark?: SliderOriginMarkOption;
  valueDisplay?: SliderValueDisplay;
  valueSummaryPlacement?: SliderValueSummaryPlacementOption;
  valueSummaryWidth?: number;
  valueAnimation?: SliderValueAnimationOption;
  snapMotion?: SliderSnapMotionOption;
  thumbBehavior?: SliderThumbBehaviorOption;
  thumbCrossing?: SliderThumbCrossingOption;
  activationFeedback?: SliderActivationFeedback;
  formatValue?: (value: number, index: 0 | 1) => ReactNode;
  thumbAriaLabels?: SliderThumbAriaLabels;
  thumbAriaLabelledBy?: SliderThumbAriaLabelledBy;
};
