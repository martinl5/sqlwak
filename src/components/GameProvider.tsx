'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SQLPanel from './SQLPanel';
import DataPreview from './DataPreview';
import HarbourStatus from './FlockStatus';
import LevelUpModal from './LevelUpModal';
import LevelNavigator from './LevelNavigator';
import { useGameStore } from '@/store/useGameStore';
import { initDatabase } from '@/lib/db';
import SchemaViewer from './SchemaViewer';

const HarbourCanvas = dynamic(() => import('./FlockCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function GameProvider() {
  const [isDbReady, setIsDbReady]               = useState(false);
  const [dbError, setDbError]                   = useState<string | null>(null);
  const [isClient, setIsClient]                 = useState(false);
  const [dimensions, setDimensions]             = useState({ width: 0, height: 0 });
  const [activeRightTab, setActiveRightTab]     = useState<'schema' | 'data'>('schema');
  const [showLevelNavigator, setShowLevelNavigator] = useState(false);
  const { currentLevel } = useGameStore();

  useEffect(() => {
    setIsClient(true);
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    initDatabase()
      .then(() => setIsDbReady(true))
      .catch((err) => setDbError(err instanceof Error ? err.message : 'Failed to initialise database'));
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const onResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isClient]);

  const handleSuccess = useCallback(() => {}, []);

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
  if (!isClient || !isDbReady) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6" style={{ background: 'var(--lcb-black)' }}>
        {/* LCB lion crest placeholder */}
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="animate-gold-pulse">
          <circle cx="24" cy="24" r="22" stroke="var(--lcb-gold)" strokeWidth="1.5" />
          <text x="24" y="30" textAnchor="middle" fontSize="22" fill="var(--lcb-gold)" fontFamily="serif">🦁</text>
        </svg>
        <div className="text-center">
          <p className="text-base font-medium tracking-widest uppercase" style={{ color: 'var(--lcb-gold)', fontFamily: 'var(--font-playfair)' }}>
            Lion City Bank
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--lcb-muted)' }}>
            Initialising SQL Analytics Engine…
          </p>
        </div>
        <div className="w-40 h-px overflow-hidden" style={{ background: 'var(--lcb-border)' }}>
          <div
            className="h-full"
            style={{
              background: 'var(--lcb-gold)',
              animation: 'shimmerBar 1.4s ease-in-out infinite',
              width: '40%',
            }}
          />
        </div>
        <style>{`
          @keyframes shimmerBar {
            0%   { margin-left: -40%; }
            100% { margin-left: 100%; }
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
          <span className="text-xs" style={{ color: 'var(--lcb-border)' }}>|</span>
          <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--lcb-muted)' }}>
            SQL Analytics Terminal
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
          <span>LEVEL <span style={{ color: 'var(--lcb-gold)' }}>{currentLevel}</span> / 55</span>
          <span className="w-1 h-1 rounded-full inline-block" style={{ background: 'var(--lcb-green)' }} />
          <span style={{ color: 'var(--lcb-green)' }}>LIVE</span>
        </div>
      </div>

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Background harbour canvas */}
        {dimensions.width > 0 && dimensions.height > 0 && (
          <HarbourCanvas width={dimensions.width} height={dimensions.height} />
        )}

        {/* UI overlay */}
        <div className="relative z-10 h-full flex">
          {/* Left: SQL Editor */}
          <div className="w-[460px] h-full p-3 pr-2">
            <SQLPanel onSuccess={handleSuccess} />
          </div>

          {/* Right: Schema / Data + status */}
          <div className="w-[420px] h-full p-3 pl-2 flex flex-col gap-2">
            {/* Tab bar */}
            <div
              className="flex"
              style={{ background: 'var(--lcb-panel)', border: '1px solid var(--lcb-border)', borderRadius: 6 }}
            >
              {(['schema', 'data'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRightTab(tab)}
                  className="flex-1 py-2 text-xs tracking-widest uppercase transition-colors"
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    color: activeRightTab === tab ? 'var(--lcb-gold)' : 'var(--lcb-muted)',
                    borderBottom: activeRightTab === tab ? '2px solid var(--lcb-gold)' : '2px solid transparent',
                    background: 'transparent',
                  }}
                >
                  {tab === 'schema' ? 'Schema' : 'Data'}
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
    </div>
  );
}
