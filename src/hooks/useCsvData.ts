import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export function useCsvData<T = any>(csvPath: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Papa.parse(csvPath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Remove BOM, trim whitespace, and normalize Unicode
        return header
          .replace(/^\uFEFF/, '') // Remove BOM
          .replace(/[\u00A0]/g, ' ') // Replace non-breaking spaces
          .trim();
      },
      complete: (results) => {
        setData(results.data as T[]);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      },
    });
  }, [csvPath]);

  return { data, loading, error };
}
