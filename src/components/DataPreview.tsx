'use client';

import { useGameStore } from '@/store/useGameStore';
import { Table, Database } from 'lucide-react';

export default function DataPreview() {
  const { queryResult, error } = useGameStore();

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

  if (!queryResult || queryResult.values.length === 0) {
    return (
      <div className="h-full flex flex-col overflow-hidden fade-in-up" style={panelStyle}>
        <div style={headerStyle} className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5" style={{ color: 'var(--lcb-gold)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-white)' }}>
            Query Results
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
            Run a query to see results
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
          <tbody>
            {queryResult.values.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="lcb-table-row"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
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
