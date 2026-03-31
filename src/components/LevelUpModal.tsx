'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore, selectBoidSpecies, selectCurrentEpoch } from '@/store/useGameStore';
import { X, Feather, Sparkles, ArrowUp } from 'lucide-react';

export default function LevelUpModal() {
  const {
    showLevelUp,
    setShowLevelUp,
    currentLevel,
    completeLevel,
    flockSize,
  } = useGameStore();

  const species = selectBoidSpecies(currentLevel);
  const epoch = selectCurrentEpoch(currentLevel);

  // Trigger confetti on level complete
  useEffect(() => {
    if (showLevelUp) {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#60A5FA', '#34D399', '#F472B6', '#FBBF24', '#A78BFA'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#60A5FA', '#34D399', '#F472B6', '#FBBF24', '#A78BFA'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [showLevelUp]);

  const handleClose = () => {
    setShowLevelUp(false);
    completeLevel(currentLevel);
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLevelUp) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLevelUp, currentLevel]);

  const epochColors: Record<string, string> = {
    Foundational: 'from-sky-400 to-blue-500',
    Intermediate: 'from-cyan-500 to-sky-600',
    Advanced: 'from-indigo-400 to-purple-500',
    Expert: 'from-violet-500 to-purple-700',
  };

  return (
    <AnimatePresence>
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md"
          >
            <div className="p-6 text-center overflow-hidden rounded-2xl" style={{ backgroundColor: 'rgba(13, 31, 53, 0.95)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${epochColors[epoch]} opacity-20`} />
              
              {/* Content */}
              <div className="relative">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                  className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-4"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Level {currentLevel} Complete!
                </motion.h2>

                {/* Species Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${epochColors[epoch]} mb-4`}
                >
                  <Feather className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">{species.species} Joined!</span>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/50 text-xs">Flock Size</p>
                    <p className="text-2xl font-bold text-white">{flockSize}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/50 text-xs">Current Era</p>
                    <p className="text-lg font-bold text-white">{epoch}</p>
                  </div>
                </motion.div>

                {/* Next Level Preview */}
                {currentLevel < 50 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="p-3 rounded-lg bg-white/5 mb-4"
                  >
                    <p className="text-white/50 text-xs mb-1">Next: Level {currentLevel + 1}</p>
                    <p className="text-white text-sm">
                      {currentLevel < 10 && 'Continue mastering SELECT and WHERE'}
                      {currentLevel >= 10 && currentLevel < 20 && 'Learn JOINs and aggregation'}
                      {currentLevel >= 20 && currentLevel < 30 && 'Master GROUP BY and HAVING'}
                      {currentLevel >= 30 && currentLevel < 40 && 'Unlock the power of CTEs'}
                      {currentLevel >= 40 && currentLevel < 50 && 'Ascend with Window Functions'}
                    </p>
                  </motion.div>
                )}

                {/* Continue Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onClick={handleClose}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-cyan-500 transition-all"
                >
                  <span>Continue</span>
                  <ArrowUp className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
