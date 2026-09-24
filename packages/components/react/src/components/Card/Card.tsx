import { withComponentResources } from '../../shared/contexts/ComponentResourceBoundary.tsx';
import { useControlCursorStyle } from '../../shared/contexts/useControlCursorStyle.ts';
import './Card.structural.scss';
import { Card as HeadlessCard, CardAction as HeadlessCardAction } from '@kiskadee/react-headless';
import { forwardRef, useMemo } from 'react';
import { SurfaceContextProvider } from '../../shared/contexts/SurfaceContext.tsx';
import { useProducedSurfaceContext } from '../../shared/contexts/useProducedSurfaceContext.ts';
import {
  DEFAULT_CARD_EMPHASIS,
  DEFAULT_CARD_INTENT,
  resolveCardClassNames
} from './Card.class-names.ts';
import type { CardActionProps, CardProps, CardStatus } from './Card.types.ts';
import { type CardArtifactConfig, useCardArtifactConfig } from './hooks/useCardArtifactConfig.ts';

export type {
  CardActionInteractionStateSource,
  CardActionProps,
  CardActionVisualProps,
  CardClassesMap,
  CardProps,
  CardStatus,
  CardVisualProps
} from './Card.types.ts';

const EMPTY_CARD_CLASS_NAMES: NonNullable<CardProps['classNames']> = {};

function useCardClassNames(
  props: Pick<CardProps, 'className' | 'classNames' | 'radius' | 'emphasis' | 'intent'> & {
    surfaceContext: NonNullable<CardProps['surfaceContext']>;
    status?: CardStatus | 'rest';
    shadow?: CardProps['shadow'] | CardActionProps['shadow'];
    preserveBorderWithShadow?: CardActionProps['preserveBorderWithShadow'];
    border?: boolean;
    flushContent?: CardProps['flushContent'];
  },
  options: { action: boolean },
  artifactConfig: CardArtifactConfig
) {
  const {
    className,
    classNames = EMPTY_CARD_CLASS_NAMES,
    status: statusProp = 'rest',
    radius,
    emphasis,
    intent = DEFAULT_CARD_INTENT,
    surfaceContext,
    shadow,
    border,
    flushContent,
    preserveBorderWithShadow
  } = props;
  const { cardClassesMap, options: artifactOptions } = artifactConfig;
  const { e1 } = cardClassesMap ?? {};

  return useMemo(
    () =>
      resolveCardClassNames({
        e1,
        className,
        classNames,
        status: statusProp,
        radius,
        shadow,
        border,
        flushContent,
        preserveBorderWithShadow,
        emphasis,
        intent,
        surfaceContext,
        globalRadius: artifactOptions.radius,
        action: options.action
      }),
    [
      e1,
      className,
      classNames,
      statusProp,
      radius,
      shadow,
      border,
      flushContent,
      preserveBorderWithShadow,
      emphasis,
      intent,
      surfaceContext,
      artifactOptions.radius,
      options.action
    ]
  );
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const {
    className,
    classNames,
    radius,
    border,
    flushContent,
    shadow,
    emphasis,
    intent,
    surfaceContext,
    children,
    ...restPropsWithPotentialStatus
  } = props as CardProps & { status?: CardStatus };
  const { status: _status, ...restProps } = restPropsWithPotentialStatus;
  void _status;
  const artifactConfig = useCardArtifactConfig();
  const { consumedSurfaceContext, resolveProducedSurfaceContext } = useProducedSurfaceContext({
    map: artifactConfig.contentSurfaceContext,
    surfaceContext,
    intent: intent ?? DEFAULT_CARD_INTENT,
    emphasis: emphasis ?? DEFAULT_CARD_EMPHASIS
  });
  const resolvedClasses = useCardClassNames(
    {
      className,
      classNames,
      radius,
      shadow,
      border,
      emphasis,
      intent,
      surfaceContext: consumedSurfaceContext,
      flushContent
    },
    { action: false },
    artifactConfig
  );

  return (
    <HeadlessCard {...restProps} ref={ref} classNames={resolvedClasses.classNames}>
      <SurfaceContextProvider value={resolveProducedSurfaceContext()}>
        {children}
      </SurfaceContextProvider>
    </HeadlessCard>
  );
});

const CardActionRoot = forwardRef<HTMLButtonElement, CardActionProps>(function CardAction(
  {
    className,
    classNames,
    status,
    radius,
    preserveBorderWithShadow,
    shadow,
    emphasis,
    intent,
    surfaceContext,
    children,
    disabled,
    ...restProps
  },
  ref
) {
  const cursorStyle = useControlCursorStyle();
  const artifactConfig = useCardArtifactConfig();
  const { consumedSurfaceContext, resolveProducedSurfaceContext } = useProducedSurfaceContext({
    map: artifactConfig.contentSurfaceContext,
    surfaceContext,
    intent: intent ?? DEFAULT_CARD_INTENT,
    emphasis: emphasis ?? DEFAULT_CARD_EMPHASIS
  });
  const resolvedClasses = useCardClassNames(
    {
      className,
      classNames,
      status,
      radius,
      shadow,
      preserveBorderWithShadow,
      emphasis,
      intent,
      surfaceContext: consumedSurfaceContext
    },
    { action: true },
    artifactConfig
  );

  return (
    <HeadlessCardAction
      {...restProps}
      style={{ ...cursorStyle, ...restProps.style }}
      ref={ref}
      status={status}
      disabled={disabled}
      classNames={resolvedClasses.classNames}
    >
      {({ controlState }) => (
        <SurfaceContextProvider
          value={resolveProducedSurfaceContext({
            selected: controlState,
            pending: status === 'pending',
            disabled: Boolean(disabled) || status === 'disabled'
          })}
        >
          {children}
        </SurfaceContextProvider>
      )}
    </HeadlessCardAction>
  );
});

export const Card = withComponentResources('card', CardRoot);
export const CardAction = withComponentResources('card', CardActionRoot);
