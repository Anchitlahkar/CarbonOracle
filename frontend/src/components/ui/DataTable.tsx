import React from 'react';

interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  rowKey: (item: T) => string | number;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  emptyState,
  isLoading = false,
  rowKey,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto w-full border border-white/[0.04] rounded-sm bg-bg-surface/40 backdrop-blur-sm ${className}`}>
      <table className="w-full text-left border-collapse text-[16px]">
        <thead>
          <tr className="border-b border-white/[0.04] bg-white/[0.02]">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-4 py-3 font-bold text-text-muted/60 tracking-[0.1em] uppercase font-display text-[14px] ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.02] font-mono">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-text-muted">
                <div className="flex items-center justify-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-text-muted font-body">
                {emptyState || 'No telemetry data recorded.'}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={rowKey(item)} className="hover:bg-white/[0.02] transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-4 py-3 text-text-primary/90 border-r border-white/[0.01] last:border-r-0 ${col.className || ''}`}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
