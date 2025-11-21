import { OTCAntelopeTable } from '@/components/tables/OTCAntelopeTable';

export default function OTCAntelope() {
  return (
    <div className="container mx-auto py-8 px-4 pb-32 h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">OTC Antelope Units</h1>
        <p className="text-muted-foreground">
          Browse Colorado's over-the-counter antelope harvest statistics by unit and season.
        </p>
      </div>
      <OTCAntelopeTable />
    </div>
  );
}
