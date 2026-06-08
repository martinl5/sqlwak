'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore, selectBoidSpecies, selectCurrentEpoch } from '@/store/useGameStore';
import { X, Anchor, ArrowRight } from 'lucide-react';

const EPOCH_TITLE: Record<string, string> = {
  Foundational: 'Graduate Analyst',
  Intermediate: 'Senior Analyst',
  Advanced:     'VP, Data & Analytics',
  Expert:       'Managing Director',
};

const EPOCH_NEXT_HINT: Record<number, string> = {
  10: 'Continue mastering SELECT and WHERE filters',
  20: 'Unlock JOINs and multi-table aggregation',
  30: 'Master GROUP BY, HAVING and subqueries',
  40: 'Command CTEs and window functions',
  50: 'Tackle the Maritime Trade Finance division',
  57: 'Senior DS patterns: A/B test analysis, LAG window functions',
  59: 'LEAD function: next-event lookahead and gap analysis for vessel scheduling',
  61: 'Window-based median: ROW_NUMBER + COUNT OVER PARTITION BY — expert percentile patterns',
};

const epochXpEarned = (lvl: number) => (lvl <= 15 ? 10 : lvl <= 30 ? 15 : lvl <= 40 ? 20 : 30);

export default function LevelUpModal() {
  const { showLevelUp, setShowLevelUp, currentLevel, completeLevel, flockSize } = useGameStore();

  const ship  = selectBoidSpecies(currentLevel);
  const epoch = selectCurrentEpoch(currentLevel);

  useEffect(() => {
    if (!showLevelUp) return;
    const end = Date.now() + 1800;
    const frame = () => {
      confetti({ particleCount: 2, angle: 60,  spread: 55, origin: { x: 0, y: 0.7 }, colors: ['#c9a84c','#e8e6e0','#22c55e'] });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ['#c9a84c','#e8e6e0','#22c55e'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [showLevelUp]);

  const handleClose = () => {
    setShowLevelUp(false);
    completeLevel(currentLevel);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && showLevelUp) handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showLevelUp, currentLevel]);

  const nextHintKey = [10, 20, 30, 40, 50, 57, 59, 61].find((k) => currentLevel < k) ?? 61;
  const xpEarned    = epochXpEarned(currentLevel);

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
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.88, opacity: 0, y: 16  }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="relative w-full max-w-sm overflow-hidden"
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
                {EPOCH_TITLE[epoch]}
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
                +{xpEarned} XP Earned
              </span>
            </motion.div>

            {/* Next level hint */}
            {currentLevel < 61 && (
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
