import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';

export type BottomSheetPageTransitionEffectProps = {
  children: ReactNode;
  direction: 'forward' | 'back';
  pageId: string;
};

const PAGE_TRANSITION = {
  duration: 0.2,
  ease: [0.2, 0, 0, 1]
} as const;

function readInlineDirection(): 'ltr' | 'rtl' {
  if (typeof document === 'undefined') return 'ltr';
  return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
}

export function BottomSheetPageTransitionEffect({
  children,
  direction,
  pageId
}: BottomSheetPageTransitionEffectProps) {
  const rtlMultiplier = readInlineDirection() === 'rtl' ? -1 : 1;
  const navigationMultiplier = direction === 'forward' ? 1 : -1;
  const travel = 18 * rtlMultiplier * navigationMultiplier;

  return (
    <AnimatePresence initial={false} mode="popLayout" custom={travel}>
      <motion.div
        key={pageId}
        className="k-bsh-x3"
        custom={travel}
        initial={{ opacity: 0, x: `${travel}%` }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: `${-travel}%` }}
        transition={PAGE_TRANSITION}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
