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

/** Total XP available across every level (replays never award XP). */
export const TOTAL_XP = levels.reduce((sum, l) => sum + xpFor(l.id), 0);

/**
 * Header career ladder. Each epoch's rank is reached by banking the XP of
 * all epochs before it, so — unlike a hardcoded table — every rank is
 * genuinely attainable within the game's total XP budget.
 */
export const RANK_LADDER: { name: string; minXp: number }[] = (() => {
  let cumulative = 0;
  const ladder: { name: string; minXp: number }[] = [];
  for (const range of EPOCH_RANGES) {
    ladder.push({ name: EPOCH_RANK[range.name], minXp: cumulative });
    cumulative += levels
      .filter((l) => l.id >= range.min && l.id <= range.max)
      .reduce((sum, l) => sum + xpFor(l.id), 0);
  }
  return ladder;
})();

export interface RankInfo {
  name: string;
  nextName: string | null;
  /** 0–1 progress towards the next rank (1 at the top rank). */
  progress: number;
  xpToNext: number;
}

export function rankInfo(totalXp: number): RankInfo {
  let idx = 0;
  for (let i = 0; i < RANK_LADDER.length; i++) {
    if (totalXp >= RANK_LADDER[i].minXp) idx = i;
  }
  const current = RANK_LADDER[idx];
  const next = RANK_LADDER[idx + 1];
  if (!next) return { name: current.name, nextName: null, progress: 1, xpToNext: 0 };
  return {
    name: current.name,
    nextName: next.name,
    progress: (totalXp - current.minXp) / (next.minXp - current.minXp),
    xpToNext: next.minXp - totalXp,
  };
}
