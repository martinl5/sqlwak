'use client';

import { useGameStore, selectCurrentEpoch } from '@/store/useGameStore';
import { levels } from '@/data/levels';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface LevelNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LevelNavigator({ isOpen, onClose }: LevelNavigatorProps) {
  const { currentLevel, completedLevels, setCurrentLevel } = useGameStore();

  const epochs = ['Foundational', 'Intermediate', 'Advanced', 'Expert'];
  
  const getEpochLevels = (epoch: string) => {
    return levels.filter((l) => l.epoch === epoch);
  };

  const handleSelectLevel = (levelId: number) => {
    setCurrentLevel(levelId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-[380px] bg-[#0D1935] border-l border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Select Level</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Level List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {epochs.map((epoch) => {
            const epochLevels = getEpochLevels(epoch);
            if (epochLevels.length === 0) return null;

            return (
              <div key={epoch}>
                <h3 className="text-sm font-medium text-white/60 mb-2 uppercase tracking-wider">{epoch}</h3>
                <div className="grid grid-cols-5 gap-2">
                  {epochLevels.map((level) => {
                    const isCompleted = completedLevels.includes(level.id);
                    const isCurrent = currentLevel === level.id;

                    return (
                      <button
                        key={level.id}
                        onClick={() => handleSelectLevel(level.id)}
                        className={`
                          relative aspect-square rounded-lg text-sm font-medium transition-all
                          ${isCurrent 
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30' 
                            : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }
                        `}
                        title={level.title}
                      >
                        {isCompleted && !isCurrent && (
                          <Check className="w-3 h-3 absolute top-1 left-1 text-emerald-400" />
                        )}
                        <span className={isCurrent ? '' : 'mt-1 block'}>{level.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
