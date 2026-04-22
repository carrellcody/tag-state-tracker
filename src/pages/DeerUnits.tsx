import { DeerUnitsTable } from "@/components/tables/DeerUnitsTable";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getTierFromProductId, canAccessDeer } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function DeerUnits() {
  const { subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);

  useEffect(() => {
    if (!loading && !canAccessDeer(currentTier)) {
      navigate("/subscription");
    }
  }, [currentTier, navigate, loading]);

  if (loading || !canAccessDeer(currentTier)) return null;

  return (
    <div className="container mx-auto pt-2 pb-10 h-auto lg:h-[calc(100vh-8rem)]">
      <SEOHead
        title="Colorado Deer Unit Information | TalloTags"
        description="Colorado mule deer unit information including acreage, public land percentage, DAU population, deer density, and buck:doe ratio."
        canonicalPath="/Deer-Units"
      />
      <div className="mb-2 px-1">
        <h1 className="text-3xl font-bold mb-1">Colorado Deer Unit Information</h1>
        <p className="text-muted-foreground text-sm">
          Unit-level land and herd statistics including acreage, public land, DAU population, deer density, and buck:doe ratios.
        </p>
      </div>
      <DeerUnitsTable />
    </div>
  );
}
