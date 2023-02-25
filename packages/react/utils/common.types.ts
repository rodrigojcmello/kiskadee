export type BreakpointKey =
  | 'small1'
  | 'small2'
  | 'small3'
  | 'medium1'
  | 'medium2'
  | 'medium3'
  | 'big1'
  | 'big2'
  | 'big3';

export type SizeResponsive<Value> = Partial<Record<BreakpointKey, Value>>;

export interface SpacingValue {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export const breakpoints: Record<BreakpointKey, number> = {
  small1: 0,
  small2: 321,
  small3: 376,

  medium1: 481,
  medium2: 641,
  medium3: 769,

  big1: 1025,
  big2: 1281,
  big3: 1441,
};
