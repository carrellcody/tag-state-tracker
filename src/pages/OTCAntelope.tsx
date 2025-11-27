import { OTCAntelopeTable } from '@/components/tables/OTCAntelopeTable';

export default function OTCAntelope() {
  return (
    <div className="container mx-auto py-6 px-4 pb-0 h-[calc(100vh-4rem)]">
      <div className="flex items-start gap-6 mb-3">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">OTC Antelope Units</h1>
          <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter antelope harvest statistics by unit and season.</p>
        </div>
      </div>
      <OTCAntelopeTable />
    </div>
  );
}
