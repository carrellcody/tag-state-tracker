import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';

export function useCsvData<T = any>(csvPath: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchCsv = async () => {
      try {
        // Extract just the filename from the path (e.g. "/data/FullDeer25Final.csv?v=3" -> "FullDeer25Final.csv")
        const filename = csvPath.split('/').pop()?.split('?')[0];
        if (!filename) {
          throw new Error('Invalid CSV path');
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/serve-csv?file=${encodeURIComponent(filename)}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Failed to fetch CSV: ${response.status} ${errBody}`);
        }

        const csvText = await response.text();

        if (cancelled) return;

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => {
            return header
              .replace(/^\uFEFF/, '')
              .replace(/[\u00A0]/g, ' ')
              .trim();
          },
          complete: (results) => {
            if (!cancelled) {
              setData(results.data as T[]);
              setLoading(false);
            }
          },
          error: (err) => {
            if (!cancelled) {
              setError(err.message);
              setLoading(false);
            }
          },
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch CSV');
          setLoading(false);
        }
      }
    };

    fetchCsv();

    return () => {
      cancelled = true;
    };
  }, [csvPath]);

  return { data, loading, error };
}
