'use client';

import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Play, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { validateQuery } from '@/lib/validator';
import { levels } from '@/data/levels';

interface SQLPanelProps {
  onSuccess: () => void;
}

// Quick snippet buttons
const SQL_SNIPPETS = [
  { label: 'SELECT', insert: 'SELECT ' },
  { label: 'FROM', insert: '\nFROM ' },
  { label: 'WHERE', insert: '\nWHERE ' },
  { label: 'ORDER BY', insert: '\nORDER BY ' },
  { label: 'LIMIT', insert: '\nLIMIT ' },
];

export default function SQLPanel({ onSuccess }: SQLPanelProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<unknown>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const { 
    currentLevel, 
    isExecuting, 
    hasAttemptedCurrent,
    setIsExecuting, 
    setQueryResult, 
    setError: setStoreError,
    setShowLevelUp,
    setLastSpawnedBird,
    setHasAttemptedCurrent,
  } = useGameStore();

  const level = levels.find((l) => l.id === currentLevel);

  const handleEditorMount = (editor: unknown, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Define custom blue theme
    monaco.editor.defineTheme('sqlawk-blue', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '60A5FA', fontStyle: 'bold' }, // blue-400
        { token: 'string', foreground: '34D399' }, // emerald-400
        { token: 'number', foreground: 'F472B6' }, // pink-400
        { token: 'comment', foreground: '64748B', fontStyle: 'italic' }, // slate-500
        { token: 'operator', foreground: 'FCD34D' }, // amber-400
      ],
      colors: {
        'editor.background': '#1E3A5F',
        'editor.foreground': '#E2E8F0',
        'editor.lineHighlightBackground': '#2D4A6F',
        'editor.selectionBackground': '#3B82F680',
        'editorCursor.foreground': '#22D3EE',
        'editorLineNumber.foreground': '#64748B',
        'editorLineNumber.activeForeground': '#94A3B8',
      },
    });
    monaco.editor.setTheme('sqlawk-blue');
    
    // Focus editor
    (editor as { focus?: () => void }).focus?.();
  };

  const handleSnippetClick = (insert: string) => {
    const editor = editorRef.current as { executeEdits?: (source: string, edits: any[]) => void; getPosition?: () => { lineNumber: number; column: number } } | null;
    if (!editor) return;
    
    const position = editor.getPosition?.();
    if (position) {
      editor.executeEdits?.('snippets', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: insert,
      }]);
    }
  };

  const handleExecute = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    // Mark that user has attempted this level
    setHasAttemptedCurrent(true);
    
    setIsExecuting(true);
    setError(null);
    setStoreError(null);

    try {
      const result = validateQuery(query, level?.solutionQuery || '');

      if (result.success) {
        setQueryResult(result.userResult || null);
        
        // Get editor position for bird spawn animation
        try {
          const editor = editorRef.current as { getPosition?: () => { lineNumber: number; column: number } | null } | null;
          if (editor && typeof editor.getPosition === 'function') {
            const pos = editor.getPosition();
            if (pos && typeof pos.lineNumber === 'number' && typeof pos.column === 'number') {
              // Convert to approximate screen coordinates
              const spawnX = 150 + pos.column * 8;
              const spawnY = 100 + pos.lineNumber * 20;
              setLastSpawnedBird({ x: spawnX, y: spawnY });
            }
          }
        } catch (e) {
          // Ignore position errors
        }

        setShowLevelUp(true);
        onSuccess();
      } else {
        setError(result.message);
        setQueryResult(result.userResult || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
    } finally {
      setIsExecuting(false);
    }
  }, [query, level, setIsExecuting, setQueryResult, setStoreError, setShowLevelUp, setLastSpawnedBird, onSuccess, setHasAttemptedCurrent]);

  // Keyboard shortcut: Ctrl/Cmd+Enter to execute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown as any);
    return () => window.removeEventListener('keydown', handleKeyDown as any);
  }, [handleExecute]);

  // Auto-focus editor when level changes
  useEffect(() => {
    const editor = editorRef.current as { focus?: () => void } | null;
    const focusFn = editor?.focus;
    if (focusFn) {
      // Small delay to ensure editor is ready
      setTimeout(() => focusFn(), 50);
    }
  }, [currentLevel]);

  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(13, 31, 53, 0.95)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10" style={{ backgroundColor: 'rgba(10, 22, 40, 0.8)' }}>
        <div>
          <h2 className="text-lg font-semibold text-white">SQL Editor</h2>
          <p className="text-sm text-white/60">
            Level {currentLevel}: {level?.title}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 font-medium"
          >
            <Play className="w-4 h-4" />
            <span>{isExecuting ? 'Running...' : 'Run'}</span>
            <span className="text-xs opacity-60 ml-1">Ctrl+↵</span>
          </button>
        </div>
      </div>

      {/* Level Description */}
      <div className="p-4 border-b border-white/10">
        <p className="text-white/80 text-sm">{level?.description}</p>
        {hasAttemptedCurrent && (
          <p className="text-amber-300/80 text-xs mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Hint: {level?.hint}
          </p>
        )}
      </div>

      {/* Quick Snippets */}
      <div className="flex gap-1 px-4 py-2 border-b border-white/5 bg-white/5">
        {SQL_SNIPPETS.map((snippet) => (
          <button
            key={snippet.label}
            onClick={() => handleSnippetClick(snippet.insert)}
            className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors font-mono"
          >
            {snippet.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="sqlawk-blue"
          value={query || level?.seedQuery || ''}
          onChange={(value) => setQuery(value || '')}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 16 },
          }}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border-t border-red-500/30">
          <p className="text-red-300 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
