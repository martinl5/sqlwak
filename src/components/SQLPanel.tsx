'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Play, Lightbulb, X, Anchor } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { validateQuery } from '@/lib/validator';
import { levels } from '@/data/levels';
import { epochOf, xpFor, EPOCH_RANK } from '@/lib/progression';

const SQL_SNIPPETS = [
  { label: 'SELECT',   insert: 'SELECT '    },
  { label: 'FROM',     insert: '\nFROM '    },
  { label: 'WHERE',    insert: '\nWHERE '   },
  { label: 'JOIN',     insert: '\nJOIN '    },
  { label: 'GROUP BY', insert: '\nGROUP BY '},
  { label: 'ORDER BY', insert: '\nORDER BY '},
  { label: 'LIMIT',    insert: '\nLIMIT '   },
];

export default function SQLPanel() {
  const [query, setQuery]           = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [doubloonAmt, setDoubloonAmt] = useState<number | null>(null);
  const editorRef                   = useRef<unknown>(null);
  const monacoRef                   = useRef<Monaco | null>(null);
  const dismissTimerRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    editorRef.current  = editor;
    monacoRef.current  = monaco;

    monaco.editor.defineTheme('lcb-terminal', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword',  foreground: 'c9a84c', fontStyle: 'bold' }, // gold
        { token: 'string',   foreground: '4ade80' },                     // green
        { token: 'number',   foreground: 'f87171' },                     // red
        { token: 'comment',  foreground: '4b5563', fontStyle: 'italic' },
        { token: 'operator', foreground: '93c5fd' },                     // blue
      ],
      colors: {
        'editor.background':              '#0a1117',
        'editor.foreground':              '#e8e6e0',
        'editor.lineHighlightBackground': '#111827',
        'editor.selectionBackground':     '#c9a84c30',
        'editorCursor.foreground':        '#c9a84c',
        'editorLineNumber.foreground':    '#374151',
        'editorLineNumber.activeForeground': '#c9a84c',
      },
    });
    monaco.editor.setTheme('lcb-terminal');
    (editor as { focus?: () => void }).focus?.();
  };

  const handleSnippetClick = (insert: string) => {
    const editor = editorRef.current as {
      executeEdits?: (src: string, edits: unknown[]) => void;
      getPosition?: () => { lineNumber: number; column: number };
    } | null;
    if (!editor) return;
    const pos = editor.getPosition?.();
    if (pos) {
      editor.executeEdits?.('snippets', [{
        range: { startLineNumber: pos.lineNumber, startColumn: pos.column, endLineNumber: pos.lineNumber, endColumn: pos.column },
        text: insert,
      }]);
    }
  };

  const handleExecute = useCallback(async () => {
    const activeQuery = query.trim() || (level?.seedQuery ?? '').trim();
    if (!activeQuery) { setError('Please enter a SQL query'); return; }
    setHasAttemptedCurrent(true);
    setIsExecuting(true);
    setError(null);
    setStoreError(null);

    try {
      const result = validateQuery(activeQuery, level?.solutionQuery || '', {
        orderMatters: level?.orderMatters,
      });
      if (result.success) {
        setQueryResult(result.userResult || null);
        setDoubloonAmt(xpFor(currentLevel));
        const editor = editorRef.current as { getPosition?: () => { lineNumber: number; column: number } | null } | null;
        const pos = editor?.getPosition?.();
        if (pos) setLastSpawnedBird({ x: 150 + pos.column * 8, y: 100 + pos.lineNumber * 20 });
        setShowLevelUp(true);
      } else {
        setError(result.message);
        setQueryResult(result.userResult || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
    } finally {
      setIsExecuting(false);
    }
  }, [query, level, currentLevel, setIsExecuting, setQueryResult, setStoreError, setShowLevelUp, setLastSpawnedBird, setHasAttemptedCurrent]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleExecute(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleExecute]);

  // Auto-dismiss error toast after 7s
  useEffect(() => {
    if (error) {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => setError(null), 7000);
    }
    return () => { if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current); };
  }, [error]);

  useEffect(() => {
    setQuery('');
    const editor = editorRef.current as { focus?: () => void } | null;
    if (editor?.focus) setTimeout(() => editor.focus?.(), 50);
  }, [currentLevel]);

  const epoch = epochOf(currentLevel);

  return (
    <div
      className="h-full flex flex-col overflow-hidden fade-in-up"
      style={{ background: 'var(--lcb-panel)', border: '1px solid var(--lcb-border)', borderRadius: 6 }}
    >
      {/* ── Panel header ────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--lcb-border)', background: 'var(--lcb-panel-2)' }}
      >
        <div className="lcb-header">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-muted)' }}
          >
            {EPOCH_RANK[epoch].toUpperCase()} — {epoch}
          </p>
          <h2
            className="text-sm font-semibold mt-0.5"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-white)' }}
          >
            Level {currentLevel}: {level?.title}
          </h2>
        </div>
        <div className="relative">
          {doubloonAmt !== null && (
            <div
              className="doubloon-float"
              style={{ bottom: '110%', right: 0 }}
              onAnimationEnd={() => setDoubloonAmt(null)}
            >
              +{doubloonAmt} ⬡ XP
            </div>
          )}
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-opacity hover:opacity-85 disabled:opacity-40"
            style={{
              background: 'var(--lcb-gold)',
              color: 'var(--lcb-black)',
              borderRadius: 4,
              fontFamily: 'var(--font-ibm-plex-mono)',
            }}
          >
            <Play className="w-3 h-3" />
            {isExecuting ? 'Running…' : 'Run'}
            <span style={{ opacity: 0.6, fontSize: 10 }}>⌘↵</span>
          </button>
        </div>
      </div>

      {/* ── Level description ────────────────────────────────────────────── */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--lcb-border)' }}>
        <p className="text-xs leading-5" style={{ color: 'var(--lcb-white)', opacity: 0.8, fontFamily: 'var(--font-ibm-plex-mono)', whiteSpace: 'pre-wrap' }}>
          {level?.description}
        </p>
        {hasAttemptedCurrent && level?.hint && (
          <div
            className="flex items-start gap-2 mt-2 px-3 py-2"
            style={{ border: '1px solid rgba(201,168,76,0.22)', background: 'rgba(201,168,76,0.05)', borderRadius: 3 }}
          >
            <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--lcb-gold)' }} />
            <p className="text-xs" style={{ color: 'var(--lcb-gold)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
              {level.hint}
            </p>
          </div>
        )}
      </div>

      {/* ── Quick snippets ───────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap gap-1 px-3 py-2"
        style={{ borderBottom: '1px solid var(--lcb-border)', background: 'rgba(255,255,255,0.01)' }}
      >
        {SQL_SNIPPETS.map((s) => (
          <button
            key={s.label}
            onClick={() => handleSnippetClick(s.insert)}
            className="lcb-snippet px-2 py-0.5 text-xs"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Monaco Editor ────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="lcb-terminal"
          value={query || level?.seedQuery || ''}
          onChange={(v) => setQuery(v || '')}
          onMount={handleEditorMount}
          options={{
            minimap:               { enabled: false },
            fontSize:              13,
            lineNumbers:           'on',
            scrollBeyondLastLine:  false,
            automaticLayout:       true,
            tabSize:               2,
            padding:               { top: 12 },
            fontFamily:            '"IBM Plex Mono", "Courier New", monospace',
            fontLigatures:         true,
          }}
        />
      </div>

      {/* ── Harbour Master Report toast ──────────────────────────────────── */}
      {error && (
        <div
          className="harbour-toast mx-3 mb-3"
          style={{
            border: '1px solid rgba(201,168,76,0.38)',
            background: 'rgba(201,168,76,0.07)',
            borderRadius: 4,
            padding: '10px 12px',
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <Anchor className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--lcb-gold)' }} />
              <div className="min-w-0">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: 'var(--lcb-gold)', fontFamily: 'var(--font-ibm-plex-mono)' }}
                >
                  Harbour Master Report
                </p>
                <p
                  className="text-xs leading-5"
                  style={{ color: 'var(--lcb-red)', fontFamily: 'var(--font-ibm-plex-mono)', wordBreak: 'break-word' }}
                >
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 p-0.5 transition-opacity hover:opacity-60"
              style={{ color: 'var(--lcb-muted)' }}
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
