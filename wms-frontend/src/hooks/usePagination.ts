import { useState } from 'react';

export function usePagination(pageSize = 20) {
  const [page, setPage] = useState(1);
  const totalPages = (count: number) => Math.ceil(count / pageSize);
  const reset = () => setPage(1);
  return { page, setPage, totalPages, reset };
}
