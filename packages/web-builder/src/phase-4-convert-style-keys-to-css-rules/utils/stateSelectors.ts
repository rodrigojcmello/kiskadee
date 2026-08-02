import { alwaysProjectedStateKeys } from '@kiskadee/core';

const alwaysProjectedStateSet: ReadonlySet<string> = new Set(alwaysProjectedStateKeys);

export function hasAlwaysProjectedState(states: readonly string[]): boolean {
  return states.some((state) => alwaysProjectedStateSet.has(state));
}
