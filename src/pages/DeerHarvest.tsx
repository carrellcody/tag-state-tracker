import { DeerHarvestTable } from '@/components/tables/DeerHarvestTable';

export default function DeerHarvest() {
  return (
    <div className="container mx-auto py-6 h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Deer Harvest Statistics</h1>
        <p className="text-muted-foreground">
          View Colorado deer harvest data by unit for 2025
        </p>
      </div>
      <DeerHarvestTable />
    </div>
  );
}
