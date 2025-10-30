import { ElkHarvestTable } from '@/components/tables/ElkHarvestTable';

export default function ElkHarvest() {
  return (
    <div className="container mx-auto py-6 h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Elk Harvest Statistics</h1>
        <p className="text-muted-foreground">
          View Colorado elk harvest data by unit for 2025
        </p>
      </div>
      <ElkHarvestTable />
    </div>
  );
}
