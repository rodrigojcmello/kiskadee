import './Card.structural.scss';
import {
  Card as HeadlessCard,
  CardAction as HeadlessCardAction
} from '@kiskadee/react-headless';
import { forwardRef, useMemo } from 'react';
import type { CardActionProps, CardProps } from './Card.types.ts';
import { DEFAULT_CARD_INTENT, resolveCardClassNames } from './Card.class-names.ts';
import { useCardArtifactConfig } from './hooks/useCardArtifactConfig.ts';

export type {
  CardActionProps,
  CardClassesMap,
  CardProps,
  CardStatus,
  CardVisualProps
} from './Card.types.ts';

function useCardClassNames(
  props: Pick<CardProps, 'className' | 'classNames' | 'status' | 'radius' | 'emphasis' | 'intent'>,
  options: { action: boolean }
) {
  const {
    className,
    classNames = {},
    status: statusProp = 'rest',
    radius,
    emphasis,
    intent = DEFAULT_CARD_INTENT
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
      emphasis,
      intent,
      artifactOptions.radius,
      options.action
    ]
  );
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    className,
    classNames,
    status,
    radius,
    emphasis,
    intent,
    children,
    ...restProps
  },
  ref
) {
  const computedClassNames = useCardClassNames(
    { className, classNames, status, radius, emphasis, intent },
    { action: false }
  );

  return (
    <HeadlessCard {...restProps} ref={ref} classNames={computedClassNames}>
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
    emphasis,
    intent,
    children,
    ...restProps
  },
  ref
) {
  const computedClassNames = useCardClassNames(
    { className, classNames, status, radius, emphasis, intent },
    { action: true }
  );

  return (
    <HeadlessCardAction {...restProps} ref={ref} classNames={computedClassNames}>
      {children}
    </HeadlessCardAction>
  );
});

export const Card = CardRoot;
export const CardAction = CardActionRoot;
