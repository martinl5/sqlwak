'use client';

import { useEffect, useState, useRef, useCallback, Fragment } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import SQLPanel from './SQLPanel';
import DataPreview from './DataPreview';
import HarbourStatus from './FlockStatus';
import LevelUpModal from './LevelUpModal';
import LevelNavigator from './LevelNavigator';
import { useGameStore } from '@/store/useGameStore';
import { initDatabase } from '@/lib/db';
import { EPOCH_RANGES, MAX_LEVEL, rankInfo } from '@/lib/progression';
import SchemaViewer from './SchemaViewer';
import LevelProgressMap from './LevelProgressMap';
import OnboardingOverlay from './OnboardingOverlay';

const HarbourCanvas = dynamic(() => import('./FlockCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function GameProvider() {
  const [isDbReady, setIsDbReady]               = useState(false);
  const [dbError, setDbError]                   = useState<string | null>(null);
  const [dimensions, setDimensions]             = useState({ width: 0, height: 0 });
  const [activeRightTab, setActiveRightTab]     = useState<'schema' | 'data'>('schema');
  const [showLevelNavigator, setShowLevelNavigator] = useState(false);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const { currentLevel, totalXp, currentStreak, rehydrateFleet } = useGameStore();

  // Career-rank ladder derived from the level data (see progression.ts),
  // so every rank up to Managing Director is actually reachable.
  const rank = rankInfo(totalXp);

  useEffect(() => {
    initDatabase()
      .then(() => setIsDbReady(true))
      .catch((err) => setDbError(err instanceof Error ? err.message : 'Failed to initialise database'));
  }, []);

  // Restore docked ships from saved progress once the harbour has a size.
  useEffect(() => {
    if (isDbReady && dimensions.width > 0) rehydrateFleet(dimensions.width);
  }, [isDbReady, dimensions.width, rehydrateFleet]);

  // Whenever a query runs, surface its output: switch the right panel to the
  // Results tab and, on stacked (mobile) layouts, bring it into view.
  const handleQueryRun = useCallback(() => {
    setActiveRightTab('data');
    if (window.innerWidth < 1024) {
      rightPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const onResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Error state ────────────────────────────────────────────────────────────
  if (dbError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--lcb-black)' }}>
        <div className="text-center max-w-md p-8 lcb-panel fade-in-up">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center text-2xl">⚠</div>
          <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-gold)' }}>
            Engine Initialisation Failed
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--lcb-muted)' }}>{dbError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--lcb-gold)', color: 'var(--lcb-black)', borderRadius: 4 }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!isDbReady) {
    const SPOKE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6" style={{ background: 'var(--lcb-black)' }}>
        {/* Ship-wheel spinner */}
        <svg
          width="60"
          height="60"
          viewBox="0 0 56 56"
          fill="none"
          style={{ animation: 'spinWheel 3s linear infinite', flexShrink: 0 }}
          aria-hidden="true"
        >
          {/* Outer rim */}
          <circle cx="28" cy="28" r="24" stroke="var(--lcb-gold)" strokeWidth="2" opacity="0.55" />
          {/* 8 spokes hub→rim */}
          {SPOKE_ANGLES.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={28 + 6 * Math.sin(rad)}
                y1={28 - 6 * Math.cos(rad)}
                x2={28 + 21 * Math.sin(rad)}
                y2={28 - 21 * Math.cos(rad)}
                stroke="var(--lcb-gold)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}
          {/* Handle knobs at spoke tips */}
          {SPOKE_ANGLES.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={`k${deg}`}
                cx={28 + 24 * Math.sin(rad)}
                cy={28 - 24 * Math.cos(rad)}
                r="2.8"
                fill="var(--lcb-gold)"
              />
            );
          })}
          {/* Hub */}
          <circle cx="28" cy="28" r="5.5" stroke="var(--lcb-gold)" strokeWidth="1.5" fill="rgba(201,168,76,0.15)" />
          <circle cx="28" cy="28" r="2" fill="var(--lcb-gold)" />
        </svg>

        <div className="text-center">
          <p className="text-base font-medium tracking-widest uppercase" style={{ color: 'var(--lcb-gold)', fontFamily: 'var(--font-playfair)' }}>
            Lion City Bank
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--lcb-muted)' }}>
            Initialising SQL Analytics Engine…
          </p>
        </div>
        <style>{`
          @keyframes spinWheel {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col">
      {/* ── LCB Brand Header ──────────────────────────────────────────────── */}
      <div style={{ background: 'var(--lcb-gold)', height: 3, flexShrink: 0 }} />
      <div
        className="flex items-center justify-between px-5 py-2"
        style={{ background: 'var(--lcb-panel-2)', borderBottom: '1px solid var(--lcb-border)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 18 }}>🦁</span>
          <span
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-gold)' }}
          >
            Lion City Bank
          </span>
          <span className="hidden sm:inline text-xs" style={{ color: 'var(--lcb-border)' }}>|</span>
          <span className="hidden sm:inline text-xs tracking-widest uppercase" style={{ color: 'var(--lcb-muted)' }}>
            SQL Analytics Terminal
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
          <span>LEVEL <span style={{ color: 'var(--lcb-gold)' }}>{currentLevel}</span> / {MAX_LEVEL}</span>

          {/* Rank + XP progress bar */}
          <div className="hidden md:flex items-center gap-1.5" title={rank.xpToNext > 0 ? `${rank.xpToNext} XP to ${rank.nextName}` : 'Top rank reached'}>
            <span style={{ color: 'var(--lcb-muted)' }}>{rank.name}</span>
            <span style={{ color: 'var(--lcb-gold)' }}>{totalXp}</span>
            <div className="w-16 h-1 overflow-hidden" style={{ background: 'var(--lcb-border)', borderRadius: 2 }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.round(rank.progress * 100)}%`,
                  background: 'var(--lcb-gold)',
                  borderRadius: 2,
                }}
              />
            </div>
            {rank.nextName && (
              <span className="hidden lg:inline" style={{ color: 'var(--lcb-muted)', opacity: 0.7 }}>→ {rank.nextName}</span>
            )}
          </div>

          {/* Streak */}
          {currentStreak > 0 && (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5"
              style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 3 }}
            >
              <span style={{ fontSize: 10 }}>🔥</span>
              <span style={{ color: '#f97316', fontWeight: 600 }}>{currentStreak}</span>
            </div>
          )}

          <span className="w-1 h-1 rounded-full inline-block" style={{ background: 'var(--lcb-green)' }} />
          <span style={{ color: 'var(--lcb-green)' }}>LIVE</span>
          <Link
            href="/about"
            className="uppercase tracking-widest hover:underline"
            style={{ color: 'var(--lcb-muted)' }}
          >
            About
          </Link>
        </div>
      </div>

      {/* ── Epoch Breadcrumb Strip ───────────────────────────────────────── */}
      {(() => {
        const epochs = EPOCH_RANGES;
        return (
          <div
            className="flex items-center px-5 gap-1.5 text-xs"
            style={{
              background: 'var(--lcb-panel-2)',
              borderBottom: '1px solid var(--lcb-border)',
              flexShrink: 0,
              fontFamily: 'var(--font-ibm-plex-mono)',
              height: 26,
            }}
          >
            {epochs.map((ep, i) => {
              const isCurrent = currentLevel >= ep.min && currentLevel <= ep.max;
              const isDone    = currentLevel > ep.max;
              return (
                <Fragment key={ep.name}>
                  {i > 0 && (
                    <span style={{ color: 'var(--lcb-border)', fontSize: 10 }}>›</span>
                  )}
                  <span
                    style={{
                      color: isCurrent ? 'var(--lcb-gold)' : isDone ? 'var(--lcb-green)' : 'var(--lcb-muted)',
                      opacity: isCurrent ? 1 : isDone ? 0.75 : 0.4,
                      fontWeight: isCurrent ? 600 : 400,
                      letterSpacing: '0.05em',
                      fontSize: 10,
                      textTransform: 'uppercase',
                    }}
                  >
                    {isDone ? '✓ ' : isCurrent ? '▶ ' : ''}{ep.name}
                  </span>
                </Fragment>
              );
            })}
          </div>
        );
      })()}

      {/* ── Level Progress Map ───────────────────────────────────────────── */}
      <LevelProgressMap />

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Background harbour canvas */}
        {dimensions.width > 0 && dimensions.height > 0 && (
          <HarbourCanvas width={dimensions.width} height={dimensions.height} />
        )}

        {/* UI overlay */}
        <div className="relative z-10 h-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* Left: SQL Editor */}
          <div className="w-full lg:w-[460px] h-[75dvh] lg:h-full flex-shrink-0 p-3 lg:pr-2">
            <SQLPanel onQueryRun={handleQueryRun} />
          </div>

          {/* Right: Schema / Results + status */}
          <div ref={rightPanelRef} className="w-full lg:w-[420px] h-[75dvh] lg:h-full flex-shrink-0 p-3 lg:pl-2 flex flex-col gap-2">
            {/* Tab bar */}
            <div
              className="flex"
              style={{ background: 'var(--lcb-panel)', border: '1px solid var(--lcb-border)', borderRadius: 6 }}
            >
              {(['schema', 'data'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRightTab(tab)}
                  aria-pressed={activeRightTab === tab}
                  className="flex-1 py-2 text-xs tracking-widest uppercase transition-colors"
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    color: activeRightTab === tab ? 'var(--lcb-gold)' : 'var(--lcb-muted)',
                    borderBottom: activeRightTab === tab ? '2px solid var(--lcb-gold)' : '2px solid transparent',
                    background: 'transparent',
                  }}
                >
                  {tab === 'schema' ? 'Schema' : 'Results'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0">
              {activeRightTab === 'schema' ? <SchemaViewer /> : <DataPreview />}
            </div>

            {/* Harbour status bar */}
            <HarbourStatus onOpenLevelNavigator={() => setShowLevelNavigator(true)} />
          </div>
        </div>
      </div>

      <LevelNavigator isOpen={showLevelNavigator} onClose={() => setShowLevelNavigator(false)} />
      <LevelUpModal />
      <OnboardingOverlay />
    </div>
  );
}
