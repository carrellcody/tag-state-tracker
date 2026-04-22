import { OTCAntelopeTableNew } from "@/components/tables/OTCAntelopeTableNew";
import { SEOHead } from "@/components/SEOHead";

export default function OTCAntelopeNew() {
  return (
    <div className="container mx-auto pt-2 px-4 pb-4 h-[calc(100vh-4rem)]">
      <SEOHead
        title="Colorado OTC Pronghorn Units (New) | TalloTags"
        description="Colorado over-the-counter pronghorn unit data with DAU population estimates and harvest statistics."
        canonicalPath="/OTCAntelopeNew"
      />
      <div className="mb-2 px-1">
        <h1 className="text-3xl font-bold mb-1">OTC Pronghorn Units (New)</h1>
        <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter pronghorn unit data by DAU population, harvest, and land statistics.</p>
      </div>
      <OTCAntelopeTableNew />
    </div>
  );
}
