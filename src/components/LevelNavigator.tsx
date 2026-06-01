'use client';

import { useGameStore, selectCurrentEpoch } from '@/store/useGameStore';
import { levels } from '@/data/levels';
import { Check, X } from 'lucide-react';

interface LevelNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const EPOCH_COLOR: Record<string, string> = {
  Foundational: '#c9a84c',
  Intermediate: '#60a5fa',
  Advanced:     '#34d399',
  Expert:       '#f59e0b',
};

export default function LevelNavigator({ isOpen, onClose }: LevelNavigatorProps) {
  const { currentLevel, completedLevels, setCurrentLevel } = useGameStore();

  const handleSelect = (id: number) => { setCurrentLevel(id); onClose(); };

  if (!isOpen) return null;

  const epochs = ['Foundational', 'Intermediate', 'Advanced', 'Expert'] as const;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[360px] flex flex-col"
        style={{ background: 'var(--lcb-panel)', borderLeft: '1px solid var(--lcb-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--lcb-border)', background: 'var(--lcb-panel-2)' }}
        >
          <div className="lcb-header">
            <p className="text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-muted)' }}>
              Level Navigator
            </p>
            <h2 className="text-sm font-semibold mt-0.5" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-white)' }}>
              Select a Challenge
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 transition-opacity hover:opacity-60"
            style={{ color: 'var(--lcb-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--lcb-border)' }}>
          <div className="flex justify-between text-xs mb-1.5" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-muted)' }}>
            <span>Progress</span>
            <span style={{ color: 'var(--lcb-gold)' }}>{completedLevels.length} / 50</span>
          </div>
          <div className="h-1 w-full" style={{ background: 'var(--lcb-border)', borderRadius: 2 }}>
            <div
              className="h-full transition-all"
              style={{ width: `${(completedLevels.length / 50) * 100}%`, background: 'var(--lcb-gold)', borderRadius: 2 }}
            />
          </div>
        </div>

        {/* Levels grouped by epoch */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {epochs.map((epoch) => {
            const epochLevels = levels.filter((l) => l.epoch === epoch);
            const color = EPOCH_COLOR[epoch];
            return (
              <div key={epoch}>
                <p
                  className="text-xs uppercase tracking-widest mb-2 px-1"
                  style={{ fontFamily: 'var(--font-ibm-plex-mono)', color, borderLeft: `2px solid ${color}`, paddingLeft: 8 }}
                >
                  {epoch}
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {epochLevels.map((level) => {
                    const done    = completedLevels.includes(level.id);
                    const current = currentLevel === level.id;
                    return (
                      <button
                        key={level.id}
                        onClick={() => handleSelect(level.id)}
                        className="relative aspect-square flex items-center justify-center text-xs font-medium transition-all"
                        style={{
                          borderRadius: 4,
                          border: current ? `1px solid ${color}` : '1px solid var(--lcb-border)',
                          background: current
                            ? `${color}20`
                            : done
                            ? 'rgba(34,197,94,0.08)'
                            : 'rgba(255,255,255,0.03)',
                          color: current
                            ? color
                            : done
                            ? '#22c55e'
                            : 'var(--lcb-muted)',
                        }}
                        title={level.title}
                      >
                        {done && !current && (
                          <Check className="w-2.5 h-2.5 absolute top-0.5 left-0.5" style={{ color: '#22c55e' }} />
                        )}
                        <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 11 }}>{level.id}</span>
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
