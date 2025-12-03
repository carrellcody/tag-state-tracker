import { HelpCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface TableHeaderHelpProps {
  label: string;
  helpText?: string;
}

export function TableHeaderHelp({ label, helpText }: TableHeaderHelpProps) {
  const [open, setOpen] = useState(false);

  if (!helpText) {
    return <span>{label}</span>;
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="absolute -top-1 -right-1 p-0.5 rounded hover:bg-primary-foreground/20 transition-colors"
          aria-label={`Help for ${label}`}
        >
          <HelpCircle className="w-3.5 h-3.5 opacity-60" />
        </button>
        <span>{label}</span>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{label}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground leading-relaxed">{helpText}</p>
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button size="lg" className="px-8">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
