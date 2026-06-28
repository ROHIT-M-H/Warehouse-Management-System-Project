import { useState, useCallback } from 'react';
import { extractErrors } from '../utils';
import toast from 'react-hot-toast';

export function useApi<T>(
  fn: (...args: any[]) => Promise<T>,
  options?: { successMsg?: string; onSuccess?: (data: T) => void }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fn(...args);
      if (options?.successMsg) toast.success(options.successMsg);
      options?.onSuccess?.(data);
      return data;
    } catch (err: any) {
      const msg = extractErrors(err);
      setError(msg);
      toast.error(msg.split('\n')[0]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { execute, loading, error };
}
