'use client';

import './Accordion.structural.scss';
import type { AccordionEmphasis, GrowHeightPresenceProfile, SurfaceContext } from '@kiskadee/core';
import {
  HeadlessAccordion,
  useAccordionHeader,
  useAccordionItemContext,
  useAccordionPanel
} from '@kiskadee/react-headless/accordion';
import { createContext, forwardRef, useContext, useMemo, useRef } from 'react';
import { joinClassNames } from '../../shared/class-resolution/classNames.ts';
import { withComponentResources } from '../../shared/contexts/ComponentResourceBoundary.tsx';
import { useEssentialIcon } from '../../shared/contexts/EssentialIconContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { Card, CardAction } from '../Card/Card.tsx';
import { Container } from '../Container/Container.tsx';
import { Crossfade } from '../Crossfade/Crossfade.tsx';
import { FamilyResolvedIcon } from '../Icon/FamilyResolvedIcon.tsx';
import { Icon } from '../Icon/Icon.tsx';
import { Rotate } from '../Rotate/Rotate.tsx';
import { Separator } from '../Separator/Separator.tsx';
import { resolveAccordionClassNames } from './Accordion.class-names.ts';
import type {
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionPanelProps,
  AccordionProps
} from './Accordion.types.ts';
import { useAccordionMotion } from './effects/motion/AccordionMotion.controller.ts';
import { useAccordionArtifactConfig } from './hooks/useAccordionArtifactConfig.ts';

type VisualContext = {
  emphasis: AccordionEmphasis;
  panelEmphasis: AccordionEmphasis;
  divider: boolean;
  motion: boolean;
  indicatorTransition: NonNullable<AccordionProps['indicatorTransition']>;
  border: AccordionProps['border'];
  shadow: AccordionProps['shadow'];
  surfaceContext: SurfaceContext;
  timing?: GrowHeightPresenceProfile;
};
const Visual = createContext<VisualContext>({
  emphasis: 'medium',
  panelEmphasis: 'medium',
  divider: false,
  motion: true,
  indicatorTransition: 'rotate',
  border: true,
  shadow: false,
  surfaceContext: 'onSubtle'
});

const Root = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    emphasis = 'medium',
    panelEmphasis = emphasis,
    divider,
    motion = true,
    indicatorTransition,
    border = true,
    shadow = false,
    classNames,
    ...props
  },
  ref
) {
  const config = useAccordionArtifactConfig();
  const surfaceContext = useSurfaceContext();
  const classes = useMemo(
    () => resolveAccordionClassNames(config.map, classNames),
    [config.map, classNames]
  );
  const visual = useMemo(
    () => ({
      emphasis,
      panelEmphasis,
      divider: divider ?? config.options?.divider ?? false,
      motion,
      indicatorTransition: indicatorTransition ?? config.options?.indicatorTransition ?? 'none',
      border,
      shadow,
      surfaceContext,
      timing: config.timing
    }),
    [
      emphasis,
      panelEmphasis,
      divider,
      config.options?.divider,
      config.options?.indicatorTransition,
      motion,
      indicatorTransition,
      border,
      shadow,
      surfaceContext,
      config.timing
    ]
  );
  if (
    !config.supported ||
    !config.options?.emphases.includes(emphasis) ||
    !config.options.emphases.includes(panelEmphasis)
  )
    return null;
  return (
    <Visual.Provider value={visual}>
      <HeadlessAccordion {...props} ref={ref} classNames={classes} />
    </Visual.Provider>
  );
});
const Item = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { children, ...props },
  ref
) {
  const { emphasis, border, shadow, surfaceContext } = useContext(Visual);
  return (
    <HeadlessAccordion.Item {...props} ref={ref}>
      <Card
        className="k-acc-frame"
        intent="neutral"
        emphasis={emphasis}
        surfaceContext={surfaceContext}
        border={border}
        radius="rounded"
        shadow={shadow}
      >
        {children}
      </Card>
    </HeadlessAccordion.Item>
  );
});
const Header = forwardRef<HTMLButtonElement, AccordionHeaderProps>(function AccordionHeader(
  { headingLevel = 3, icon, children, ...props },
  ref
) {
  const item = useAccordionItemContext();
  const trigger = useAccordionHeader(props);
  const { emphasis, surfaceContext, timing, indicatorTransition } = useContext(Visual);
  const chevron = useEssentialIcon('chevron-down');
  const chevronUp = useEssentialIcon('chevron-up');
  const durationMs = timing ? (item.open ? timing.enterDurationMs : timing.exitDurationMs) : 0;
  const easing = timing ? (item.open ? timing.enterEasing : timing.exitEasing) : 'ease-out';
  const down = chevron ? <FamilyResolvedIcon name={chevron} /> : '⌄';
  const up = chevronUp ? <FamilyResolvedIcon name={chevronUp} /> : '⌃';
  const Heading = `h${headingLevel}` as 'h3';
  return (
    <Heading className="k-acc-heading">
      <CardAction
        {...trigger}
        ref={(node) => {
          item.triggerRef.current = node;
          if (typeof ref === 'function') return ref(node);
          if (ref) ref.current = node;
        }}
        intent="neutral"
        emphasis={emphasis}
        surfaceContext={surfaceContext}
        border={false}
        shadow={false}
      >
        {icon != null && (
          <span className="k-acc-icon">
            <Icon decorative foreground="inherit">
              {icon}
            </Icon>
          </span>
        )}
        <span className={item.classNames.e4}>{children}</span>
        {indicatorTransition === 'none' ? (
          <span className={joinClassNames(item.classNames.e5, 'k-acc-e5a')} aria-hidden="true">
            {item.open ? up : down}
          </span>
        ) : indicatorTransition === 'crossfade' ? (
          <Crossfade
            className={item.classNames.e5}
            aria-hidden="true"
            transitionKey={item.open ? 'open' : 'closed'}
            durationMs={durationMs}
            easing={easing}
          >
            {item.open ? up : down}
          </Crossfade>
        ) : (
          <Rotate
            className={item.classNames.e5}
            aria-hidden="true"
            angle={item.open ? 180 : 0}
            durationMs={durationMs}
            easing={easing}
          >
            {down}
          </Rotate>
        )}
      </CardAction>
    </Heading>
  );
});
const Panel = forwardRef<HTMLDivElement, AccordionPanelProps>(function AccordionPanel(
  { children, className, ...props },
  ref
) {
  const { panelEmphasis, divider, motion, timing, surfaceContext } = useContext(Visual);
  const item = useAccordionItemContext();
  const panel = useAccordionPanel();
  const content = useRef<HTMLDivElement>(null);
  const presence = useAccordionMotion(panel.open, motion, timing, panel.ref, content);
  return (
    <div
      {...props}
      {...panel.props}
      {...presence}
      className={joinClassNames(item.classNames.e6, className)}
      ref={(node) => {
        panel.ref.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
    >
      <div ref={content} className="k-acc-body">
        {divider && (
          <Separator
            aria-hidden="true"
            surfaceContext={surfaceContext}
            emphasis={surfaceContext === 'onVivid' ? 'medium' : 'low'}
          />
        )}
        <Container
          intent="neutral"
          emphasis={panelEmphasis}
          surfaceContext={surfaceContext}
          className="k-acc-content"
        >
          {children}
        </Container>
      </div>
    </div>
  );
});
export const Accordion = Object.assign(withComponentResources('accordion', Root), {
  Item,
  Header,
  Panel
});
