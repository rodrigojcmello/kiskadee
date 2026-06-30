import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SliderMarks as SliderArtifactMarks,
  SliderEdgeMarks,
  SliderIntent,
  SliderMode,
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
  | 'e14';

export type SliderClassNames = Partial<Record<SliderElementName, string>>;

export type SliderClassesMap = Partial<Record<SliderElementName, ClassNameByElementJSON>>;

export type SliderModeClassesMap = Partial<Record<SliderMode, SliderClassesMap>>;

export type SliderVariantClassesMap = Partial<Record<SliderVariant, SliderModeClassesMap>>;

export type SliderStatus = HeadlessSliderStatus;

export type SliderEndpoint = {
  icon?: ReactNode;
  label?: ReactNode;
};

export type SliderEndpoints = {
  start?: SliderEndpoint;
  end?: SliderEndpoint;
};

export type SliderMark = {
  value: number;
  label?: ReactNode;
};

export type SliderMarks = false | SliderArtifactMarks | readonly SliderMark[];
export type SliderEdgeMarksOption = SliderEdgeMarks;

export type SliderThumbAriaLabels = {
  start?: string;
  end?: string;
};

export type SliderThumbAriaLabelledBy = {
  start?: string;
  end?: string;
};

export type SliderProps = Omit<
  HeadlessSliderRootProps,
  'children' | 'classNames' | 'labelId' | 'describedBy' | 'formatValue'
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
  endpoints?: SliderEndpoints;
  marks?: SliderMarks;
  edgeMarks?: SliderEdgeMarksOption;
  valueDisplay?: SliderValueDisplay;
  formatValue?: (value: number, index: 0 | 1) => ReactNode;
  thumbAriaLabels?: SliderThumbAriaLabels;
  thumbAriaLabelledBy?: SliderThumbAriaLabelledBy;
};
