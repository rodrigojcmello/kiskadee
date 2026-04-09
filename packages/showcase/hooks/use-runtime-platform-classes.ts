import { applyRuntimePlatformClasses } from '@kiskadee/runtime';
import { useEffect } from 'react';

export function useRuntimePlatformClasses() {
  useEffect(() => {
    applyRuntimePlatformClasses({
      target: 'body'
    });
  }, []);
}
