import { OTCAntelopeTable } from '@/components/tables/OTCAntelopeTable';
import { SEOHead } from '@/components/SEOHead';

export default function OTCAntelope() {
  return (
    <div className="container mx-auto pt-2 px-4 pb-4 h-[calc(100vh-4rem)]">
      <SEOHead 
        title="Colorado OTC Antelope Tags & Harvest Statistics | TalloTags"
        description="Colorado over-the-counter pronghorn tag harvest statistics. Free access to OTC unit success rates and harvest data."
        canonicalPath="/otc-antelope"
      />
      <div className="flex items-start gap-6 mb-2">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">OTC Antelope Units</h1>
          <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter antelope harvest statistics by unit and season.</p>
        </div>
      </div>
      <OTCAntelopeTable />
    </div>
  );
}
