import React from 'react';
import { Spinner } from '../atoms/Spinner';
import { EmptyState } from '../molecules/EmptyState';
import { Pagination } from '../molecules/Pagination';
import { Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  page?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (p: number) => void;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  rowKey?: (row: T) => string | number;
}

export function DataTable<T>({
  columns, data, loading, emptyTitle = 'No records found',
  emptyDescription, emptyAction, page, totalPages, totalCount,
  pageSize, onPageChange, rowKey,
}: Props<T>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)' }}>
              {columns.map(col => (
                <th key={col.key} style={{
                  padding: '10px 14px', textAlign: col.align || 'left',
                  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                  width: col.width,
                }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner /></div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={<Inbox size={36} />}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={rowKey ? rowKey(row) : idx}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  {columns.map(col => (
                    <td key={col.key} style={{
                      padding: '11px 14px', fontSize: 13,
                      color: 'var(--text-primary)', textAlign: col.align || 'left',
                      verticalAlign: 'middle',
                    }}>
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && data.length > 0 && page !== undefined && totalPages !== undefined && onPageChange && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalCount={totalCount}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}
