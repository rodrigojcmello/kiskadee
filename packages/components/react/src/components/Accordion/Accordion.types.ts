import type {
  AccordionElementName,
  AccordionEmphasis,
  AccordionIndicatorTransition,
  ClassNameByElementJSON
} from '@kiskadee/core';
import type {
  AccordionItemProps,
  AccordionPanelProps,
  AccordionHeaderProps as HeaderProps,
  AccordionProps as HeadlessProps
} from '@kiskadee/react-headless/accordion';
import type { ReactNode } from 'react';
import type { CardProps } from '../Card/Card.types.ts';

export type { AccordionItemProps, AccordionPanelProps };
export type AccordionProps = HeadlessProps &
  Pick<CardProps, 'border' | 'shadow'> & {
    emphasis?: AccordionEmphasis;
    panelEmphasis?: AccordionEmphasis;
    divider?: boolean;
    motion?: boolean;
    indicatorTransition?: AccordionIndicatorTransition;
  };
export type AccordionHeaderProps = HeaderProps & { icon?: ReactNode };
export type AccordionClassesMap = Partial<Record<AccordionElementName, ClassNameByElementJSON>>;

export type {
  AccordionElementName,
  AccordionEmphasis,
  AccordionIndicatorTransition
} from '@kiskadee/core';
