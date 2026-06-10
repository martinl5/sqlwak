import { beforeEach, describe, expect, it } from 'vitest';

// The store persists via localStorage; give Node a minimal implementation
// before the store module is imported.
const backing = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => backing.get(k) ?? null,
  setItem: (k: string, v: string) => void backing.set(k, v),
  removeItem: (k: string) => void backing.delete(k),
  clear: () => backing.clear(),
  key: (i: number) => [...backing.keys()][i] ?? null,
  get length() {
    return backing.size;
  },
} as Storage;

const { useGameStore } = await import('@/store/useGameStore');
const { MAX_LEVEL, xpFor } = await import('@/lib/progression');

beforeEach(() => {
  useGameStore.getState().resetGame();
});

describe('completeLevel', () => {
  it('records completion, awards epoch XP, and advances to the next level', () => {
    useGameStore.getState().completeLevel(1);
    const s = useGameStore.getState();
    expect(s.completedLevels).toEqual([1]);
    expect(s.totalXp).toBe(xpFor(1));
    expect(s.currentLevel).toBe(2);
    expect(s.currentStreak).toBe(1);
  });

  it('awards more XP for higher epochs', () => {
    expect(xpFor(41)).toBeGreaterThan(xpFor(1));
    useGameStore.getState().completeLevel(41);
    expect(useGameStore.getState().totalXp).toBe(xpFor(41));
  });

  it('does not award XP again when a level is replayed', () => {
    useGameStore.getState().completeLevel(1);
    useGameStore.getState().completeLevel(1);
    const s = useGameStore.getState();
    expect(s.completedLevels).toEqual([1]);
    expect(s.totalXp).toBe(xpFor(1));
    // ...but the solve streak still counts both solves
    expect(s.currentStreak).toBe(2);
  });

  it('does not advance past the final level', () => {
    useGameStore.getState().completeLevel(MAX_LEVEL);
    expect(useGameStore.getState().currentLevel).toBe(MAX_LEVEL);
  });

  it('does not duplicate levels in history', () => {
    useGameStore.getState().setCurrentLevel(2);
    useGameStore.getState().completeLevel(1);
    const history = useGameStore.getState().levelHistory;
    expect(new Set(history).size).toBe(history.length);
  });
});

describe('navigation', () => {
  it('setCurrentLevel resets the attempt flag and tracks history', () => {
    useGameStore.getState().setHasAttemptedCurrent(true);
    useGameStore.getState().setCurrentLevel(5);
    const s = useGameStore.getState();
    expect(s.currentLevel).toBe(5);
    expect(s.hasAttemptedCurrent).toBe(false);
    expect(s.levelHistory).toContain(5);
  });

  it('goToPreviousLevel walks back through history and is a no-op at the start', () => {
    useGameStore.getState().setCurrentLevel(3);
    useGameStore.getState().setCurrentLevel(7);
    useGameStore.getState().goToPreviousLevel();
    expect(useGameStore.getState().currentLevel).toBe(3);

    useGameStore.getState().goToPreviousLevel();
    expect(useGameStore.getState().currentLevel).toBe(1);

    useGameStore.getState().goToPreviousLevel(); // history exhausted — no-op
    expect(useGameStore.getState().currentLevel).toBe(1);
  });
});

describe('resetGame', () => {
  it('returns progression to the initial state', () => {
    useGameStore.getState().completeLevel(1);
    useGameStore.getState().completeLevel(2);
    useGameStore.getState().resetGame();
    const s = useGameStore.getState();
    expect(s.currentLevel).toBe(1);
    expect(s.completedLevels).toEqual([]);
    expect(s.totalXp).toBe(0);
    expect(s.currentStreak).toBe(0);
  });
});
