import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { xpFor } from '@/lib/progression';
import type { Boid, QueryResult } from '@/types';

interface GameState {
  // Level progression
  currentLevel: number;
  completedLevels: number[];
  levelHistory: number[]; // Track all visited levels for back navigation

  // Gamification
  totalXp: number;
  currentStreak: number;

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
      totalXp: 0,
      currentStreak: 0,
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
          // Add to history when navigating to a new level
          levelHistory: state.levelHistory.includes(level) 
            ? state.levelHistory 
            : [...state.levelHistory, level],
          hasAttemptedCurrent: false,
        })),

      completeLevel: (level) =>
        set((state) => {
          const xpGain = xpFor(level);
          return {
            completedLevels: state.completedLevels.includes(level)
              ? state.completedLevels
              : [...state.completedLevels, level],
            currentLevel: level + 1,
            levelHistory: [...state.levelHistory, level + 1],
            hasAttemptedCurrent: false,
            totalXp: state.totalXp + xpGain,
            currentStreak: state.currentStreak + 1,
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
          totalXp: 0,
          currentStreak: 0,
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
        totalXp: state.totalXp,
        currentStreak: state.currentStreak,
      }),
    }
  )
);
