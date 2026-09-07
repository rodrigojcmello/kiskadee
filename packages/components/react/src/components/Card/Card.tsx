import './Card.structural.scss';
import { Card as HeadlessCard, CardAction as HeadlessCardAction } from '@kiskadee/react-headless';
import { forwardRef, useCallback, useMemo } from 'react';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import {
  resolveContentSurfaceContext,
  SurfaceContextProvider,
  useSurfaceContext
} from '../../shared/contexts/SurfaceContext.tsx';
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
  props: Pick<
    CardProps,
    'className' | 'classNames' | 'radius' | 'emphasis' | 'intent' | 'surfaceContext'
  > & {
    status?: CardStatus | 'rest';
    shadow?: CardProps['shadow'] | CardActionProps['shadow'];
    preserveBorderWithShadow?: CardActionProps['preserveBorderWithShadow'];
    border?: boolean;
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
    surfaceContext: explicitSurfaceContext,
    shadow,
    border,
    preserveBorderWithShadow
  } = props;
  const { cardClassesMap, options: artifactOptions } = artifactConfig;
  const surfaceContext = useSurfaceContext(explicitSurfaceContext);
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
  const resolvedClasses = useCardClassNames(
    {
      className,
      classNames,
      radius,
      shadow,
      border,
      emphasis,
      intent,
      surfaceContext
    },
    { action: false },
    artifactConfig
  );

  const resolveProducedSurface = useCardProducedSurfaceResolver({
    emphasis,
    intent,
    surfaceContext,
    contentSurfaceContext: artifactConfig.contentSurfaceContext
  });
  return (
    <HeadlessCard {...restProps} ref={ref} classNames={resolvedClasses.classNames}>
      <SurfaceContextProvider value={resolveProducedSurface()}>{children}</SurfaceContextProvider>
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
  const artifactConfig = useCardArtifactConfig();
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
      surfaceContext
    },
    { action: true },
    artifactConfig
  );

  const resolveProducedSurface = useCardProducedSurfaceResolver({
    emphasis,
    intent,
    surfaceContext,
    contentSurfaceContext: artifactConfig.contentSurfaceContext
  });
  return (
    <HeadlessCardAction
      {...restProps}
      ref={ref}
      status={status}
      disabled={disabled}
      classNames={resolvedClasses.classNames}
    >
      {({ controlState }) => (
        <SurfaceContextProvider
          value={resolveProducedSurface({
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

type CardProducedSurfaceState = {
  selected?: boolean;
  pending?: boolean;
  disabled?: boolean;
};

function useCardProducedSurfaceResolver({
  emphasis = DEFAULT_CARD_EMPHASIS,
  intent = DEFAULT_CARD_INTENT,
  surfaceContext,
  contentSurfaceContext
}: {
  emphasis?: CardProps['emphasis'];
  intent?: CardProps['intent'];
  surfaceContext?: CardProps['surfaceContext'];
  contentSurfaceContext: CardArtifactConfig['contentSurfaceContext'];
}) {
  const consumedSurface = useSurfaceContext(surfaceContext);
  const { segment, theme } = useKiskadee();

  return useCallback(
    ({ selected, pending, disabled }: CardProducedSurfaceState = {}) =>
      resolveContentSurfaceContext({
        map: contentSurfaceContext,
        segment,
        theme,
        consumedSurfaceContext: consumedSurface,
        intent,
        emphasis,
        selected,
        pending,
        disabled
      }),
    [contentSurfaceContext, consumedSurface, emphasis, intent, segment, theme]
  );
}

export const Card = CardRoot;
export const CardAction = CardActionRoot;
