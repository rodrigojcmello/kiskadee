'use client';

import './Chip.structural.scss';
import { stateActivator as cn } from '@kiskadee/core';
import { HeadlessChip } from '@kiskadee/react-headless';
import { Children, createContext, forwardRef, isValidElement, useContext, useRef } from 'react';
import { useEssentialIcon } from '../../shared/contexts/EssentialIconContext.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import {
  resolveContentSurfaceContext,
  SurfaceContextProvider,
  useSurfaceContext
} from '../../shared/contexts/SurfaceContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { FamilyResolvedIcon } from '../Icon/FamilyResolvedIcon.tsx';
import {
  DEFAULT_CHIP_EMPHASIS,
  DEFAULT_CHIP_INTENT,
  DEFAULT_CHIP_RADIUS,
  DEFAULT_CHIP_SCALE,
  resolveChipClassNames
} from './Chip.class-names.ts';
import type {
  ChipClassesMap,
  ChipContentProps,
  ChipProps,
  ChipRemoveProps,
  ChipSelectProps,
  ChipSlotProps
} from './Chip.types.ts';

declare const process: { env: { NODE_ENV?: string } };

type ChipContextValue = {
  classes: ReturnType<typeof resolveChipClassNames>;
  consumedSurfaceContext: ReturnType<typeof useSurfaceContext>;
  disabled: boolean;
  emphasis: NonNullable<ChipProps['emphasis']>;
  intent: NonNullable<ChipProps['intent']>;
  resolveProducedSurface: (selected?: boolean) => ReturnType<typeof useSurfaceContext>;
};

const ChipContext = createContext<ChipContextValue | undefined>(undefined);

function useChip(part: string): ChipContextValue {
  const context = useContext(ChipContext);
  if (!context) throw new Error(`Chip.${part} must be rendered inside Chip.`);
  return context;
}

function join(...parts: Array<string | undefined | false>): string | undefined {
  const value = parts.filter(Boolean).join(' ').trim();
  return value.length > 0 ? value : undefined;
}

const ChipLabel = forwardRef<HTMLSpanElement, ChipSlotProps>(function ChipLabel(
  { className, ...props },
  ref
) {
  const chip = useChip('Label');
  return <span {...props} ref={ref} className={join(chip.classes.e3, className)} />;
});

const ChipIcon = forwardRef<HTMLSpanElement, ChipSlotProps>(function ChipIcon(
  { className, ...props },
  ref
) {
  const chip = useChip('Icon');
  return <span {...props} ref={ref} className={join(chip.classes.e4, className)} />;
});

const ChipBadge = forwardRef<HTMLSpanElement, ChipSlotProps>(function ChipBadge(
  { className, ...props },
  ref
) {
  const chip = useChip('Badge');
  return <span {...props} ref={ref} className={join(chip.classes.e7, className)} />;
});

const ChipContent = forwardRef<HTMLSpanElement, ChipContentProps>(function ChipContent(
  { className, children, ...props },
  ref
) {
  const chip = useChip('Content');
  const producedSurface = chip.resolveProducedSurface(false);
  return (
    <HeadlessChip.Content
      {...props}
      ref={ref}
      className={join(
        chip.classes.e2,
        className,
        chip.disabled && cn.disabled,
        chip.disabled && cn.activator
      )}
    >
      <SurfaceContextProvider value={producedSurface}>{children}</SurfaceContextProvider>
    </HeadlessChip.Content>
  );
});

const ChipSelect = forwardRef<HTMLButtonElement, ChipSelectProps>(function ChipSelect(
  { className, children, ...props },
  ref
) {
  const chip = useChip('Select');
  return (
    <HeadlessChip.Select {...props} ref={ref} className={join(chip.classes.e2, className)}>
      {({ controlState }) => (
        <SurfaceContextProvider value={chip.resolveProducedSurface(controlState)}>
          {children}
        </SurfaceContextProvider>
      )}
    </HeadlessChip.Select>
  );
});

const ChipRemove = forwardRef<HTMLButtonElement, ChipRemoveProps>(function ChipRemove(
  { className, children, ...props },
  ref
) {
  const chip = useChip('Remove');
  const closeIcon = useEssentialIcon('close');
  const warned = useRef(false);
  const content = children ?? (closeIcon ? <FamilyResolvedIcon name={closeIcon} /> : undefined);

  if (!content) {
    if (process.env.NODE_ENV !== 'production' && !warned.current) {
      warned.current = true;
      console.warn(
        '[Kiskadee] Chip.Remove was omitted because the close Essential Icon is unavailable and no explicit child was provided.'
      );
    }
    return null;
  }

  return (
    <HeadlessChip.Remove {...props} ref={ref} className={join(chip.classes.e5, className)}>
      <span className={chip.classes.e6} aria-hidden="true">
        {content}
      </span>
    </HeadlessChip.Remove>
  );
});

const ChipRoot = forwardRef<HTMLSpanElement, ChipProps>(function ChipRoot(
  {
    className,
    classNames = {},
    children,
    disabled = false,
    emphasis = DEFAULT_CHIP_EMPHASIS,
    intent = DEFAULT_CHIP_INTENT,
    radius = DEFAULT_CHIP_RADIUS,
    scale = DEFAULT_CHIP_SCALE,
    surfaceContext: explicitSurfaceContext,
    ...props
  },
  ref
) {
  const { classesMap, global, segment, theme } = useKiskadee();
  const consumedSurfaceContext = useSurfaceContext(explicitSurfaceContext);
  const elements =
    useComponentClassMap('chip', classesMap.chip as ChipClassesMap | undefined) ?? {};
  const classes = resolveChipClassNames({
    elements,
    className,
    classNames,
    intent,
    emphasis,
    scale,
    radius,
    surfaceContext: consumedSurfaceContext
  });

  const primaryCount = Children.toArray(children).filter(
    (child) => isValidElement(child) && (child.type === ChipContent || child.type === ChipSelect)
  ).length;
  if (primaryCount !== 1) {
    throw new Error('Chip requires exactly one Chip.Content or Chip.Select.');
  }

  const context: ChipContextValue = {
    classes,
    consumedSurfaceContext,
    disabled,
    emphasis,
    intent,
    resolveProducedSurface: (selected) =>
      resolveContentSurfaceContext({
        map: global?.components?.chip?.contentSurfaceContext,
        segment,
        theme,
        consumedSurfaceContext,
        intent,
        emphasis,
        selected,
        disabled
      })
  };

  return (
    <ChipContext.Provider value={context}>
      <HeadlessChip.Root {...props} ref={ref} disabled={disabled} className={classes.e1}>
        {children}
      </HeadlessChip.Root>
    </ChipContext.Provider>
  );
});

export const Chip = Object.assign(ChipRoot, {
  Badge: ChipBadge,
  Content: ChipContent,
  Icon: ChipIcon,
  Label: ChipLabel,
  Remove: ChipRemove,
  Select: ChipSelect
});
