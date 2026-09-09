export type ControlCursorValue = 'default' | 'pointer';
export type ControlCursor = { value: ControlCursorValue; scope: 'web' | 'all' };
export type SchemaInteraction = { controlCursor?: ControlCursor };

export const DEFAULT_CONTROL_CURSOR = {
  value: 'pointer',
  scope: 'web'
} as const satisfies ControlCursor;

/** Resolves a platform preference without detecting a browser or operating system. */
export function resolveControlCursor(
  cursor: ControlCursor = DEFAULT_CONTROL_CURSOR,
  target: 'web' | 'native' = 'web'
): ControlCursorValue {
  return cursor.scope === 'all' || target === 'web' ? cursor.value : 'default';
}
