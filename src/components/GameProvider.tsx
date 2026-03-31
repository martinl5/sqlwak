'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SQLPanel from './SQLPanel';
import DataPreview from './DataPreview';
import FlockStatus from './FlockStatus';
import LevelUpModal from './LevelUpModal';
import { useGameStore } from '@/store/useGameStore';
import { initDatabase } from '@/lib/db';
import SchemaViewer from './SchemaViewer';

// Dynamic import for FlockCanvas to avoid SSR issues
const FlockCanvas = dynamic(() => import('./FlockCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function GameProvider() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeRightTab, setActiveRightTab] = useState<'schema' | 'data'>('schema');
  const { completeLevel, currentLevel, boids } = useGameStore();

  // Mark as client-side only after hydration
  useEffect(() => {
    setIsClient(true);
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // Initialize database with better error handling
  useEffect(() => {
    console.log('[GameProvider] Starting database initialization...');
    
    initDatabase()
      .then(() => {
        console.log('[GameProvider] Database initialized successfully');
        setIsDbReady(true);
      })
      .catch((error) => {
        console.error('[GameProvider] Database initialization failed:', error);
        setDbError(error instanceof Error ? error.message : 'Failed to initialize database');
      });
  }, []);

  // Handle window resize
  useEffect(() => {
    if (!isClient) return;

    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isClient]);

  const handleSuccess = useCallback(() => {
    // Bird spawning is handled in the SQLPanel
  }, []);

  // Show error state
  if (dbError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Initialization Failed</h2>
          <p className="text-blue-200 mb-4">{dbError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-blue-900 rounded-lg font-medium hover:bg-blue-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Don't render anything until client-side and DB ready
  if (!isClient || !isDbReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-300 via-sky-400 to-blue-600">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-white/30 border-t-white animate-spin" />
          <p className="text-white text-lg font-medium">Initializing SQL Engine...</p>
          <p className="text-white/60 text-sm mt-2">Check browser console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Flock Canvas */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <FlockCanvas width={dimensions.width} height={dimensions.height} />
      )}

      {/* UI Overlay */}
      <div className="relative z-10 h-full flex">
        {/* Left Panel - SQL Editor */}
        <div className="w-[450px] h-full p-4 pr-2">
          <SQLPanel onSuccess={handleSuccess} />
        </div>

        {/* Right Panel */}
        <div className="w-[420px] h-full p-4 pl-2 flex flex-col gap-3">
          {/* Tab Buttons */}
          <div className="flex gap-1 rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(10, 22, 40, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <button
              onClick={() => setActiveRightTab('schema')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeRightTab === 'schema'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              style={activeRightTab === 'schema' ? { backgroundColor: 'rgba(56, 189, 248, 0.2)' } : {}}
            >
              📋 Schema
            </button>
            <button
              onClick={() => setActiveRightTab('data')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeRightTab === 'data'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              style={activeRightTab === 'data' ? { backgroundColor: 'rgba(56, 189, 248, 0.2)' } : {}}
            >
              📊 Data
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0">
            {activeRightTab === 'schema' ? <SchemaViewer /> : <DataPreview />}
          </div>

          {/* Flock Status */}
          <FlockStatus />
        </div>
      </div>

      {/* Level Up Modal */}
      <LevelUpModal />
    </div>
  );
}
