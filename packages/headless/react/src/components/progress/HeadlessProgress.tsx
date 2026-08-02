import type { ComponentPropsWithoutRef, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { createContext, forwardRef, useContext, useEffect, useMemo } from 'react';

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

export type ProgressElementName = 'e1' | 'e2' | 'e3';
export type ProgressMode = 'determinate' | 'indeterminate';

export type ProgressClassNames = Partial<Record<ProgressElementName, string>>;

type ProgressRootSpanProps = Omit<
  ComponentPropsWithoutRef<'span'>,
  | 'aria-hidden'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-valuemax'
  | 'aria-valuemin'
  | 'aria-valuenow'
  | 'aria-valuetext'
  | 'children'
  | 'className'
  | 'role'
>;

type ProgressAccessibleNameProps =
  | {
      'aria-label': string;
      'aria-labelledby'?: string;
    }
  | {
      'aria-label'?: never;
      'aria-labelledby': string;
    };

type ProgressSemanticStateProps = ProgressAccessibleNameProps & {
  decorative?: false;
  'aria-hidden'?: never;
  'aria-valuetext'?: string;
};

type ProgressDecorativeStateProps = {
  decorative: true;
  'aria-hidden'?: never;
  'aria-label'?: never;
  'aria-labelledby'?: never;
  'aria-valuetext'?: never;
};

type ProgressRootCommonProps = ProgressRootSpanProps & {
  children?: ReactNode;
  classNames?: ProgressClassNames;
};

export type ProgressDeterminateRootProps = ProgressRootCommonProps & {
  mode?: 'determinate';
  value: number;
  min?: number;
  max?: number;
};

export type ProgressIndeterminateRootProps = ProgressRootCommonProps & {
  mode: 'indeterminate';
  value?: never;
  min?: never;
  max?: never;
};

export type ProgressDeterminateSemanticRootProps = ProgressDeterminateRootProps &
  ProgressSemanticStateProps;
export type ProgressIndeterminateSemanticRootProps = ProgressIndeterminateRootProps &
  ProgressSemanticStateProps;
export type ProgressSemanticRootProps =
  | ProgressDeterminateSemanticRootProps
  | ProgressIndeterminateSemanticRootProps;

export type ProgressDeterminateDecorativeRootProps = ProgressDeterminateRootProps &
  ProgressDecorativeStateProps;
export type ProgressIndeterminateDecorativeRootProps = ProgressIndeterminateRootProps &
  ProgressDecorativeStateProps;
export type ProgressDecorativeRootProps =
  | ProgressDeterminateDecorativeRootProps
  | ProgressIndeterminateDecorativeRootProps;
export type ProgressRootProps = ProgressSemanticRootProps | ProgressDecorativeRootProps;

export type ProgressTrackProps = HTMLAttributes<HTMLSpanElement>;
export type ProgressIndicatorProps = HTMLAttributes<HTMLSpanElement>;

type ProgressContextValue = {
  classNames: ProgressClassNames;
  mode: ProgressMode;
  percentage: number | undefined;
};

type NormalizedProgress = {
  min: number;
  max: number;
  value: number;
  percentage: number;
};

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

const ProgressContext = createContext<ProgressContextValue | null>(null);

function useProgressContext(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('Progress compound components must be used within a Progress.Root');
  }
  return context;
}

function mergeClassNames(...parts: Array<string | undefined | null | false>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidProgressInterval(min: number, max: number): boolean {
  return max > min && Number.isFinite(max - min);
}

function normalizeProgress(
  valueProp: number,
  minProp?: number,
  maxProp?: number
): NormalizedProgress {
  const candidateMin = isFiniteNumber(minProp) ? minProp : DEFAULT_MIN;
  const candidateMax = isFiniteNumber(maxProp) ? maxProp : DEFAULT_MAX;
  let min = candidateMin;
  let max = candidateMax;

  if (!isValidProgressInterval(min, max)) {
    min = DEFAULT_MIN;
    max = DEFAULT_MAX;
  }

  const finiteValue = isFiniteNumber(valueProp) ? valueProp : DEFAULT_MIN;
  const value = Math.min(max, Math.max(min, finiteValue));
  const percentage = ((value - min) / (max - min)) * 100;

  return {
    min,
    max,
    value,
    percentage
  };
}

function isDevelopmentEnvironment(): boolean {
  return typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';
}

function hasAccessibleName(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function warnAboutInvalidProgressProps(options: {
  mode: ProgressMode;
  valueProp?: number;
  minProp?: number;
  maxProp?: number;
  normalized?: NormalizedProgress;
  decorative: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}): void {
  if (!isDevelopmentEnvironment()) return;

  const { mode, valueProp, minProp, maxProp, normalized, decorative, ariaLabel, ariaLabelledBy } =
    options;

  if (mode === 'indeterminate') {
    if (!decorative && !hasAccessibleName(ariaLabel) && !hasAccessibleName(ariaLabelledBy)) {
      console.warn(
        '[Kiskadee] Progress requires a non-empty aria-label or aria-labelledby when it is not decorative.'
      );
    }
    return;
  }

  if (!normalized) return;

  if (minProp !== undefined && !isFiniteNumber(minProp)) {
    console.warn('[Kiskadee] Progress min must be a finite number. Falling back to 0.');
  }

  if (maxProp !== undefined && !isFiniteNumber(maxProp)) {
    console.warn('[Kiskadee] Progress max must be a finite number. Falling back to 100.');
  }

  const candidateMin = isFiniteNumber(minProp) ? minProp : DEFAULT_MIN;
  const candidateMax = isFiniteNumber(maxProp) ? maxProp : DEFAULT_MAX;

  if (!isValidProgressInterval(candidateMin, candidateMax)) {
    console.warn(
      `[Kiskadee] Progress max (${candidateMax}) must be greater than min (${candidateMin}) ` +
        'and define a finite interval. ' +
        `Falling back to the default range ${DEFAULT_MIN} to ${DEFAULT_MAX}.`
    );
  }

  if (!isFiniteNumber(valueProp)) {
    console.warn(
      `[Kiskadee] Progress value must be a finite number. Starting from ${DEFAULT_MIN} and ` +
        `using ${normalized.value} after clamping to the normalized range.`
    );
  } else if (valueProp !== normalized.value) {
    console.warn(
      `[Kiskadee] Progress value (${valueProp}) is outside the normalized range ` +
        `${normalized.min} to ${normalized.max}. Using ${normalized.value}.`
    );
  }

  if (!decorative && !hasAccessibleName(ariaLabel) && !hasAccessibleName(ariaLabelledBy)) {
    console.warn(
      '[Kiskadee] Progress requires a non-empty aria-label or aria-labelledby when it is not decorative.'
    );
  }
}

const ProgressRoot = forwardRef<HTMLSpanElement, ProgressRootProps>(function ProgressRoot(
  {
    children,
    classNames = {},
    mode = 'determinate',
    value: valueProp,
    min: minProp,
    max: maxProp,
    decorative = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-valuetext': ariaValueText,
    ...rootProps
  },
  ref
) {
  const normalized = useMemo(() => {
    if (mode === 'indeterminate') return undefined;
    return normalizeProgress(valueProp as number, minProp, maxProp);
  }, [maxProp, minProp, mode, valueProp]);

  useEffect(() => {
    warnAboutInvalidProgressProps({
      valueProp,
      mode,
      minProp,
      maxProp,
      normalized,
      decorative,
      ariaLabel,
      ariaLabelledBy
    });
  }, [ariaLabel, ariaLabelledBy, decorative, maxProp, minProp, mode, normalized, valueProp]);

  const contextValue = useMemo<ProgressContextValue>(
    () => ({
      classNames,
      mode,
      percentage: normalized?.percentage
    }),
    [classNames, mode, normalized?.percentage]
  );

  return (
    <ProgressContext.Provider value={contextValue}>
      {decorative ? (
        <span
          {...rootProps}
          ref={ref}
          className={classNames.e1}
          data-progress-mode={mode}
          aria-hidden="true"
        >
          {children}
        </span>
      ) : (
        <span
          {...rootProps}
          ref={ref}
          className={classNames.e1}
          data-progress-mode={mode}
          role="progressbar"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          {...(normalized
            ? {
                'aria-valuemin': normalized.min,
                'aria-valuemax': normalized.max,
                'aria-valuenow': normalized.value
              }
            : {})}
          aria-valuetext={ariaValueText}
        >
          {children}
        </span>
      )}
    </ProgressContext.Provider>
  );
});

const ProgressTrack = forwardRef<HTMLSpanElement, ProgressTrackProps>(function ProgressTrack(
  { className, children, ...props },
  ref
) {
  const { classNames } = useProgressContext();

  return (
    <span {...props} ref={ref} className={mergeClassNames(classNames.e2, className)}>
      {children}
    </span>
  );
});

const ProgressIndicator = forwardRef<HTMLSpanElement, ProgressIndicatorProps>(
  function ProgressIndicator({ className, children, style, ...props }, ref) {
    const { classNames, percentage } = useProgressContext();
    const indicatorStyle = {
      ...style,
      ...(percentage === undefined ? {} : { '--k-prg-v': `${percentage}%` })
    } as CSSProperties;

    return (
      <span
        {...props}
        ref={ref}
        className={mergeClassNames(classNames.e3, className)}
        style={indicatorStyle}
      >
        {children}
      </span>
    );
  }
);

export const HeadlessProgress = Object.assign(ProgressRoot, {
  Root: ProgressRoot,
  Track: ProgressTrack,
  Indicator: ProgressIndicator
});

export default HeadlessProgress;
