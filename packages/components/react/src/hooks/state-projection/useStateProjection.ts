import { useMemo } from 'react';
import { joinClassNames } from '../../shared/class-resolution/classNames.ts';

export type StateProjectionStateValue = boolean | string | number | null | undefined;

export type StateProjectionContext<TSlot extends string, TState extends string> = {
  state: TState;
  target: TSlot;
};

export type StateProjectionResolver<TSlot extends string, TState extends string, TResult> = (
  value: StateProjectionStateValue,
  context: StateProjectionContext<TSlot, TState>
) => TResult;

export type StateProjectionRule<TSlot extends string, TState extends string> = {
  target?: TSlot;
  className?: string | StateProjectionResolver<TSlot, TState, string | undefined>;
  when?: StateProjectionResolver<TSlot, TState, boolean>;
};

export type StateProjectionSlotPropsValue = {
  className?: string;
};

export type StateProjectionSlotProps<TSlot extends string> = Partial<
  Record<TSlot, StateProjectionSlotPropsValue>
>;

export type UseStateProjectionOptions<TSlot extends string, TState extends string> = {
  classNames?: Partial<Record<TSlot, string>>;
  states: Partial<Record<TState, StateProjectionStateValue>>;
  target: TSlot;
  projections?: Partial<Record<TState, StateProjectionRule<TSlot, TState>>>;
  activatorClassName?: string;
  interactiveClassName?: string;
};

export type UseStateProjectionResult<TSlot extends string> = {
  slotProps: StateProjectionSlotProps<TSlot>;
};

function isStateActive(value: StateProjectionStateValue): boolean {
  return Boolean(value);
}

function ensureSlot<TSlot extends string>(
  slotProps: StateProjectionSlotProps<TSlot>,
  slot: TSlot
): StateProjectionSlotPropsValue {
  const current = slotProps[slot];
  if (current) return current;

  const next: StateProjectionSlotPropsValue = {};
  slotProps[slot] = next;
  return next;
}

function resolveProjectionValue<TSlot extends string, TState extends string, TResult>(
  value: TResult | StateProjectionResolver<TSlot, TState, TResult>,
  stateValue: StateProjectionStateValue,
  context: StateProjectionContext<TSlot, TState>
): TResult {
  return typeof value === 'function'
    ? (value as StateProjectionResolver<TSlot, TState, TResult>)(stateValue, context)
    : value;
}

export function useStateProjection<TSlot extends string, TState extends string>({
  classNames,
  states,
  target,
  projections,
  activatorClassName,
  interactiveClassName
}: UseStateProjectionOptions<TSlot, TState>): UseStateProjectionResult<TSlot> {
  return useMemo(() => {
    const slotProps: StateProjectionSlotProps<TSlot> = {};
    const activeClassTargets = new Set<TSlot>();

    for (const [slot, className] of Object.entries(classNames ?? {}) as Array<
      [TSlot, string | undefined]
    >) {
      if (!className) continue;
      const props = ensureSlot(slotProps, slot);
      props.className = joinClassNames(props.className, className);
    }

    if (interactiveClassName) {
      const props = ensureSlot(slotProps, target);
      props.className = joinClassNames(props.className, interactiveClassName);
    }

    for (const state of Object.keys(states) as TState[]) {
      const rule = projections?.[state];
      if (!rule) continue;

      const stateValue = states[state];
      const projectionTarget = rule.target ?? target;
      const context: StateProjectionContext<TSlot, TState> = {
        state,
        target: projectionTarget
      };
      const active = rule.when ? rule.when(stateValue, context) : isStateActive(stateValue);

      if (!active) continue;

      const props = ensureSlot(slotProps, projectionTarget);
      const className =
        rule.className === undefined
          ? undefined
          : resolveProjectionValue(rule.className, stateValue, context);

      if (className) {
        props.className = joinClassNames(props.className, className);
        activeClassTargets.add(projectionTarget);
      }
    }

    if (activatorClassName) {
      for (const activeTarget of activeClassTargets) {
        const props = ensureSlot(slotProps, activeTarget);
        props.className = joinClassNames(props.className, activatorClassName);
      }
    }

    return { slotProps };
  }, [activatorClassName, classNames, interactiveClassName, projections, states, target]);
}
