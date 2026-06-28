export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

export const formatCurrency = (val: string | number) =>
  `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits:2 })}`;

export const movementTypeLabel: Record<string, string> = {
  stock_in: 'Stock In', stock_out: 'Stock Out', adjustment: 'Adjustment',
};

export const statusLabel: Record<string, string> = {
  pending: 'Pending', completed: 'Completed', cancelled: 'Cancelled',
};

export const movementTypeBadge = (t: string): 'success'|'danger'|'info' => {
  if (t === 'stock_in') return 'success';
  if (t === 'stock_out') return 'danger';
  return 'info';
};

export const statusBadge = (s: string): 'warning'|'success'|'default' => {
  if (s === 'pending') return 'warning';
  if (s === 'completed') return 'success';
  return 'default';
};

export const extractErrors = (err: any): string => {
  if (!err?.response?.data) return 'An unexpected error occurred.';
  const data = err.response.data;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const messages: string[] = [];
  Object.entries(data).forEach(([key, val]) => {
    const msg = Array.isArray(val) ? val.join(', ') : String(val);
    messages.push(key === 'non_field_errors' ? msg : `${key}: ${msg}`);
  });
  return messages.join('\n') || 'An error occurred.';
};
