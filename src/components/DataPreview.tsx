'use client';

import { useGameStore } from '@/store/useGameStore';
import { Table, Database } from 'lucide-react';

export default function DataPreview() {
  const { queryResult, error } = useGameStore();

  // Re-mount tbody whenever result shape changes to re-trigger row animations.
  // Derived from content — no refs or effects needed (React Compiler safe).
  const resultKey = queryResult
    ? `${queryResult.columns.join('|')}:${queryResult.values.length}`
    : 'empty';

  const panelStyle = {
    background: 'var(--lcb-panel)',
    border: '1px solid var(--lcb-border)',
    borderRadius: 6,
  };

  const headerStyle = {
    borderBottom: '1px solid var(--lcb-border)',
    background: 'var(--lcb-panel-2)',
    padding: '10px 12px',
  };

  if (error) {
    return (
      <div className="h-full flex flex-col overflow-hidden fade-in-up" style={panelStyle}>
        <div style={headerStyle} className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5" style={{ color: 'var(--lcb-gold)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest lcb-header" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-white)' }}>
            Query Results
          </span>
        </div>
        <div className="flex-1 p-4">
          <p className="text-xs" style={{ color: 'var(--lcb-red)', fontFamily: 'var(--font-ibm-plex-mono)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!queryResult) {
    return (
      <div className="h-full flex flex-col overflow-hidden fade-in-up" style={panelStyle}>
        <div style={headerStyle} className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5" style={{ color: 'var(--lcb-gold)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-white)' }}>
            Query Results
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-xs" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
            Nothing on the wire yet.
          </p>
          <p className="text-xs leading-5" style={{ color: 'var(--lcb-muted)', opacity: 0.7, fontFamily: 'var(--font-ibm-plex-mono)' }}>
            Run your query to inspect its output — or explore freely, e.g.{' '}
            <span style={{ color: 'var(--lcb-gold)' }}>SELECT * FROM customers LIMIT 5</span>
          </p>
        </div>
      </div>
    );
  }

  if (queryResult.values.length === 0) {
    return (
      <div className="h-full flex flex-col overflow-hidden fade-in-up" style={panelStyle}>
        <div style={headerStyle} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5" style={{ color: 'var(--lcb-gold)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-white)' }}>
              Query Results
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
            0 rows
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-xs leading-5" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
            The query ran fine but returned no rows — check your WHERE conditions
            (values are case-sensitive: &apos;Active&apos; ≠ &apos;active&apos;).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden fade-in-up" style={panelStyle}>
      <div style={headerStyle} className="flex items-center justify-between">
        <div className="flex items-center gap-2 lcb-header">
          <Table className="w-3.5 h-3.5" style={{ color: 'var(--lcb-gold)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-white)' }}>
            Query Results
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
          {queryResult.values.length} rows
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs" style={{ fontFamily: 'var(--font-ibm-plex-mono)', borderCollapse: 'collapse' }}>
          <thead className="sticky top-0" style={{ background: 'var(--lcb-panel-2)' }}>
            <tr>
              {queryResult.columns.map((col, i) => (
                <th
                  key={i}
                  className="text-left px-3 py-2 uppercase tracking-widest"
                  style={{
                    color: 'var(--lcb-gold)',
                    borderBottom: '1px solid var(--lcb-border)',
                    fontWeight: 600,
                    fontSize: 10,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody key={resultKey}>
            {queryResult.values.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="lcb-table-row"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  animation: `fadeInRow 0.28s ease forwards ${Math.min(rowIdx, 20) * 22}ms`,
                  opacity: 0,
                }}
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-3 py-1.5"
                    style={{
                      color: cell === null
                        ? 'var(--lcb-muted)'
                        : typeof cell === 'number'
                        ? '#7dd3fc'
                        : 'var(--lcb-white)',
                      fontStyle: cell === null ? 'italic' : 'normal',
                    }}
                  >
                    {cell === null ? 'NULL' : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
