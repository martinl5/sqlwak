'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Editor, { Monaco, loader } from '@monaco-editor/react';
import { Play, Lightbulb, X, Anchor, Check, HelpCircle, Compass } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { executeQuery } from '@/lib/db';
import { validateQuery, getExpectedShape } from '@/lib/validator';
import { levels } from '@/data/levels';
import { epochOf, xpFor, EPOCH_RANK } from '@/lib/progression';

// Serve Monaco from /public (synced from node_modules by
// scripts/sync-sql-assets.mjs) instead of the default jsdelivr CDN — the
// editor is the product, so it must not depend on a third party being up.
loader.config({ paths: { vs: '/vendor/monaco/vs' } });

// LCB schema for SQL auto-complete — registered once per page load.
let lcbCompletionsRegistered = false;
const LCB_SCHEMA: Record<string, string[]> = {
  customers:                ['customer_id', 'customer_name', 'segment', 'credit_score', 'join_date', 'email', 'ab_test_group'],
  accounts:                 ['account_id', 'customer_id', 'product_id', 'branch_id', 'balance', 'opened_date', 'status'],
  transactions:             ['transaction_id', 'account_id', 'amount', 'transaction_type', 'transaction_date', 'merchant_category', 'channel'],
  loans:                    ['loan_id', 'customer_id', 'product_id', 'principal_amount', 'interest_rate', 'term_months', 'start_date', 'status', 'risk_grade'],
  products:                 ['product_id', 'product_name', 'product_type', 'interest_rate', 'min_balance'],
  branches:                 ['branch_id', 'branch_name', 'city', 'region', 'branch_type'],
  vessels:                  ['vessel_id', 'vessel_name', 'vessel_type', 'flag_state', 'dwt_tonnes', 'year_built', 'owner_customer_id'],
  cargo_shipments:          ['shipment_id', 'vessel_id', 'origin_port', 'destination_port', 'cargo_type', 'cargo_value_usd', 'departure_date', 'arrival_date', 'status'],
  trade_finance_facilities: ['facility_id', 'customer_id', 'vessel_id', 'facility_type', 'facility_amount', 'utilised_amount', 'expiry_date', 'status'],
  portal_logins:            ['login_id', 'customer_id', 'login_at'],
};

const SQL_SNIPPETS = [
  { label: 'SELECT',   insert: 'SELECT '    },
  { label: 'FROM',     insert: '\nFROM '    },
  { label: 'WHERE',    insert: '\nWHERE '   },
  { label: 'JOIN',     insert: '\nJOIN '    },
  { label: 'GROUP BY', insert: '\nGROUP BY '},
  { label: 'ORDER BY', insert: '\nORDER BY '},
  { label: 'LIMIT',    insert: '\nLIMIT '   },
];

interface SQLPanelProps {
  /** Called whenever a query produced output (or an error) worth looking at. */
  onQueryRun?: () => void;
}

/** Split a hint string into up to 3 progressive reveal chunks. */
function splitHint(hint: string): string[] {
  const raw = hint.split('. ');
  const parts = raw.map((p, i) => (i < raw.length - 1 ? p + '.' : p));
  if (parts.length <= 3) return parts;
  const n = parts.length;
  return [
    parts.slice(0, Math.ceil(n / 3)).join(' '),
    parts.slice(Math.ceil(n / 3), Math.ceil((2 * n) / 3)).join(' '),
    parts.slice(Math.ceil((2 * n) / 3)).join(' '),
  ];
}

export default function SQLPanel({ onQueryRun }: SQLPanelProps) {
  const [query, setQuery]           = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [doubloonAmt, setDoubloonAmt] = useState<number | null>(null);
  const [hintChunkIdx, setHintChunkIdx] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const editorRef                   = useRef<unknown>(null);
  const monacoRef                   = useRef<Monaco | null>(null);
  const dismissTimerRef             = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Monaco swallows ⌘↵/Ctrl↵ before they reach the window listener, so the
  // editor needs its own keybindings; routed through a ref to stay current.
  const handlersRef                 = useRef({ run: () => {}, submit: () => {} });

  const {
    currentLevel,
    completedLevels,
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

  // ⌘ on Mac, Ctrl everywhere else — shown on the buttons.
  const [modKey, setModKey] = useState('⌘');
  useEffect(() => {
    if (!/Mac|iP(hone|ad|od)/.test(navigator.platform)) setModKey('Ctrl');
  }, []);

  // ? key toggles the shortcuts panel (ignored when editor textarea has focus).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setShowShortcuts((s) => !s);
      } else if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Touch devices get a 16px editor font (anything smaller makes iOS zoom the
  // whole page when the editor focuses) and word wrap for narrow screens.
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsTouch(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

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

    const ed = editor as {
      focus?: () => void;
      addCommand?: (keybinding: number, handler: () => void) => void;
    };
    ed.addCommand?.(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => handlersRef.current.run());
    ed.addCommand?.(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => handlersRef.current.submit()
    );

    // Register schema-aware SQL completions once per page load.
    if (!lcbCompletionsRegistered) {
      lcbCompletionsRegistered = true;
      monaco.languages.registerCompletionItemProvider('sql', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provideCompletionItems(model: any, position: any) {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber:   position.lineNumber,
            startColumn:     word.startColumn,
            endColumn:       word.endColumn,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const suggestions: any[] = [
            ...Object.keys(LCB_SCHEMA).map(tbl => ({
              label:      tbl,
              kind:       monaco.languages.CompletionItemKind.Class,
              insertText: tbl,
              range,
              detail:     'LCB table',
            })),
            ...Object.entries(LCB_SCHEMA).flatMap(([tbl, cols]) =>
              cols.map(col => ({
                label:      col,
                kind:       monaco.languages.CompletionItemKind.Field,
                insertText: col,
                range,
                detail:     tbl,
              }))
            ),
          ];
          return { suggestions };
        },
      });
    }

    ed.focus?.();
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

  // The editor model is the source of truth: React's onChange state can lag
  // a fast type-then-⌘↵ by a beat, which would silently run stale SQL.
  const getEditorText = useCallback(() => {
    const ed = editorRef.current as { getValue?: () => string } | null;
    return ed?.getValue?.() ?? query;
  }, [query]);

  // Run: execute the query and show its results — no grading, no penalty.
  // Exploring the data is how analysts actually work, so it's free.
  const handleRun = useCallback(() => {
    const activeQuery = getEditorText().trim();
    if (!activeQuery) {
      setError('Type a query first — try SELECT * FROM customers LIMIT 5');
      return;
    }
    setIsExecuting(true);
    setError(null);
    setStoreError(null);
    try {
      const result = executeQuery(activeQuery);
      setQueryResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Query execution failed';
      setError(message);
      setStoreError(message);
      setQueryResult(null);
    } finally {
      setIsExecuting(false);
      onQueryRun?.();
    }
  }, [getEditorText, setIsExecuting, setQueryResult, setStoreError, onQueryRun]);

  // Submit: grade the query against the level's expected report.
  const handleSubmit = useCallback(() => {
    const activeQuery = getEditorText().trim();
    if (!activeQuery) {
      setError('Write your query before submitting — the Harbour Master expects a report.');
      return;
    }
    setHasAttemptedCurrent(true);
    setIsExecuting(true);
    setError(null);
    setStoreError(null);

    try {
      const result = validateQuery(activeQuery, level?.solutionQuery || '', {
        orderMatters: level?.orderMatters,
      });
      setQueryResult(result.userResult || null);
      if (result.success) {
        if (!completedLevels.includes(currentLevel)) setDoubloonAmt(xpFor(currentLevel));
        const editor = editorRef.current as { getPosition?: () => { lineNumber: number; column: number } | null } | null;
        const pos = editor?.getPosition?.();
        if (pos) setLastSpawnedBird({ x: 150 + pos.column * 8, y: 100 + pos.lineNumber * 20 });
        setShowLevelUp(true);
      } else {
        setError(result.message);
        setFailedAttempts((n) => n + 1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Query execution failed';
      setError(message);
      setStoreError(message);
      setFailedAttempts((n) => n + 1);
    } finally {
      setIsExecuting(false);
      onQueryRun?.();
    }
  }, [getEditorText, level, currentLevel, completedLevels, setIsExecuting, setQueryResult, setStoreError, setShowLevelUp, setLastSpawnedBird, setHasAttemptedCurrent, onQueryRun]);

  useEffect(() => {
    handlersRef.current = { run: handleRun, submit: handleSubmit };
  }, [handleRun, handleSubmit]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) handleSubmit(); else handleRun();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleRun, handleSubmit]);

  // Auto-dismiss error toast after 7s
  useEffect(() => {
    if (error) {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => setError(null), 7000);
    }
    return () => { if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current); };
  }, [error]);

  useEffect(() => {
    setQuery(levels.find((l) => l.id === currentLevel)?.seedQuery ?? '');
    setError(null);
    setFailedAttempts(0);
    setHintChunkIdx(0);
    const editor = editorRef.current as { focus?: () => void } | null;
    if (editor?.focus) setTimeout(() => editor.focus?.(), 50);
  }, [currentLevel]);

  const epoch = epochOf(currentLevel);
  // Escalating disclosure: after three failed attempts, reveal the expected
  // result's shape (columns + row count) without revealing its values.
  const expectedShape =
    failedAttempts >= 3 && level ? getExpectedShape(level.solutionQuery) : null;

  const hintChunks = level?.hint ? splitHint(level.hint) : [];

  return (
    <div
      className="h-full flex flex-col overflow-hidden fade-in-up"
      style={{ background: 'var(--lcb-panel)', border: '1px solid var(--lcb-border)', borderRadius: 6 }}
    >
      {/* ── Panel header ────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--lcb-border)', background: 'var(--lcb-panel-2)' }}
      >
        <div className="lcb-header min-w-0">
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
        <div className="relative flex items-center gap-1.5 flex-shrink-0">
          {doubloonAmt !== null && (
            <div
              className="doubloon-float"
              style={{ bottom: '110%', right: 0 }}
              onAnimationEnd={() => setDoubloonAmt(null)}
            >
              +{doubloonAmt} ⬡ XP
            </div>
          )}

          {/* ── Keyboard Shortcuts Help ───────────────────────────── */}
          <div className="relative">
            <button
              onClick={() => setShowShortcuts((s) => !s)}
              title="Keyboard shortcuts (?)"
              aria-label="Toggle keyboard shortcuts"
              className="lcb-icon-btn flex items-center justify-center w-6 h-6 transition-opacity hover:opacity-80"
              style={{
                color: showShortcuts ? 'var(--lcb-gold)' : 'var(--lcb-muted)',
                border: `1px solid ${showShortcuts ? 'rgba(201,168,76,0.5)' : 'transparent'}`,
                borderRadius: 4,
              }}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {showShortcuts && (
              <div
                className="absolute z-50"
                style={{
                  bottom: 'calc(100% + 10px)',
                  right: 0,
                  width: 280,
                  background: 'var(--lcb-black)',
                  border: '1px solid rgba(201,168,76,0.35)',
                  borderRadius: 6,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  padding: '12px 14px',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--lcb-gold)' }} />
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--lcb-gold)', fontFamily: 'var(--font-ibm-plex-mono)' }}
                  >
                    Navigator&apos;s Chart
                  </span>
                  <button
                    onClick={() => setShowShortcuts(false)}
                    className="ml-auto lcb-icon-btn p-0.5 transition-opacity hover:opacity-60"
                    style={{ color: 'var(--lcb-muted)' }}
                    aria-label="Close shortcuts"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {([
                    { keys: [`${modKey}↵`],   label: 'Run query (free exploration)' },
                    { keys: [`⇧${modKey}↵`],  label: 'Submit for grading' },
                    { keys: ['?'],             label: 'Toggle this panel' },
                    { keys: ['Esc'],           label: 'Close overlays' },
                  ] as { keys: string[]; label: string }[]).map(({ keys, label }) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span
                        className="text-xs"
                        style={{ color: 'var(--lcb-white)', opacity: 0.75, fontFamily: 'var(--font-ibm-plex-mono)' }}
                      >
                        {label}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {keys.map((k) => (
                          <kbd
                            key={k}
                            className="px-1.5 py-0.5 text-xs rounded"
                            style={{
                              fontFamily: 'var(--font-ibm-plex-mono)',
                              fontSize: 10,
                              color: 'var(--lcb-gold)',
                              background: 'rgba(201,168,76,0.12)',
                              border: '1px solid rgba(201,168,76,0.3)',
                              lineHeight: 1.4,
                            }}
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-3 pt-2.5"
                  style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)', lineHeight: 1.5 }}>
                    <Anchor className="w-3 h-3 inline mr-1" style={{ color: 'var(--lcb-gold)', opacity: 0.6, verticalAlign: 'middle' }} />
                    Run freely to explore — only Submit counts toward grading.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRun}
            disabled={isExecuting}
            title="Execute your query and inspect the results — exploration is free"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wider uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              background: 'transparent',
              color: 'var(--lcb-gold)',
              border: '1px solid var(--lcb-gold-dim)',
              borderRadius: 4,
              fontFamily: 'var(--font-ibm-plex-mono)',
            }}
          >
            <Play className="w-3 h-3" />
            Run
            <span className="lcb-kbd-hint" style={{ opacity: 0.6, fontSize: 10 }}>{modKey}↵</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isExecuting}
            title="Submit your answer to the Harbour Master for grading"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wider uppercase transition-opacity hover:opacity-85 disabled:opacity-40"
            style={{
              background: 'var(--lcb-gold)',
              color: 'var(--lcb-black)',
              borderRadius: 4,
              fontFamily: 'var(--font-ibm-plex-mono)',
            }}
          >
            <Check className="w-3 h-3" />
            {isExecuting ? 'Running…' : 'Submit'}
            <span className="lcb-kbd-hint" style={{ opacity: 0.6, fontSize: 10 }}>⇧{modKey}↵</span>
          </button>
        </div>
      </div>

      {/* ── Level description ────────────────────────────────────────────── */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--lcb-border)' }}>
        <p className="text-xs leading-5" style={{ color: 'var(--lcb-white)', opacity: 0.8, fontFamily: 'var(--font-ibm-plex-mono)', whiteSpace: 'pre-wrap' }}>
          {level?.description}
        </p>
        {hasAttemptedCurrent && hintChunks.length > 0 && (
          <div className="mt-2">
            {hintChunkIdx > 0 && (
              <div
                className="flex items-start gap-2 px-3 py-2 mb-1"
                style={{ border: '1px solid rgba(201,168,76,0.22)', background: 'rgba(201,168,76,0.05)', borderRadius: 3 }}
              >
                <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--lcb-gold)' }} />
                <div className="flex-1 min-w-0">
                  {hintChunks.slice(0, hintChunkIdx).map((chunk, i) => (
                    <p
                      key={i}
                      className="text-xs leading-5"
                      style={{
                        color: 'var(--lcb-gold)',
                        fontFamily: 'var(--font-ibm-plex-mono)',
                        opacity: i < hintChunkIdx - 1 ? 0.7 : 1,
                        marginTop: i > 0 ? 4 : 0,
                      }}
                    >
                      {chunk}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {hintChunkIdx < hintChunks.length && (
              <button
                onClick={() => setHintChunkIdx((n) => n + 1)}
                className="flex items-center gap-1.5 text-xs px-2 py-1 transition-opacity hover:opacity-80"
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  color: 'var(--lcb-gold)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: 3,
                  background: 'rgba(201,168,76,0.04)',
                }}
              >
                <Lightbulb className="w-3 h-3" />
                {hintChunkIdx === 0
                  ? 'Request hint'
                  : `Show more hint (${hintChunks.length - hintChunkIdx} step${hintChunks.length - hintChunkIdx === 1 ? '' : 's'} remaining)`}
              </button>
            )}
          </div>
        )}
        {expectedShape && (
          <div
            className="mt-2 px-3 py-2"
            style={{ border: '1px solid rgba(96,165,250,0.25)', background: 'rgba(96,165,250,0.05)', borderRadius: 3 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#60a5fa', fontFamily: 'var(--font-ibm-plex-mono)' }}>
              Harbour Master&apos;s Dossier
            </p>
            <p className="text-xs leading-5" style={{ color: 'var(--lcb-white)', opacity: 0.8, fontFamily: 'var(--font-ibm-plex-mono)' }}>
              The expected report has <span style={{ color: '#60a5fa' }}>{expectedShape.rows}</span> row{expectedShape.rows === 1 ? '' : 's'} with column{expectedShape.columns.length === 1 ? '' : 's'}:{' '}
              <span style={{ color: '#60a5fa' }}>{expectedShape.columns.join(', ')}</span>
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
          value={query}
          onChange={(v) => setQuery(v || '')}
          onMount={handleEditorMount}
          options={{
            minimap:               { enabled: false },
            fontSize:              isTouch ? 16 : 13,
            wordWrap:              isTouch ? 'on' : 'off',
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
              className="lcb-icon-btn flex-shrink-0 p-0.5 transition-opacity hover:opacity-60"
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
