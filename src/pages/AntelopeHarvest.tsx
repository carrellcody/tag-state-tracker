import { AntelopeHarvestTable } from '@/components/tables/AntelopeHarvestTable';


export default function AntelopeHarvest() {
  return (
    <div className="container mx-auto py-6 pb-32 h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Antelope Harvest Statistics</h1>
        <p className="text-muted-foreground">
          View Colorado antelope harvest data by unit for 2025
        </p>
      </div>
      <AntelopeHarvestTable />
    </div>
  );
}
