import './Card.structural.scss';
import { Card as HeadlessCard, CardAction as HeadlessCardAction } from '@kiskadee/react-headless';
import { forwardRef, useMemo } from 'react';
import {
  SurfaceContextProvider,
  useSurfaceContext
} from '../../shared/contexts/SurfaceContext.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { DEFAULT_CARD_INTENT, resolveCardClassNames } from './Card.class-names.ts';
import type { CardActionProps, CardProps, CardStatus } from './Card.types.ts';
import { useCardArtifactConfig } from './hooks/useCardArtifactConfig.ts';

export type {
  CardActionInteractionStateSource,
  CardActionProps,
  CardActionVisualProps,
  CardClassesMap,
  CardProps,
  CardStatus,
  CardVisualProps
} from './Card.types.ts';

function useCardClassNames(
  props: Pick<CardProps, 'className' | 'classNames' | 'radius' | 'emphasis' | 'intent' | 'surfaceContext'> & {
    status?: CardStatus | 'rest';
    shadow?: CardProps['shadow'] | CardActionProps['shadow'];
    preserveBorderWithShadow?: CardProps['preserveBorderWithShadow'];
  },
  options: { action: boolean }
) {
  const {
    className,
    classNames = {},
    status: statusProp = 'rest',
    radius,
    emphasis,
    intent = DEFAULT_CARD_INTENT,
    surfaceContext: explicitSurfaceContext,
    shadow,
    preserveBorderWithShadow
  } = props;
  const { cardClassesMap, options: artifactOptions } = useCardArtifactConfig();
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
    preserveBorderWithShadow,
    shadow,
    emphasis,
    intent,
    surfaceContext,
    children,
    ...restPropsWithPotentialStatus
  } = props as CardProps & { status?: CardStatus };
  const { status: _status, ...restProps } = restPropsWithPotentialStatus;
  void _status;
  const resolvedClasses = useCardClassNames(
    { className, classNames, radius, shadow, preserveBorderWithShadow, emphasis, intent, surfaceContext },
    { action: false }
  );

  const producedSurface = useCardProducedSurface({ emphasis, intent, surfaceContext });
  return (
    <HeadlessCard {...restProps} ref={ref} classNames={resolvedClasses.classNames}>
      <SurfaceContextProvider value={producedSurface}>{children}</SurfaceContextProvider>
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
    ...restProps
  },
  ref
) {
  const resolvedClasses = useCardClassNames(
    { className, classNames, status, radius, shadow, preserveBorderWithShadow, emphasis, intent, surfaceContext },
    { action: true }
  );

  const producedSurface = useCardProducedSurface({ emphasis, intent, surfaceContext });
  return (
    <HeadlessCardAction
      {...restProps}
      ref={ref}
      status={status}
      classNames={resolvedClasses.classNames}
    >
      <SurfaceContextProvider value={producedSurface}>{children}</SurfaceContextProvider>
    </HeadlessCardAction>
  );
});

function useCardProducedSurface({
  emphasis = 'medium',
  intent = DEFAULT_CARD_INTENT,
  surfaceContext
}: {
  emphasis?: CardProps['emphasis'];
  intent?: CardProps['intent'];
  surfaceContext?: CardProps['surfaceContext'];
}) {
  const consumedSurface = useSurfaceContext(surfaceContext);
  const { segment, theme } = useKiskadee();
  const { options } = useCardArtifactConfig();
  const authored = options.canonicalSurfaces?.[segment]?.[theme]?.find(
    (surface) => surface.intent === intent && surface.emphasis === emphasis
  );
  return authored?.contentSurfaceContext ?? consumedSurface;
}

export const Card = CardRoot;
export const CardAction = CardActionRoot;
