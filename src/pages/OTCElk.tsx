import { OTCElkTable } from '@/components/tables/OTCElkTable';

export default function OTCElk() {
  return (
    <div className="container mx-auto py-8 px-4 h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">OTC Elk Units</h1>
        <p className="text-muted-foreground">
          Browse Colorado's over-the-counter elk harvest statistics by unit and season.
        </p>
      </div>
      <OTCElkTable />
    </div>
  );
}