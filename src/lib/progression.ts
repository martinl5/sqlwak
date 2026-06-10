import { levels } from '@/data/levels';
import type { Epoch } from '@/types';

// Single source of truth for level progression. Everything here derives from
// the level data itself so adding a level never requires touching the UI.

export const MAX_LEVEL = levels[levels.length - 1].id;

const epochByLevel = new Map<number, Epoch>(levels.map((l) => [l.id, l.epoch]));

export function epochOf(levelId: number): Epoch {
  return epochByLevel.get(levelId) ?? 'Expert';
}

export const XP_BY_EPOCH: Record<Epoch, number> = {
  Foundational: 10,
  Intermediate: 15,
  Advanced: 20,
  Expert: 30,
};

export function xpFor(levelId: number): number {
  return XP_BY_EPOCH[epochOf(levelId)];
}

export const EPOCH_RANK: Record<Epoch, string> = {
  Foundational: 'Graduate Analyst',
  Intermediate: 'Senior Analyst',
  Advanced: 'VP, Data & Analytics',
  Expert: 'Managing Director',
};

export const SHIP_BY_EPOCH: Record<Epoch, { species: string; color: string; size: number }> = {
  Foundational: { species: 'Tugboat',        color: '#c9a84c', size: 14 },
  Intermediate: { species: 'Cargo Ship',     color: '#60a5fa', size: 22 },
  Advanced:     { species: 'Container Ship', color: '#34d399', size: 30 },
  Expert:       { species: 'Supertanker',    color: '#f59e0b', size: 38 },
};

export function shipFor(levelId: number): { species: string; color: string; size: number } {
  return SHIP_BY_EPOCH[epochOf(levelId)];
}

/** Contiguous level ranges per epoch, in play order. */
export const EPOCH_RANGES: { name: Epoch; min: number; max: number }[] = levels.reduce(
  (ranges, level) => {
    const last = ranges[ranges.length - 1];
    if (last && last.name === level.epoch) {
      last.max = level.id;
    } else {
      ranges.push({ name: level.epoch, min: level.id, max: level.id });
    }
    return ranges;
  },
  [] as { name: Epoch; min: number; max: number }[]
);

/** Level ids that begin a new epoch (used for divider markers). */
export const EPOCH_STARTS = new Set(EPOCH_RANGES.slice(1).map((r) => r.min));
