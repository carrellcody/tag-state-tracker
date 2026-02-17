import { AntelopeDrawTable } from '@/components/tables/AntelopeDrawTable';
import { SEOHead } from '@/components/SEOHead';

export default function AntelopeDraw() {
  return (
    <div className="container mx-auto pt-2 pb-10 h-[calc(100vh-8rem)]">
      <SEOHead 
        title="Colorado Pronghorn Draw Odds 2026 | TalloTags"
        description="Colorado antelope and pronghorn draw odds for 2026. Free access to draw statistics, preference points, and unit analysis."
        canonicalPath="/antelope"
      />
      <div className="flex items-start gap-6 mb-2">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">Antelope Draw Statistics</h1>
          <p className="text-muted-foreground text-sm">Hunt codes, dates, and valid units pulled from 2026 Big Game Brochure. Draw odds from 2025, and harvest stats from 2024.</p>
        </div>
      </div>
      <AntelopeDrawTable />
    </div>
  );
}
