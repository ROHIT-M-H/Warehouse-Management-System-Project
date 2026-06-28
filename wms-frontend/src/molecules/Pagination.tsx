import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../atoms/Button';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  totalCount?: number;
  pageSize?: number;
}

export const Pagination: React.FC<Props> = ({ page, totalPages, onPageChange, totalCount, pageSize = 20 }) => {
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount || 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', flexWrap: 'wrap', gap: 8 }}>
      {totalCount !== undefined && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Showing {start}–{end} of {totalCount}
        </span>
      )}
      <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} icon={<ChevronLeft size={14} />} />
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let p: number;
          if (totalPages <= 7) p = i + 1;
          else if (page <= 4) p = i + 1;
          else if (page >= totalPages - 3) p = totalPages - 6 + i;
          else p = page - 3 + i;
          return (
            <Button key={p} size="sm" variant={p === page ? 'primary' : 'secondary'} onClick={() => onPageChange(p)}>
              {p}
            </Button>
          );
        })}
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} icon={<ChevronRight size={14} />} />
      </div>
    </div>
  );
};
