'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore } from '@/store/useGameStore';
import { levels } from '@/data/levels';
import { epochOf, shipFor, xpFor, EPOCH_RANK, MAX_LEVEL } from '@/lib/progression';
import { X, Anchor, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';

const EPOCH_NEXT_HINT: Record<number, string> = {
  10: 'Continue mastering SELECT and WHERE filters',
  20: 'Unlock JOINs and multi-table aggregation',
  30: 'Master GROUP BY, HAVING and subqueries',
  40: 'Tackle the Maritime Trade Finance division',
  44: 'Command Expert-level banking CTEs and window functions',
  54: 'Master complex Maritime Trade Finance analytics',
  57: 'Senior DS patterns: A/B test analysis, LAG window functions',
  59: 'LEAD function: next-event lookahead and gap analysis for vessel scheduling',
  61: 'Conditional aggregation pivot: COUNT(CASE WHEN ...) — the standard SQL pivot pattern for any dialect',
  63: 'Rolling volatility: SQRT(AVG(x²) − AVG(x)²) — population std dev via window functions',
  64: 'NTILE bucketing: equal-count portfolio tranching for Basel III capital adequacy reporting',
  65: 'Running balance: SUM() OVER (ROWS UNBOUNDED PRECEDING) — the universal treasury ledger pattern',
  66: 'Anti-joins: LEFT JOIN … IS NULL — finding the rows that have no match',
  67: 'NOT EXISTS: the correlated anti-join without the NOT IN NULL trap',
  68: 'Cohort retention: first-login cohort month → Month-1 return rate — the core product-growth metric',
  69: 'Sessionization / gaps & islands: LAG → flag → SUM() OVER → aggregate — the universal session-detection pattern',
  70: 'Risk scorecard: weighted-average rate via SUM(x*w)/SUM(w), CROSS JOIN scalar CTE for denominators, running exposure window function',
  71: 'Year-over-Year growth: STRFTIME → GROUP BY year → LAG(total) OVER → CASE WHEN NULL — the canonical period-over-period growth pattern',
  72: 'Funnel analysis: UNION ALL multi-stage aggregation + CROSS JOIN scalar CTE for conversion rates — the standard product-analytics funnel pattern',
  73: 'Deduplication: ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...) + WHERE rn = 1 — pick exactly one row per group, the universal dedup / latest-record-per-entity pattern',
};

export default function LevelUpModal() {
  const { showLevelUp, setShowLevelUp, currentLevel, completeLevel, completedLevels, flockSize } = useGameStore();
  const [showSolution, setShowSolution] = useState(false);

  const ship  = shipFor(currentLevel);
  const epoch = epochOf(currentLevel);
  const level = levels.find((l) => l.id === currentLevel);
  // completeLevel runs on close, so at display time this still tells us
  // whether the solve was a replay (XP is only banked once per level).
  const isReplay = completedLevels.includes(currentLevel);

  useEffect(() => {
    if (!showLevelUp) return;
    const end = Date.now() + 1800;
    const frame = () => {
      confetti({ particleCount: 2, angle: 60,  spread: 55, origin: { x: 0, y: 0.7 }, colors: ['#c9a84c','#e8e6e0','#22c55e'], disableForReducedMotion: true });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ['#c9a84c','#e8e6e0','#22c55e'], disableForReducedMotion: true });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [showLevelUp]);

  const handleClose = useCallback(() => {
    setShowLevelUp(false);
    setShowSolution(false); // collapsed again for the next solve
    completeLevel(currentLevel);
  }, [setShowLevelUp, completeLevel, currentLevel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && showLevelUp) handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showLevelUp, handleClose]);

  const nextHintKey = [10, 20, 30, 40, 44, 54, 57, 59, 61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73].find((k) => currentLevel < k) ?? 73;
  const xpEarned    = xpFor(currentLevel);

  return (
    <AnimatePresence>
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={handleClose}
          />

          {/* Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-up-title"
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.88, opacity: 0, y: 16  }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto"
            style={{ background: 'var(--lcb-panel)', border: '1px solid var(--lcb-border)', borderRadius: 8, borderTop: '3px solid var(--lcb-gold)' }}
          >
            {/* Top accent row */}
            <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--lcb-border)' }}>
              {/* Ship icon */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', damping: 18 }}
                className="w-14 h-14 mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid var(--lcb-gold)', borderRadius: 6 }}
              >
                <Anchor className="w-7 h-7" style={{ color: 'var(--lcb-gold)' }} />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center text-xs tracking-widest uppercase mb-1"
                style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-muted)' }}
              >
                Query Accepted
              </motion.p>
              <motion.h2
                id="level-up-title"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-center text-2xl font-bold"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-white)' }}
              >
                Level {currentLevel} Complete
              </motion.h2>
            </div>

            {/* Ship docked badge */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="mx-6 mt-4 flex items-center gap-2 px-3 py-2"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid var(--lcb-gold-dim)', borderRadius: 4 }}
            >
              <span className="text-lg">🚢</span>
              <span className="text-xs" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-gold)' }}>
                {ship.species} docked in the harbour
              </span>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="grid grid-cols-2 gap-2 mx-6 mt-3"
            >
              {[
                { label: 'Fleet Size', value: flockSize },
                { label: 'Current Tier', value: epoch },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="px-3 py-2 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--lcb-border)', borderRadius: 4 }}
                >
                  <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>{label}</p>
                  <p className="text-lg font-bold mt-0.5" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-white)' }}>{value}</p>
                </div>
              ))}
            </motion.div>

            {/* Career tier */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.44 }}
              className="mx-6 mt-2 px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--lcb-border)', borderRadius: 4 }}
            >
              <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
                LCB Career Level
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-gold)' }}>
                {EPOCH_RANK[epoch]}
              </p>
            </motion.div>

            {/* XP earned badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.48, type: 'spring', damping: 14, stiffness: 280 }}
              className="mx-6 mt-3 flex items-center justify-center gap-2 px-3 py-2"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--lcb-gold)', borderRadius: 4 }}
            >
              <span style={{ fontSize: 15, filter: 'drop-shadow(0 0 6px rgba(201,168,76,0.7))' }}>⬡</span>
              <span className="text-sm font-bold tracking-wide" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-gold)' }}>
                {isReplay ? 'Replay — XP already banked' : `+${xpEarned} XP Earned`}
              </span>
            </motion.div>

            {/* Model answer — compare your approach with the house style */}
            {level && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mx-6 mt-2"
              >
                <button
                  onClick={() => setShowSolution((s) => !s)}
                  aria-expanded={showSolution}
                  className="w-full flex items-center gap-1.5 px-3 py-2 text-xs transition-opacity hover:opacity-80"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--lcb-border)',
                    borderRadius: 4,
                    color: 'var(--lcb-muted)',
                    fontFamily: 'var(--font-ibm-plex-mono)',
                  }}
                >
                  {showSolution
                    ? <ChevronDown  className="w-3 h-3" style={{ color: 'var(--lcb-gold)' }} />
                    : <ChevronRight className="w-3 h-3" style={{ color: 'var(--lcb-gold)' }} />}
                  Compare with the model answer
                </button>
                {showSolution && (
                  <pre
                    className="mt-1 px-3 py-2 text-xs leading-5 overflow-x-auto"
                    style={{
                      background: '#0a1117',
                      border: '1px solid var(--lcb-border)',
                      borderRadius: 4,
                      color: 'var(--lcb-white)',
                      fontFamily: 'var(--font-ibm-plex-mono)',
                      maxHeight: 140,
                      overflowY: 'auto',
                      margin: '4px 0 0',
                    }}
                  >
                    {level.solutionQuery}
                  </pre>
                )}
              </motion.div>
            )}

            {/* Next level hint */}
            {currentLevel < MAX_LEVEL && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mx-6 mt-2 px-3 py-2"
                style={{ borderLeft: '2px solid var(--lcb-border)', background: 'rgba(255,255,255,0.02)' }}
              >
                <p className="text-xs" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
                  Next → Level {currentLevel + 1}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--lcb-white)', opacity: 0.7, fontFamily: 'var(--font-ibm-plex-mono)' }}>
                  {EPOCH_NEXT_HINT[nextHintKey]}
                </p>
              </motion.div>
            )}

            {/* Continue button */}
            <motion.button
              autoFocus
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56 }}
              onClick={handleClose}
              className="w-[calc(100%-48px)] mx-6 mt-4 mb-5 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-85"
              style={{
                background: 'var(--lcb-gold)',
                color: 'var(--lcb-black)',
                borderRadius: 4,
                fontFamily: 'var(--font-ibm-plex-mono)',
              }}
            >
              Proceed to Next Level
              <ArrowRight className="w-3 h-3" />
            </motion.button>

            {/* Close */}
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-3 right-3 p-1 transition-opacity hover:opacity-60"
              style={{ color: 'var(--lcb-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
