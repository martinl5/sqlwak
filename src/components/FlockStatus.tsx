'use client';

import { useGameStore, selectCurrentEpoch } from '@/store/useGameStore';
import { Feather, ChevronLeft } from 'lucide-react';

export default function FlockStatus() {
  const { currentLevel, flockSize, resetGame, goToPreviousLevel, levelHistory } = useGameStore();
  const epoch = selectCurrentEpoch(currentLevel);
  const canGoBack = levelHistory.length > 1;

  const epochColors: Record<string, string> = {
    Foundational: 'from-sky-400 to-blue-500',
    Intermediate: 'from-cyan-500 to-sky-600',
    Advanced: 'from-indigo-400 to-purple-500',
    Expert: 'from-violet-500 to-purple-700',
  };

  const epochDescriptions: Record<string, string> = {
    Foundational: 'Basic SQL Foundations',
    Intermediate: 'Queries & Aggregation',
    Advanced: 'Complex Analysis',
    Expert: 'Advanced Modeling',
  };

  return (
    <div className="p-3 flex items-center justify-between gap-4 rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(13, 31, 53, 0.95)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
      {/* Navigation Button */}
      <div className="flex items-center gap-1">
        <button
          onClick={goToPreviousLevel}
          disabled={!canGoBack}
          className={`p-2 rounded-lg transition-colors ${
            canGoBack 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
          title="Go back to previous level"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-white/10" />

      {/* Level */}
      <div className="flex items-center gap-3">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider">Level</p>
          <p className="text-2xl font-bold text-white">{currentLevel}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-white/10" />

      {/* Bird Count */}
      <div className="flex items-center gap-3">
        <Feather className="w-5 h-5 text-cyan-400" />
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider">Birds</p>
          <p className="text-2xl font-bold text-white">{flockSize}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-white/10" />

      {/* Era */}
      <div className={`flex-1 p-2 rounded-lg bg-gradient-to-r ${epochColors[epoch]} opacity-90`}>
        <p className="text-white/80 text-xs">{epoch}</p>
        <p className="text-white font-semibold text-sm">{epochDescriptions[epoch]}</p>
      </div>
    </div>
  );
}
