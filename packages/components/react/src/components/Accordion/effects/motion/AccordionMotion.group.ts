import type { TransitionSpeed } from '../../../../shared/motion/transitionSpeed.ts';
import type { AccordionTransitionCoordination } from '../../Accordion.types.ts';
import type {
  AccordionMotionParticipant,
  animateAccordionPanels
} from './AccordionMotion.effect.ts';
import { resolveAccordionTransition } from './AccordionMotion.recipes.ts';

type Entry = AccordionMotionParticipant & { finish: () => void };
type Batch = { ids: Set<string>; synchronized: boolean; cancel: () => void };
export type AccordionMotionSettings = {
  animate: typeof animateAccordionPanels | null;
  speed: TransitionSpeed;
  coordination: AccordionTransitionCoordination;
};

/** Collect committed panel changes before painting, without owning expansion state. */
export function createAccordionMotionGroup() {
  const entries = new Map<string, Entry>();
  const pending = new Map<string, boolean>();
  const batches = new Set<Batch>();
  let settings: AccordionMotionSettings = {
    animate: null,
    speed: 'normal',
    coordination: 'synchronized'
  };
  let queued = false;
  let epoch = 0;
  const immediate = (entry: Entry) => {
    entry.panel.style.height = entry.open ? 'auto' : '0px';
    entry.panel.style.overflow = entry.open ? '' : 'hidden';
    entry.finish();
  };
  const settle = () => {
    for (const batch of batches) batch.cancel();
    batches.clear();
    pending.clear();
    for (const entry of entries.values()) immediate(entry);
  };
  const flush = () => {
    queued = false;
    if (!pending.size) return;
    const ids = new Set(pending.keys());
    const opening = [...pending].some(([id, before]) => !before && entries.get(id)?.open);
    const closing = [...pending].some(([id, before]) => before && !entries.get(id)?.open);
    let interrupted = false;
    for (const batch of [...batches]) {
      if (![...batch.ids].some((id) => ids.has(id))) continue;
      batch.cancel();
      batches.delete(batch);
      if (batch.synchronized) {
        interrupted = true;
        for (const id of batch.ids) ids.add(id);
      }
    }
    pending.clear();
    if (!settings.animate) {
      for (const id of ids) {
        const entry = entries.get(id);
        if (entry) immediate(entry);
      }
      return;
    }
    const synchronized =
      settings.coordination === 'synchronized' && ((opening && closing) || interrupted);
    const groups = synchronized ? [ids] : [...ids].map((id) => new Set([id]));
    for (const members of groups) {
      const participants = [...members].flatMap((id) => {
        const entry = entries.get(id);
        return entry ? [entry] : [];
      });
      if (!participants.length) continue;
      const batch: Batch = { ids: members, synchronized, cancel() {} };
      batches.add(batch);
      batch.cancel = settings.animate(
        participants,
        resolveAccordionTransition(settings.speed, synchronized || participants[0]!.open),
        () => {
          if (!batches.delete(batch)) return;
          for (const entry of participants) entry.finish();
        }
      );
    }
  };
  return {
    configure(next: AccordionMotionSettings) {
      if (
        settings.animate !== next.animate ||
        settings.speed !== next.speed ||
        settings.coordination !== next.coordination
      ) {
        settings = next;
        settle();
      }
    },
    update(id: string, entry: Entry) {
      const previous = entries.get(id);
      entries.set(id, entry);
      if (!previous) {
        immediate(entry);
        return;
      }
      if (previous.open === entry.open) return;
      if (!settings.animate) {
        immediate(entry);
        return;
      }
      if (!pending.has(id)) pending.set(id, previous.open);
      if (pending.get(id) === entry.open) pending.delete(id);
      if (!queued && pending.size) {
        queued = true;
        const version = epoch;
        queueMicrotask(() => {
          if (version === epoch) flush();
        });
      }
    },
    remove(id: string) {
      entries.delete(id);
      pending.delete(id);
      for (const batch of [...batches]) {
        if (!batch.ids.has(id)) continue;
        batch.cancel();
        batches.delete(batch);
        for (const member of batch.ids) {
          const entry = entries.get(member);
          if (entry) immediate(entry);
        }
      }
    },
    destroy() {
      epoch++;
      queued = false;
      for (const batch of batches) batch.cancel();
      batches.clear();
      pending.clear();
      entries.clear();
    }
  };
}
export type AccordionMotionGroup = ReturnType<typeof createAccordionMotionGroup>;
