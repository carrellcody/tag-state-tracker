import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagAlert {
  id: string;
  tag_code: string;
  created_at: string;
}

// 5 segments: [letter, letter, 3 numbers, 2 (1 letter + 1 number), letter]
const SEGMENTS = [
  { length: 1, pattern: /^[A-Za-z]$/, label: 'Letter' },
  { length: 1, pattern: /^[A-Za-z]$/, label: 'Letter' },
  { length: 3, pattern: /^[0-9]{1,3}$/, fullPattern: /^[0-9]{3}$/, label: 'Numbers' },
  { length: 2, pattern: /^[A-Za-z0-9]{1,2}$/, fullPattern: /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{2}$/, label: '1 Letter + 1 Number' },
  { length: 1, pattern: /^[A-Za-z]$/, label: 'Letter' },
];

export default function TagAlertsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<TagAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [segments, setSegments] = useState<string[]>(['', '', '', '', '']);
  const [adding, setAdding] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user) loadAlerts();
  }, [user]);

  // Scroll into view when arriving via #tag-alerts hash
  useEffect(() => {
    if (window.location.hash === '#tag-alerts') {
      setTimeout(() => {
        document.getElementById('tag-alerts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  const loadAlerts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tag_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const isSegmentComplete = (idx: number, val: string) => {
    const s = SEGMENTS[idx];
    if (val.length !== s.length) return false;
    return (s.fullPattern || s.pattern).test(val);
  };

  const allValid = segments.every((s, i) => isSegmentComplete(i, s));
  const fullCode = segments.join('').toUpperCase();

  const handleSegmentChange = (idx: number, raw: string) => {
    const seg = SEGMENTS[idx];
    let val = raw;

    // Filter chars per segment
    if (idx === 0 || idx === 1 || idx === 4) {
      val = val.replace(/[^A-Za-z]/g, '');
    } else if (idx === 2) {
      val = val.replace(/[^0-9]/g, '');
    } else if (idx === 3) {
      val = val.replace(/[^A-Za-z0-9]/g, '');
    }

    val = val.slice(0, seg.length).toUpperCase();
    const next = [...segments];
    next[idx] = val;
    setSegments(next);

    // Auto-advance
    if (val.length === seg.length && idx < SEGMENTS.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && segments[idx] === '' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const resetInput = () => {
    setSegments(['', '', '', '', '']);
  };

  const handleAdd = async () => {
    if (!user || !allValid) return;
    setAdding(true);
    const { error } = await supabase
      .from('tag_alerts')
      .insert({ user_id: user.id, tag_code: fullCode });
    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already added', description: 'This tag code is already in your alerts.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to add tag alert.', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Tag alert added', description: fullCode });
      resetInput();
      setShowInput(false);
      await loadAlerts();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tag_alerts').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    } else {
      setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  return (
    <Card id="tag-alerts" className="scroll-mt-20">
      <CardHeader>
        <CardTitle>Tag Alerts</CardTitle>
        <CardDescription>
          Get an email every Monday morning if any of your saved tag codes appear on the leftover lists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            {alerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Your tag alert codes</p>
                <ul className="divide-y border rounded-md">
                  {alerts.map(a => (
                    <li key={a.id} className="flex items-center justify-between px-3 py-2">
                      <span className="font-mono text-sm">{a.tag_code}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(a.id)}
                        aria-label={`Delete ${a.tag_code}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showInput ? (
              <div className="space-y-3 border rounded-md p-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Enter 8-character tag code</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { resetInput(); setShowInput(false); }}
                    aria-label="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  {SEGMENTS.map((seg, idx) => (
                    <input
                      key={idx}
                      ref={el => { inputRefs.current[idx] = el; }}
                      value={segments[idx]}
                      onChange={e => handleSegmentChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      maxLength={seg.length}
                      className={cn(
                        'h-11 text-center font-mono uppercase rounded-md border border-input bg-background text-base',
                        'focus:outline-none focus:ring-2 focus:ring-ring',
                        seg.length === 1 && 'w-10',
                        seg.length === 2 && 'w-16',
                        seg.length === 3 && 'w-20',
                        isSegmentComplete(idx, segments[idx]) && 'border-primary'
                      )}
                      aria-label={seg.label}
                      placeholder={'_'.repeat(seg.length)}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: Letter • Letter • 3 Numbers • 1 Letter + 1 Number • Letter
                </p>
                <Button onClick={handleAdd} disabled={!allValid || adding} className="w-full sm:w-auto">
                  {adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding…</> : 'Add'}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowInput(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add tag alert
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
