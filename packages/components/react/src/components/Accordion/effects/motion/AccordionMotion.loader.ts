import { createLazyModuleCache, useLazyModule } from '../../../../shared/utils/lazyModule.ts';

const cache = createLazyModuleCache(() => import('./AccordionMotion.effect.ts'));
export const useAccordionMotionModule = (enabled: boolean) => useLazyModule(cache, enabled);
