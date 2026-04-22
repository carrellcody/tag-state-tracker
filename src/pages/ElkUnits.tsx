import { ElkUnitsTable } from "@/components/tables/ElkUnitsTable";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getTierFromProductId, canAccessElk } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function ElkUnits() {
  const { subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  useEffect(() => {
    if (!loading && !canAccessElk(currentTier)) {
      navigate("/subscription");
    }
  }, [currentTier, navigate, loading]);
  if (loading || !canAccessElk(currentTier)) return null;
  return (
    <div className="container mx-auto pt-2 pb-10 h-auto lg:h-[calc(100vh-8rem)]">
      <SEOHead
        title="Colorado Elk Unit Information | TalloTags"
        description="Colorado elk unit information including acreage, public land percentage, DAU population, elk density, and bull:cow ratio."
        canonicalPath="/Elk-Units"
      />
      <div className="mb-2 px-1">
        <h1 className="text-3xl font-bold mb-1">Colorado Elk Unit Information</h1>
        <p className="text-muted-foreground text-sm">
          Unit-level land and herd statistics including acreage, public land, DAU population, elk density, and bull:cow ratios.
        </p>
      </div>
      <ElkUnitsTable />
    </div>
  );
}
