import { AntelopeHarvestTable } from '@/components/tables/AntelopeHarvestTable';
import { SEOHead } from '@/components/SEOHead';

export default function AntelopeHarvest() {
  return (
    <div className="container mx-auto pt-2 pb-10 h-[calc(100vh-8rem)]">
      <SEOHead 
        title="Colorado Pronghorn Harvest Statistics 2024 | TalloTags"
        description="Colorado antelope and pronghorn harvest data for 2024. Free access to success rates, hunter density, and harvest statistics by unit."
        canonicalPath="/antelope-harvest"
      />
      <div className="flex items-start gap-6 mb-2">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">Antelope Harvest Statistics</h1>
          <p className="text-muted-foreground text-sm">View Colorado antelope harvest data by unit for 2025</p>
        </div>
      </div>
      <AntelopeHarvestTable />
    </div>
  );
}
