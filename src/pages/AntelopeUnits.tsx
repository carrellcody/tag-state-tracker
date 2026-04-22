import { AntelopeUnitsTable } from "@/components/tables/AntelopeUnitsTable";
import { SEOHead } from "@/components/SEOHead";

export default function AntelopeUnits() {
  return (
    <div className="container mx-auto pt-2 pb-10 h-auto lg:h-[calc(100vh-8rem)]">
      <SEOHead
        title="Colorado Pronghorn Unit Information | TalloTags"
        description="Colorado pronghorn unit information including acreage, public land percentage, DAU population, density, and buck:doe ratio."
        canonicalPath="/Antelope-Units"
      />
      <div className="mb-2 px-1">
        <h1 className="text-3xl font-bold mb-1">Colorado Pronghorn Unit Information</h1>
        <p className="text-muted-foreground text-sm">
          Unit-level land and herd statistics including acreage, public land, DAU population, pronghorn density, and buck:doe ratios.
        </p>
      </div>
      <AntelopeUnitsTable />
    </div>
  );
}
