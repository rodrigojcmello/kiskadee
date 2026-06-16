import './Card.structural.scss';
import {
  Card as HeadlessCard,
  CardAction as HeadlessCardAction
} from '@kiskadee/react-headless';
import { forwardRef, useMemo } from 'react';
import type { CardActionProps, CardProps, CardStatus } from './Card.types.ts';
import { DEFAULT_CARD_INTENT, resolveCardClassNames } from './Card.class-names.ts';
import { useCardArtifactConfig } from './hooks/useCardArtifactConfig.ts';

export type {
  CardActionProps,
  CardActionVisualProps,
  CardClassesMap,
  CardProps,
  CardStatus,
  CardVisualProps
} from './Card.types.ts';

function useCardClassNames(
  props: Pick<CardProps, 'className' | 'classNames' | 'radius' | 'emphasis' | 'intent'> & {
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
    shadow,
    preserveBorderWithShadow
  } = props;
  const { cardClassesMap, options: artifactOptions } = useCardArtifactConfig();
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
    children,
    ...restPropsWithPotentialStatus
  } = props as CardProps & { status?: CardStatus };
  const { status: _status, ...restProps } = restPropsWithPotentialStatus;
  void _status;
  const resolvedClasses = useCardClassNames(
    { className, classNames, radius, shadow, preserveBorderWithShadow, emphasis, intent },
    { action: false }
  );

  return (
    <HeadlessCard
      {...restProps}
      ref={ref}
      classNames={resolvedClasses.classNames}
    >
      {children}
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
    children,
    ...restProps
  },
  ref
) {
  const resolvedClasses = useCardClassNames(
    { className, classNames, status, radius, shadow, preserveBorderWithShadow, emphasis, intent },
    { action: true }
  );

  return (
    <HeadlessCardAction
      {...restProps}
      ref={ref}
      classNames={resolvedClasses.classNames}
    >
      {children}
    </HeadlessCardAction>
  );
});

export const Card = CardRoot;
export const CardAction = CardActionRoot;
