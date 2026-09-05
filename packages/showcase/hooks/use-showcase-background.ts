'use client';

import { useShowcasePanel } from '@/app/ShowcasePanelContext';

export function useShowcaseBackground() {
  return useShowcasePanel().background;
}
