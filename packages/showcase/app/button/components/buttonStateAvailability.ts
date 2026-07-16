const STATES_WITH_UNAVAILABLE_INDICATOR = new Set(['hover', 'pressed', 'selected']);

export function shouldCheckButtonStateAvailability(state: string): boolean {
  return STATES_WITH_UNAVAILABLE_INDICATOR.has(state);
}
