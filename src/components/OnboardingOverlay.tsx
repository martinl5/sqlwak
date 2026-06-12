'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';

const STEPS = [
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" stroke="var(--lcb-gold)" strokeWidth="1.5" />
        <path d="M20 8 L20 26 M12 18 L20 26 L28 18" stroke="var(--lcb-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="30" r="2" fill="var(--lcb-gold)" />
      </svg>
    ),
    title: 'Welcome to Lion City Bank',
    body: 'You are a data analyst at LCB, Singapore\'s foremost merchant shipping bank. Your SQL skills will navigate the fleet\'s data — from basic queries to senior data science patterns used at FAANG and sovereign institutions.',
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="8" width="32" height="24" rx="3" stroke="var(--lcb-gold)" strokeWidth="1.5" />
        <path d="M10 16 L16 22 L22 14 L30 20" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="8" width="32" height="6" rx="3" fill="rgba(201,168,76,0.12)" />
        <circle cx="9" cy="11" r="1.5" fill="var(--lcb-gold)" />
        <circle cx="14" cy="11" r="1.5" fill="rgba(201,168,76,0.4)" />
      </svg>
    ),
    title: 'Write SQL, Earn XP',
    body: 'Each challenge presents a real-world banking problem. Write your SQL query in the editor, press ⌘↵ or click Run to execute. Correct solutions earn XP and advance you through 4 epochs: Foundational → Intermediate → Advanced → Expert.',
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M6 20 Q20 6 34 20 Q20 34 6 20Z" stroke="var(--lcb-gold)" strokeWidth="1.5" fill="none" />
        <circle cx="20" cy="20" r="4" stroke="var(--lcb-gold)" strokeWidth="1.5" />
        <line x1="20" y1="20" x2="20" y2="10" stroke="var(--lcb-gold)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="20" x2="27" y2="24" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="1.5" fill="var(--lcb-gold)" />
      </svg>
    ),
    title: 'Navigate the Harbour',
    body: 'Use the Schema panel to explore tables. The level map strip shows your voyage across 65 challenges. Stuck? Click the hint button after your first attempt. The harbour master is always watching.',
  },
];

export default function OnboardingOverlay() {
  const { hasSeenOnboarding, setHasSeenOnboarding } = useGameStore();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasSeenOnboarding) {
      // Small delay so the DB loading screen fully fades before overlay appears
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [hasSeenOnboarding]);

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  function dismiss() {
    setVisible(false);
    setHasSeenOnboarding();
  }

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)' }}
            onClick={dismiss}
          />

          {/* Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="relative w-full max-w-sm z-10"
            style={{
              background: 'var(--lcb-surface)',
              border: '1px solid var(--lcb-gold-dim)',
              borderRadius: 8,
              boxShadow: '0 0 48px rgba(201,168,76,0.18), 0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            {/* Gold top bar */}
            <div
              style={{
                height: 3,
                background: 'linear-gradient(90deg, transparent, var(--lcb-gold), transparent)',
                borderRadius: '8px 8px 0 0',
              }}
            />

            {/* Step indicator */}
            <div className="flex gap-1.5 justify-center pt-5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === step ? 18 : 6,
                    height: 3,
                    borderRadius: 2,
                    background: i === step ? 'var(--lcb-gold)' : 'var(--lcb-border)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="flex justify-center mt-5 mb-3">
              <div
                style={{
                  padding: 14,
                  background: 'rgba(201,168,76,0.06)',
                  border: '1px solid var(--lcb-gold-dim)',
                  borderRadius: '50%',
                }}
              >
                {current.icon}
              </div>
            </div>

            {/* Text content */}
            <div className="px-7 pb-2 text-center">
              <h2
                className="text-xl font-bold mb-3"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-gold)' }}
              >
                {current.title}
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: 'var(--lcb-muted)',
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: '0.78rem',
                }}
              >
                {current.body}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 px-7 py-5">
              <button
                onClick={dismiss}
                className="text-xs transition-opacity hover:opacity-70"
                style={{
                  color: 'var(--lcb-muted)',
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Skip
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-85"
                style={{
                  background: 'var(--lcb-gold)',
                  color: 'var(--lcb-black)',
                  borderRadius: 4,
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {step < STEPS.length - 1 ? (
                  <>Next <span style={{ fontSize: 10 }}>▶</span></>
                ) : (
                  <>Set Sail! <span>⚓</span></>
                )}
              </button>
            </div>

            {/* Step count */}
            <p
              className="text-center pb-4 text-xs"
              style={{ color: 'var(--lcb-border)', fontFamily: 'var(--font-ibm-plex-mono)' }}
            >
              {step + 1} / {STEPS.length}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
