'use client';

import { useGameStore, selectCurrentEpoch } from '@/store/useGameStore';
import { Ship, ChevronLeft, List } from 'lucide-react';

interface FlockStatusProps {
  onOpenLevelNavigator: () => void;
}

const EPOCH_COLOR: Record<string, string> = {
  Foundational: 'var(--lcb-gold)',
  Intermediate: '#60a5fa',
  Advanced:     '#34d399',
  Expert:       '#f59e0b',
};

export default function FlockStatus({ onOpenLevelNavigator }: FlockStatusProps) {
  const { currentLevel, flockSize, goToPreviousLevel, levelHistory } = useGameStore();
  const epoch     = selectCurrentEpoch(currentLevel);
  const canGoBack = levelHistory.length > 1;

  return (
    <div
      className="flex items-center gap-3 px-3 py-2"
      style={{ background: 'var(--lcb-panel)', border: '1px solid var(--lcb-border)', borderRadius: 6 }}
    >
      {/* Nav buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenLevelNavigator}
          className="p-1.5 transition-colors hover:opacity-70"
          style={{ color: 'var(--lcb-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--lcb-border)', borderRadius: 4 }}
          title="Browse levels"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={goToPreviousLevel}
          disabled={!canGoBack}
          className="p-1.5 transition-colors"
          style={{
            color: canGoBack ? 'var(--lcb-muted)' : 'var(--lcb-border)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--lcb-border)',
            borderRadius: 4,
            cursor: canGoBack ? 'pointer' : 'not-allowed',
          }}
          title="Previous level"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--lcb-border)' }} />

      {/* Level */}
      <div>
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>Level</p>
        <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-white)', lineHeight: 1 }}>{currentLevel}</p>
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--lcb-border)' }} />

      {/* Fleet size */}
      <div className="flex items-center gap-2">
        <Ship className="w-4 h-4" style={{ color: EPOCH_COLOR[epoch] }} />
        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>Fleet</p>
          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-white)', lineHeight: 1 }}>{flockSize}</p>
        </div>
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--lcb-border)' }} />

      {/* Epoch */}
      <div
        className="flex-1 px-3 py-1.5"
        style={{ border: `1px solid ${EPOCH_COLOR[epoch]}30`, borderLeft: `2px solid ${EPOCH_COLOR[epoch]}`, background: `${EPOCH_COLOR[epoch]}0d`, borderRadius: 4 }}
      >
        <p className="text-xs uppercase tracking-widest" style={{ color: EPOCH_COLOR[epoch], fontFamily: 'var(--font-ibm-plex-mono)' }}>{epoch}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--lcb-white)', opacity: 0.7, fontFamily: 'var(--font-ibm-plex-mono)' }}>
          {epoch === 'Foundational' && 'Basic SQL Foundations'}
          {epoch === 'Intermediate' && 'Aggregation & Joins'}
          {epoch === 'Advanced'     && 'CTEs & Window Functions'}
          {epoch === 'Expert'       && 'Advanced Analytics'}
        </p>
      </div>
    </div>
  );
}
