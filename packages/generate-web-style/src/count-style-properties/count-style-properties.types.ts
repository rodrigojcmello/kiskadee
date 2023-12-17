import type { StyleKey, UniqueStyle } from '@/types';

export type AddPropertyToUniqueStyle = (
  uniqueStyle: UniqueStyle,
  property: StyleKey,
  value?: string,
) => UniqueStyle;
