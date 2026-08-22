import type { DropdownPresenceProfile, PresenceProfiles } from '@kiskadee/core';
import { type HTMLMotionProps, motion, useReducedMotion } from 'motion/react';
import type { CSSProperties, Ref } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../../../../shared/utils/useIsomorphicLayoutEffect.ts';
import type { DropdownPlacement, DropdownPresenceRenderProps } from '../../Dropdown.types.ts';

declare const process: { env: { NODE_ENV?: string } };

type DropdownPresenceEffectProps = {
  onExitComplete: () => void;
  open: boolean;
  positioned: boolean;
  placement: DropdownPlacement;
  surfaceProps: DropdownPresenceRenderProps;
  profile: DropdownPresenceProfile;
  profiles: PresenceProfiles;
};

type EntryPhase = 'measuring' | 'prepared' | 'ready';

type GrowPositionerRegistration = {
  count: number;
  display: string;
  flexDirection: string;
  justifyContent: string;
  minHeight: string;
};

const growPositioners = new WeakMap<HTMLElement, GrowPositionerRegistration>();

const easing = {
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1]
} as const;

function resolveTranslation(
  placement: DropdownPlacement,
  distance: number
): { x: number; y: number } {
  const side = placement.split('-')[0];
  if (side === 'top') return { x: 0, y: distance };
  if (side === 'right') return { x: -distance, y: 0 };
  if (side === 'left') return { x: distance, y: 0 };
  return { x: 0, y: -distance };
}

function resolveTransformOrigin(placement: DropdownPlacement): CSSProperties['transformOrigin'] {
  const side = placement.split('-')[0];
  if (side === 'top') return 'bottom';
  if (side === 'right') return 'left';
  if (side === 'left') return 'right';
  return 'top';
}

function resolveGrowAlignment(placement: DropdownPlacement): string {
  const [side, alignment] = placement.split('-');
  if (side === 'top') return 'flex-end';
  if ((side === 'left' || side === 'right') && alignment === 'end') return 'flex-end';
  return 'flex-start';
}

function transitionsAreDisabled(): boolean {
  if (process.env.NODE_ENV === 'test') return true;
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('no-transitions');
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function acquireGrowPositioner(positioner: HTMLElement, naturalHeight: number): void {
  const current = growPositioners.get(positioner);
  if (current) {
    current.count += 1;
  } else {
    growPositioners.set(positioner, {
      count: 1,
      display: positioner.style.display,
      flexDirection: positioner.style.flexDirection,
      justifyContent: positioner.style.justifyContent,
      minHeight: positioner.style.minHeight
    });
  }
  positioner.style.minHeight = `${naturalHeight}px`;
  positioner.style.display = 'flex';
  positioner.style.flexDirection = 'column';
}

function releaseGrowPositioner(positioner: HTMLElement): void {
  const registration = growPositioners.get(positioner);
  if (!registration) return;
  registration.count -= 1;
  if (registration.count > 0) return;

  positioner.style.display = registration.display;
  positioner.style.flexDirection = registration.flexDirection;
  positioner.style.justifyContent = registration.justifyContent;
  positioner.style.minHeight = registration.minHeight;
  growPositioners.delete(positioner);
}

export function DropdownPresenceEffect({
  onExitComplete,
  open,
  positioned,
  placement,
  surfaceProps,
  profile,
  profiles
}: DropdownPresenceEffectProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, style, ...props } = surfaceProps;
  const motionProps = props as unknown as HTMLMotionProps<'div'>;
  const instant = Boolean(prefersReducedMotion) || transitionsAreDisabled();
  const [entryPhase, setEntryPhase] = useState<EntryPhase>(instant ? 'ready' : 'measuring');
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const growPositionerRef = useRef<HTMLElement | null>(null);
  const onExitCompleteRef = useRef(onExitComplete);
  const wasOpenRef = useRef(false);
  const positionedPlacementRef = useRef(placement);
  const effectivePlacement = positioned ? placement : positionedPlacementRef.current;
  const setSurfaceRef = useCallback(
    (node: HTMLDivElement | null) => {
      surfaceRef.current = node;
      assignRef(ref as Ref<HTMLDivElement>, node);
    },
    [ref]
  );
  const releaseOwnedGrowPositioner = useCallback(() => {
    const positioner = growPositionerRef.current;
    if (!positioner) return;
    growPositionerRef.current = null;
    releaseGrowPositioner(positioner);
  }, []);

  useIsomorphicLayoutEffect(() => releaseOwnedGrowPositioner, [releaseOwnedGrowPositioner]);
  useIsomorphicLayoutEffect(() => {
    onExitCompleteRef.current = onExitComplete;
  }, [onExitComplete]);
  useIsomorphicLayoutEffect(() => {
    if (positioned) positionedPlacementRef.current = placement;
  }, [placement, positioned]);

  useIsomorphicLayoutEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;

    if (instant) {
      if (entryPhase !== 'ready') setEntryPhase('ready');
      releaseOwnedGrowPositioner();
      return;
    }

    if (!open) {
      if (entryPhase !== 'ready') onExitCompleteRef.current();
      return;
    }

    if (!wasOpen && entryPhase !== 'measuring') {
      setEntryPhase('measuring');
      return;
    }
    if (!positioned) return;

    if (entryPhase === 'measuring') {
      if (profile === 'grow-height') {
        const surface = surfaceRef.current;
        const positioner = surface?.parentElement;
        if (positioner && growPositionerRef.current !== positioner) {
          releaseOwnedGrowPositioner();
          acquireGrowPositioner(positioner, surface.getBoundingClientRect().height);
          growPositionerRef.current = positioner;
        }
        if (positioner) {
          positioner.style.justifyContent = resolveGrowAlignment(effectivePlacement);
        }
      }
      setEntryPhase('prepared');
      return;
    }

    if (profile === 'grow-height' && growPositionerRef.current) {
      growPositionerRef.current.style.justifyContent = resolveGrowAlignment(effectivePlacement);
    }
    if (entryPhase !== 'prepared') return;

    let releaseFrame = 0;
    const preparationFrame = requestAnimationFrame(() => {
      if (profile === 'grow-height' && surfaceRef.current) {
        surfaceRef.current.style.height = '0px';
      }
      releaseFrame = requestAnimationFrame(() => setEntryPhase('ready'));
    });
    return () => {
      cancelAnimationFrame(preparationFrame);
      if (releaseFrame) cancelAnimationFrame(releaseFrame);
    };
  }, [
    effectivePlacement,
    entryPhase,
    instant,
    open,
    positioned,
    profile,
    releaseOwnedGrowPositioner
  ]);

  const visualPhase: EntryPhase =
    !instant && open && (!wasOpenRef.current || !positioned) ? 'measuring' : entryPhase;
  const measuring = open && visualPhase === 'measuring';
  const prepared = open && visualPhase === 'prepared';
  const preparing = measuring || prepared;
  const entering = open && visualPhase === 'ready';
  const commonStyle = {
    ...style,
    ...(preparing ? { opacity: 0 } : {}),
    pointerEvents: open && !preparing ? style?.pointerEvents : 'none',
    transformOrigin: resolveTransformOrigin(effectivePlacement),
    visibility: style?.visibility
  };

  if (profile === 'grow-height') {
    const definition = profiles['grow-height'];
    if (!definition) return <div {...props} ref={ref as Ref<HTMLDivElement>} style={style} />;
    const transition = {
      duration: instant
        ? 0
        : (open ? definition.enterDurationMs : definition.exitDurationMs) / 1000,
      ease: easing[open ? definition.enterEasing : definition.exitEasing]
    } as const;
    return (
      <motion.div
        {...motionProps}
        ref={setSurfaceRef}
        initial={false}
        animate={{ height: measuring || entering ? 'auto' : 0 }}
        onAnimationComplete={() => {
          if (!open) onExitCompleteRef.current();
        }}
        transition={preparing ? { duration: 0 } : transition}
        style={prepared ? { ...commonStyle, height: 0 } : commonStyle}
      />
    );
  }

  const definition = profiles['fade-translate'];
  if (!definition) return <div {...props} ref={ref as Ref<HTMLDivElement>} style={style} />;
  const transition = {
    duration: instant ? 0 : (open ? definition.enterDurationMs : definition.exitDurationMs) / 1000,
    ease: easing[open ? definition.enterEasing : definition.exitEasing]
  } as const;
  const translation = resolveTranslation(effectivePlacement, definition.distancePx);
  const hiddenTranslation = measuring ? { x: 0, y: 0 } : translation;
  return (
    <motion.div
      {...motionProps}
      ref={setSurfaceRef}
      initial={false}
      animate={{
        opacity: entering ? 1 : 0,
        x: entering ? 0 : hiddenTranslation.x,
        y: entering ? 0 : hiddenTranslation.y
      }}
      onAnimationComplete={() => {
        if (!open) onExitCompleteRef.current();
      }}
      transition={preparing ? { duration: 0 } : transition}
      style={commonStyle}
    />
  );
}
