import { useMemo } from 'react';

export type StateProjectionStateValue = boolean | string | number | null | undefined;

export type StateProjectionDomAttributeValue = string | number | boolean | undefined;

export type StateProjectionContext<TSlot extends string, TState extends string> = {
  state: TState;
  target: TSlot;
};

export type StateProjectionResolver<TSlot extends string, TState extends string, TResult> = (
  value: StateProjectionStateValue,
  context: StateProjectionContext<TSlot, TState>
) => TResult;

export type StateProjectionAttribute<TSlot extends string, TState extends string> =
  | string
  | {
      name: string;
      value?:
        | StateProjectionDomAttributeValue
        | StateProjectionResolver<TSlot, TState, StateProjectionDomAttributeValue>;
    };

export type StateProjectionRule<TSlot extends string, TState extends string> = {
  target?: TSlot;
  className?: string | StateProjectionResolver<TSlot, TState, string | undefined>;
  attribute?: StateProjectionAttribute<TSlot, TState>;
  attributes?: Array<StateProjectionAttribute<TSlot, TState>>;
  when?: StateProjectionResolver<TSlot, TState, boolean>;
};

export type StateProjectionSlotPropsValue = {
  className?: string;
} & Record<string, StateProjectionDomAttributeValue>;

export type StateProjectionSlotProps<TSlot extends string> = Partial<
  Record<TSlot, StateProjectionSlotPropsValue>
>;

export type UseStateProjectionOptions<TSlot extends string, TState extends string> = {
  classNames?: Partial<Record<TSlot, string>>;
  states: Partial<Record<TState, StateProjectionStateValue>>;
  target?: TSlot;
  projections?: Partial<Record<TState, StateProjectionRule<TSlot, TState>>>;
  activatorClassName?: string;
  interactiveClassName?: string;
};

export type UseStateProjectionResult<TSlot extends string> = {
  slotProps: StateProjectionSlotProps<TSlot>;
};

function mergeClassNames(...parts: Array<string | undefined | null | false>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

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

function applyProjectionAttribute<TSlot extends string, TState extends string>(
  slotProps: StateProjectionSlotPropsValue,
  attribute: StateProjectionAttribute<TSlot, TState>,
  stateValue: StateProjectionStateValue,
  context: StateProjectionContext<TSlot, TState>
): void {
  if (typeof attribute === 'string') {
    slotProps[attribute] = '';
    return;
  }

  const value =
    attribute.value === undefined
      ? ''
      : resolveProjectionValue(attribute.value, stateValue, context);

  if (value !== undefined) {
    slotProps[attribute.name] = value;
  }
}

export function mergeStateProjectionSlotProps<TSlot extends string>(
  ...sources: Array<StateProjectionSlotProps<TSlot> | undefined>
): StateProjectionSlotProps<TSlot> {
  const merged: StateProjectionSlotProps<TSlot> = {};

  for (const source of sources) {
    if (!source) continue;

    for (const [slot, props] of Object.entries(source) as Array<
      [TSlot, StateProjectionSlotPropsValue | undefined]
    >) {
      if (!props) continue;

      const target = ensureSlot(merged, slot);
      const className = mergeClassNames(target.className, props.className);
      Object.assign(target, props);

      if (className) {
        target.className = className;
      } else {
        delete target.className;
      }
    }
  }

  return merged;
}

export function useStateProjection<TSlot extends string, TState extends string>({
  classNames,
  states,
  target,
  projections,
  activatorClassName,
  interactiveClassName
}: UseStateProjectionOptions<TSlot, TState>): UseStateProjectionResult<TSlot> {
  const defaultTarget = target ?? ('e1' as TSlot);

  return useMemo(() => {
    const slotProps: StateProjectionSlotProps<TSlot> = {};
    const activeClassTargets = new Set<TSlot>();

    for (const [slot, className] of Object.entries(classNames ?? {}) as Array<
      [TSlot, string | undefined]
    >) {
      if (!className) continue;
      const props = ensureSlot(slotProps, slot);
      props.className = mergeClassNames(props.className, className);
    }

    if (interactiveClassName) {
      const props = ensureSlot(slotProps, defaultTarget);
      props.className = mergeClassNames(props.className, interactiveClassName);
    }

    for (const state of Object.keys(states) as TState[]) {
      const rule = projections?.[state];
      if (!rule) continue;

      const stateValue = states[state];
      const projectionTarget = rule.target ?? defaultTarget;
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
        props.className = mergeClassNames(props.className, className);
        activeClassTargets.add(projectionTarget);
      }

      if (rule.attribute) {
        applyProjectionAttribute(props, rule.attribute, stateValue, context);
      }

      for (const attribute of rule.attributes ?? []) {
        applyProjectionAttribute(props, attribute, stateValue, context);
      }
    }

    if (activatorClassName) {
      for (const activeTarget of activeClassTargets) {
        const props = ensureSlot(slotProps, activeTarget);
        props.className = mergeClassNames(props.className, activatorClassName);
      }
    }

    return { slotProps };
  }, [activatorClassName, classNames, defaultTarget, interactiveClassName, projections, states]);
}
