'use client';

import { useGameStore } from '@/store/useGameStore';
import { Table, Database } from 'lucide-react';

export default function DataPreview() {
  const { queryResult, error } = useGameStore();

  if (error) {
    return (
      <div className="h-full flex flex-col overflow-hidden rounded-2xl" style={{ backgroundColor: 'rgba(13, 31, 53, 0.95)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <div className="p-4 border-b border-white/10" style={{ backgroundColor: 'rgba(10, 22, 40, 0.8)' }}>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Preview
          </h3>
        </div>
        <div className="flex-1 p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!queryResult || queryResult.values.length === 0) {
    return (
      <div className="h-full flex flex-col overflow-hidden rounded-2xl" style={{ backgroundColor: 'rgba(13, 31, 53, 0.95)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <div className="p-4 border-b border-white/10" style={{ backgroundColor: 'rgba(10, 22, 40, 0.8)' }}>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Preview
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/40 text-sm">Execute a query to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl" style={{ backgroundColor: 'rgba(13, 31, 53, 0.95)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between" style={{ backgroundColor: 'rgba(10, 22, 40, 0.8)' }}>
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Table className="w-4 h-4" />
          Data Preview
        </h3>
        <span className="text-white/50 text-xs">
          {queryResult.values.length} rows
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0" style={{ backgroundColor: 'rgba(10, 22, 40, 0.9)' }}>
            <tr>
              {queryResult.columns.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-cyan-300 font-semibold text-xs uppercase tracking-wider border-b border-white/10"
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
                className={`${rowIdx % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'} hover:bg-blue-500/20 transition-colors`}
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-4 py-2.5 text-white/80 border-b border-white/5"
                  >
                    {cell === null ? (
                      <span className="text-blue-300/40 italic">NULL</span>
                    ) : (
                      <span className={typeof cell === 'number' ? 'text-cyan-300' : ''}>
                        {String(cell)}
                      </span>
                    )}
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
