import { useStyle } from './useStyle';

const cacheMap = new Map<string, string>();

export const useItalic = (value = false): string | undefined => {
  return useStyle(cacheMap, {
    key: `${value}`,
    style: { fontStyle: value ? 'italic' : 'normal' },
  })[0];
};
