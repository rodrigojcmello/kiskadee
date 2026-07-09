import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SliderMarks as SliderArtifactMarks,
  SliderEdgeLabelAlignment,
  SliderEdgeLabelPlacement,
  SliderEdgeMarks,
  SliderFillOrigin,
  SliderFillOriginMark,
  SliderIntent,
  SliderMarkLabelPlacement,
  SliderMarkPlacement,
  SliderMode,
  SliderSnapAnimation,
  SliderThumbCrossing,
  SliderThumbEdge,
  SliderThumbStepBehavior,
  SliderValueAnimation,
  SliderValueDisplay,
  SliderValueSummaryPlacement,
  SliderVariant
} from '@kiskadee/core';
import type {
  SliderInteractionValueChangeDetails as HeadlessSliderInteractionValueChangeDetails,
  SliderRootProps as HeadlessSliderRootProps,
  SliderSelectionMode as HeadlessSliderSelectionMode,
  SliderStatus as HeadlessSliderStatus,
  SliderThumbIconRenderDetails as HeadlessSliderThumbIconRenderDetails,
  SliderValue
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
  | 'e16'
  | 'e17'
  | 'e18'
  | 'e19';

export type SliderClassNames = Partial<Record<SliderElementName, string>>;

export type SliderClassesMap = Partial<Record<SliderElementName, ClassNameByElementJSON>>;

export type SliderModeClassesMap = Partial<Record<SliderMode, SliderClassesMap>>;

export type SliderVariantClassesMap = Partial<Record<SliderVariant, SliderModeClassesMap>>;

export type SliderStatus = HeadlessSliderStatus;
export type SliderSelectionMode = HeadlessSliderSelectionMode;

export type SliderMark = {
  value: number;
  label?: ReactNode;
  icon?: ReactNode;
};

export type SliderMarks = SliderArtifactMarks | readonly SliderMark[];
export type SliderEdgeMarksOption = SliderEdgeMarks;
export type SliderMarkPlacementOption = SliderMarkPlacement;
export type SliderMarkLabelPlacementOption = SliderMarkLabelPlacement;
export type SliderResolvedMarkLabelPlacement = Exclude<SliderMarkLabelPlacementOption, 'adaptive'>;
export type SliderEdgeLabelPlacementOption = SliderEdgeLabelPlacement;
export type SliderResolvedEdgeLabelPlacement = Exclude<SliderEdgeLabelPlacementOption, 'adaptive'>;
export type SliderEdgeLabelAlignmentOption = SliderEdgeLabelAlignment;
export type SliderResolvedEdgeLabelAlignment = Exclude<SliderEdgeLabelAlignmentOption, 'adaptive'>;
export type SliderValueAnimationOption = SliderValueAnimation;
export type SliderValueSummaryPlacementOption = SliderValueSummaryPlacement;
export type SliderSnapAnimationOption = SliderSnapAnimation;
export type SliderThumbStepBehaviorOption = SliderThumbStepBehavior;
export type SliderThumbCrossingOption = SliderThumbCrossing;
export type SliderThumbEdgeOption = SliderThumbEdge;
export type SliderFillOriginOption = SliderFillOrigin;
export type SliderFillOriginMarkOption = SliderFillOriginMark;

export type SliderThumbAriaLabels = {
  start?: string;
  end?: string;
};

export type SliderThumbAriaLabelledBy = {
  start?: string;
  end?: string;
};

export type SliderActivationFeedback = false | 'active';
export type SliderInteractionValueChangeDetails = HeadlessSliderInteractionValueChangeDetails;
export type SliderThumbIconDetails = HeadlessSliderThumbIconRenderDetails;
export type SliderThumbIcon = ReactNode | ((details: SliderThumbIconDetails) => ReactNode);

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
  | 'thumbStepBehavior'
  | 'thumbCrossing'
  | 'thumbEdge'
  | 'fillOrigin'
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
  selectionMode?: SliderSelectionMode;
  value?: SliderValue;
  defaultValue?: SliderValue;
  marks?: SliderMarks;
  markInterval?: number;
  edgeMarks?: SliderEdgeMarksOption;
  markPlacement?: SliderMarkPlacementOption;
  markLabelPlacement?: SliderMarkLabelPlacementOption;
  edgeLabelPlacement?: SliderEdgeLabelPlacementOption;
  edgeLabelAlignment?: SliderEdgeLabelAlignmentOption;
  thumbEdge?: SliderThumbEdgeOption;
  fillOrigin?: SliderFillOriginOption;
  fillOriginMark?: SliderFillOriginMarkOption;
  valueDisplay?: SliderValueDisplay;
  valueSummaryPlacement?: SliderValueSummaryPlacementOption;
  valueSummaryWidth?: number;
  valueAnimation?: SliderValueAnimationOption;
  snapAnimation?: SliderSnapAnimationOption;
  thumbStepBehavior?: SliderThumbStepBehaviorOption;
  thumbCrossing?: SliderThumbCrossingOption;
  activationFeedback?: SliderActivationFeedback;
  formatValue?: (value: number, index: 0 | 1) => ReactNode;
  thumbIcon?: SliderThumbIcon;
  thumbAriaLabels?: SliderThumbAriaLabels;
  thumbAriaLabelledBy?: SliderThumbAriaLabelledBy;
};
