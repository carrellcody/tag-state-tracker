import { AntelopeHarvestTable } from '@/components/tables/AntelopeHarvestTable';


export default function AntelopeHarvest() {
  return (
    <div className="container mx-auto py-6 pb-5 h-[calc(100vh-8rem)]">
      <div className="flex items-start gap-6 mb-3">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">Antelope Harvest Statistics</h1>
          <p className="text-muted-foreground text-sm">View Colorado antelope harvest data by unit for 2025</p>
        </div>
      </div>
      <AntelopeHarvestTable />
    </div>
  );
}
