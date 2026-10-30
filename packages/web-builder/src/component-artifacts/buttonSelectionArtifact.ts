import type { ClassNameByElementJSON } from '@kiskadee/core';

/** References to existing High Rest/interactions and non-Selected effects; no new CSS or geometry. */
export type ButtonSelectionRestClassMapJSON = Partial<
  Record<'e1' | 'e2' | 'e3' | 'e4' | 'e5', Pick<ClassNameByElementJSON, 'c' | 'e'>>
>;
