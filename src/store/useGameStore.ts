import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Level, Boid, QueryResult } from '@/types';

export function epochXpGain(level: number): number {
  if (level <= 15) return 100;
  if (level <= 30) return 200;
  if (level <= 40) return 300;
  return 400;
}

interface GameState {
  // Level progression
  currentLevel: number;
  completedLevels: number[];
  levelHistory: number[]; // Track all visited levels for back navigation

  // Gamification
  xp: number;
  streak: number;

  // Flock
  boids: Boid[];
  flockSize: number;

  // Query state
  queryResult: QueryResult | null;
  error: string | null;
  isExecuting: boolean;
  hasAttemptedCurrent: boolean;

  // UI state
  showLevelUp: boolean;
  lastSpawnedBird: { x: number; y: number } | null;

  // User
  userName: string | null;

  // Actions
  setCurrentLevel: (level: number) => void;
  completeLevel: (level: number) => void;
  addBoid: (boid: Boid) => void;
  removeBoid: (id: number) => void;
  setQueryResult: (result: QueryResult | null) => void;
  setError: (error: string | null) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  setHasAttemptedCurrent: (hasAttempted: boolean) => void;
  setShowLevelUp: (show: boolean) => void;
  setLastSpawnedBird: (pos: { x: number; y: number } | null) => void;
  setUserName: (name: string | null) => void;
  resetGame: () => void;
  goToPreviousLevel: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentLevel: 1,
      completedLevels: [],
      levelHistory: [],
      xp: 0,
      streak: 0,
      boids: [],
      flockSize: 0,
      queryResult: null,
      error: null,
      isExecuting: false,
      hasAttemptedCurrent: false,
      showLevelUp: false,
      lastSpawnedBird: null,
      userName: null,

      setCurrentLevel: (level) =>
        set((state) => ({
          currentLevel: level,
          levelHistory: state.levelHistory.includes(level)
            ? state.levelHistory
            : [...state.levelHistory, level],
          hasAttemptedCurrent: false,
          streak: 0,
        })),

      completeLevel: (level) =>
        set((state) => {
          const alreadyDone = state.completedLevels.includes(level);
          const gain = epochXpGain(level);
          return {
            completedLevels: alreadyDone ? state.completedLevels : [...state.completedLevels, level],
            currentLevel: level + 1,
            levelHistory: [...state.levelHistory, level + 1],
            hasAttemptedCurrent: false,
            xp: alreadyDone ? state.xp : state.xp + gain,
            streak: alreadyDone ? state.streak : state.streak + 1,
          };
        }),

      addBoid: (boid) =>
        set((state) => ({
          boids: [...state.boids, boid],
          flockSize: state.flockSize + 1,
        })),

      removeBoid: (id) =>
        set((state) => ({
          boids: state.boids.filter((b) => b.id !== id),
          flockSize: Math.max(0, state.flockSize - 1),
        })),

      setQueryResult: (result) => set({ queryResult: result }),
      setError: (error) => set({ error }),
      setIsExecuting: (isExecuting) => set({ isExecuting }),
      setHasAttemptedCurrent: (hasAttempted) => set({ hasAttemptedCurrent: hasAttempted }),
      setShowLevelUp: (show) => set({ showLevelUp: show }),
      setLastSpawnedBird: (pos) => set({ lastSpawnedBird: pos }),
      setUserName: (name) => set({ userName: name }),

      resetGame: () =>
        set({
          currentLevel: 1,
          completedLevels: [],
          levelHistory: [1],
          xp: 0,
          streak: 0,
          boids: [],
          flockSize: 0,
          queryResult: null,
          error: null,
          hasAttemptedCurrent: false,
          showLevelUp: false,
        }),

      goToPreviousLevel: () => {
        const state = get();
        if (state.levelHistory.length > 1) {
          const newHistory = [...state.levelHistory];
          newHistory.pop(); // Remove current level
          const previousLevel = newHistory[newHistory.length - 1];
          set({ 
            currentLevel: previousLevel,
            hasAttemptedCurrent: false,
          });
        }
      },
    }),
    {
      name: 'lcb-analytics-storage',
      partialize: (state) => ({
        currentLevel: state.currentLevel,
        completedLevels: state.completedLevels,
        levelHistory: state.levelHistory,
        flockSize: state.flockSize,
        userName: state.userName,
        xp: state.xp,
        streak: state.streak,
      }),
    }
  )
);

// Helper selectors
export const selectCurrentEpoch = (level: number): string => {
  if (level <= 15) return 'Foundational';
  if (level <= 30) return 'Intermediate';
  if (level <= 40) return 'Advanced';
  return 'Expert';
};

export const selectBoidSpecies = (level: number): { species: string; color: string; size: number } => {
  if (level <= 15) return { species: 'Tugboat',        color: '#c9a84c', size: 14 };
  if (level <= 30) return { species: 'Cargo Ship',     color: '#60a5fa', size: 22 };
  if (level <= 40) return { species: 'Container Ship', color: '#34d399', size: 30 };
  return                  { species: 'Supertanker',    color: '#f59e0b', size: 38 };
};
