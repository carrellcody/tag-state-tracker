import { AntelopeDrawTable } from "@/components/tables/AntelopeDrawTable";
import { SEOHead } from "@/components/SEOHead";

export default function AntelopeDraw() {
  return (
    <div className="container mx-auto pt-2 pb-10 h-auto lg:h-[calc(100vh-8rem)]">
      <SEOHead
        title="Colorado Pronghorn Draw Odds 2026 | TalloTags"
        description="Colorado pronghorn draw odds for 2026. Free access to draw statistics, preference points, and unit analysis."
        canonicalPath="/antelope"
      />
      <div className="mb-2 px-1">
        <div>
          <h1 className="text-3xl font-bold mb-1">Colorado Pronghorn Draw Odds</h1>
          <p className="text-muted-foreground text-sm">
            Hunt codes, dates, and valid units pulled from 2026 Big Game Brochure. Draw odds from 2025, and harvest
            stats from 2024.
          </p>
        </div>
      </div>
      <AntelopeDrawTable />
    </div>
  );
}
