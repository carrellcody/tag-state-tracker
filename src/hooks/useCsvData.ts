import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';

// In-memory only cache (no sessionStorage/localStorage), keyed by the full
// csvPath which already includes the CSV_VERSION query param. Cleared on every
// full page load, so updated CSVs can never be served from a stale cache.
const memoryCache = new Map<string, unknown[]>();

const normalizeHeaderLine = (line: string) =>
  line
    .replace(/^\uFEFF/, '')
    .split(',')
    .map((h) => h.replace(/[\u00A0]/g, ' ').trim())
    .join(',');


export function useCsvData<T = any>(csvPath: string) {
  const [data, setData] = useState<T[]>(() => (memoryCache.get(csvPath) as T[]) ?? []);
  const [loading, setLoading] = useState(() => !memoryCache.has(csvPath));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cached = memoryCache.get(csvPath) as T[] | undefined;
    if (cached) {
      setData(cached);
      setError(null);
      setLoading(false);
      return;
    }

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

        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/serve-csv?file=${encodeURIComponent(filename)}`,
          { headers }
        );

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Failed to fetch CSV: ${response.status} ${errBody}`);
        }

        const rawText = await response.text();

        if (cancelled) return;

        // Normalize the header row up front (strip BOM / non-breaking spaces,
        // trim). Doing it here instead of via transformHeader keeps the parse
        // config function-free, which is required for worker mode.
        const newlineIdx = rawText.search(/\r?\n/);
        const csvText =
          newlineIdx === -1
            ? normalizeHeaderLine(rawText)
            : normalizeHeaderLine(rawText.slice(0, newlineIdx)) + rawText.slice(newlineIdx);

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          // Parse off the main thread so large files don't freeze the UI.
          worker: true,

          complete: (results) => {
            const rows = results.data as T[];
            memoryCache.set(csvPath, rows as unknown[]);
            if (!cancelled) {
              setData(rows);
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
