'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  rankName: string | null;
  onDismiss: () => void;
}

const RANK_FLAVOUR: Record<string, { title: string; body: string; icon: string }> = {
  'Senior Analyst': {
    title: 'PROMOTED TO SENIOR ANALYST',
    body: "Your command of JOIN and GROUP BY has earned your first promotion. The fleet's intermediate ledgers are yours to navigate.",
    icon: '⚓',
  },
  'VP, Data & Analytics': {
    title: 'PROMOTED TO VP, DATA & ANALYTICS',
    body: "Advanced window functions, CTEs, and trade-finance analytics — LCB entrusts the fleet's risk dashboards to your helm.",
    icon: '🧭',
  },
  'Managing Director': {
    title: 'PROMOTED TO MANAGING DIRECTOR',
    body: 'You have mastered the full SQL arsenal: cohort analysis, sessionization, A/B experimentation, and loan-book risk. The entire LCB analytics fleet is yours to command.',
    icon: '🏅',
  },
};

const DURATION_MS = 6000;

export default function RankPromotionBanner({ rankName, onDismiss }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flavour = rankName ? RANK_FLAVOUR[rankName] : null;

  useEffect(() => {
    if (!rankName) return;
    timerRef.current = setTimeout(onDismiss, DURATION_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [rankName, onDismiss]);

  return (
    <AnimatePresence>
      {rankName && flavour && (
        <motion.div
          key={rankName}
          initial={{ y: -80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0,   opacity: 1, scale: 1    }}
          exit={{    y: -80, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          onClick={onDismiss}
          style={{
            position: 'fixed',
            top: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 55,
            cursor: 'pointer',
            minWidth: 320,
            maxWidth: 480,
          }}
          aria-live="assertive"
          role="status"
        >
          <div
            style={{
              background: 'var(--lcb-panel-2)',
              border: '1.5px solid var(--lcb-gold)',
              borderRadius: 6,
              boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Gold top stripe */}
            <div style={{ height: 3, background: 'var(--lcb-gold)', width: '100%' }} />

            <div className="flex items-start gap-4 px-5 py-4">
              {/* Icon with compass spin animation */}
              <motion.span
                initial={{ rotate: 0 }}
                animate={{ rotate: 720 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}
                aria-hidden="true"
              >
                {flavour.icon}
              </motion.span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--lcb-gold)',
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    marginBottom: 4,
                  }}
                >
                  Lion City Bank — Career Advancement
                </p>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: 'var(--lcb-gold)',
                    fontFamily: 'var(--font-playfair)',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    lineHeight: 1.3,
                  }}
                >
                  {flavour.title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: 'var(--lcb-muted)',
                    fontFamily: 'var(--font-ibm-plex-mono)',
                  }}
                >
                  {flavour.body}
                </p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                aria-label="Dismiss promotion notification"
                style={{
                  flexShrink: 0,
                  color: 'var(--lcb-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: '0 2px',
                  opacity: 0.6,
                }}
              >
                ×
              </button>
            </div>

            {/* Auto-dismiss countdown bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: DURATION_MS / 1000, ease: 'linear' }}
              style={{
                height: 2,
                background: 'var(--lcb-gold)',
                opacity: 0.45,
                marginTop: -1,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
