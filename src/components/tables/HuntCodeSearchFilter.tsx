import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface Props {
  allCodes: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function HuntCodeSearchFilter({ allCodes, selected, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return [];
    const selSet = new Set(selected.map(s => s.toUpperCase()));
    const matches: string[] = [];
    for (const code of allCodes) {
      if (!code) continue;
      const up = String(code).toUpperCase();
      if (selSet.has(up)) continue;
      if (up.includes(q)) matches.push(code);
      if (matches.length >= 50) break;
    }
    return matches;
  }, [query, allCodes, selected]);

  const addCode = (code: string) => {
    if (!selected.includes(code)) onChange([...selected, code]);
    setQuery("");
    setOpen(false);
  };

  const removeCode = (code: string) => {
    onChange(selected.filter(c => c !== code));
  };

  return (
    <div className="space-y-2" ref={wrapRef}>
      <Label>Search Hunt Codes</Label>
      <div className="relative">
        <Input
          placeholder="Type a hunt code..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
            {suggestions.map(code => (
              <button
                key={code}
                type="button"
                className="block w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => addCode(code)}
              >
                {code}
              </button>
            ))}
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map(code => (
            <span
              key={code}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs"
            >
              {code}
              <button
                type="button"
                onClick={() => removeCode(code)}
                aria-label={`Remove ${code}`}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
