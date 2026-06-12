'use client';

import { Fragment } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { levels } from '@/data/levels';
import { EPOCH_STARTS } from '@/lib/progression';

const EPOCH_DOT_COLOR: Record<string, string> = {
  Foundational: '#c9a84c',
  Intermediate: '#60a5fa',
  Advanced:     '#34d399',
  Expert:       '#f59e0b',
};

export default function LevelProgressMap() {
  const { currentLevel, completedLevels, setCurrentLevel } = useGameStore();

  return (
    <div
      className="lcb-map-strip flex items-center px-4"
      style={{
        background: 'var(--lcb-panel-2)',
        borderBottom: '1px solid var(--lcb-border)',
        flexShrink: 0,
        gap: 2,
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
      }}
    >
      {levels.map((level) => {
        const isCompleted = completedLevels.includes(level.id);
        const isCurrent   = currentLevel === level.id;
        const dotColor    = EPOCH_DOT_COLOR[level.epoch] ?? '#c9a84c';

        return (
          <Fragment key={level.id}>
            {EPOCH_STARTS.has(level.id) && (
              <div
                aria-hidden
                style={{
                  width: 1,
                  height: 12,
                  background: 'var(--lcb-border)',
                  flexShrink: 0,
                  margin: '0 3px',
                }}
              />
            )}
            <button
              onClick={() => setCurrentLevel(level.id)}
              title={`Lvl ${level.id}: ${level.title}`}
              aria-label={`Go to Level ${level.id}: ${level.title}`}
              className="lcb-map-dot"
              style={{
                borderRadius: 2,
                flexShrink: 0,
                border: isCurrent ? `1px solid ${dotColor}` : '1px solid transparent',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform 0.12s, opacity 0.12s',
                background: isCurrent ? dotColor : isCompleted ? '#22c55e' : 'rgba(255,255,255,0.06)',
                opacity: isCurrent ? 1 : isCompleted ? 0.72 : 0.22,
                animation: isCurrent ? 'levelMapPulse 1.8s ease-in-out infinite' : 'none',
              }}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
