import { describe, expect, it } from 'vitest';
import {
  MAX_LEVEL,
  TOTAL_XP,
  RANK_LADDER,
  rankInfo,
  xpFor,
  EPOCH_RANGES,
} from '@/lib/progression';
import { levels } from '@/data/levels';

describe('RANK_LADDER', () => {
  it('has one rank per epoch with strictly increasing thresholds', () => {
    expect(RANK_LADDER.length).toBe(EPOCH_RANGES.length);
    for (let i = 1; i < RANK_LADDER.length; i++) {
      expect(RANK_LADDER[i].minXp).toBeGreaterThan(RANK_LADDER[i - 1].minXp);
    }
  });

  it('keeps every rank reachable within the game XP budget', () => {
    const top = RANK_LADDER[RANK_LADDER.length - 1];
    expect(top.minXp).toBeLessThan(TOTAL_XP);
  });

  it('matches the sum of per-level XP', () => {
    expect(TOTAL_XP).toBe(levels.reduce((sum, l) => sum + xpFor(l.id), 0));
  });
});

describe('rankInfo', () => {
  it('starts at the first rank with zero XP', () => {
    const r = rankInfo(0);
    expect(r.name).toBe(RANK_LADDER[0].name);
    expect(r.nextName).toBe(RANK_LADDER[1].name);
    expect(r.progress).toBe(0);
  });

  it('reaches the top rank when all XP is banked', () => {
    const r = rankInfo(TOTAL_XP);
    expect(r.name).toBe(RANK_LADDER[RANK_LADDER.length - 1].name);
    expect(r.nextName).toBeNull();
    expect(r.progress).toBe(1);
    expect(r.xpToNext).toBe(0);
  });

  it('reports progress within a rank band', () => {
    const second = RANK_LADDER[1];
    const r = rankInfo(second.minXp - 1);
    expect(r.name).toBe(RANK_LADDER[0].name);
    expect(r.xpToNext).toBe(1);
    expect(r.progress).toBeGreaterThan(0);
    expect(r.progress).toBeLessThan(1);
  });

  it('finishing the whole game makes Managing Director', () => {
    const allXp = Array.from({ length: MAX_LEVEL }, (_, i) => xpFor(i + 1)).reduce((a, b) => a + b, 0);
    expect(rankInfo(allXp).name).toBe('Managing Director');
  });
});
