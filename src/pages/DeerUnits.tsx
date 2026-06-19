import { DeerUnitsTable } from "@/components/tables/DeerUnitsTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTierFromProductId, canAccessDeer } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function DeerUnits() {
  const { user, subscriptionStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  const hasAccess = canAccessDeer(currentTier);

  if (!authLoading && !hasAccess) {
    return (
      <div className="container mx-auto pt-2 pb-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <SEOHead
          title="Colorado Deer Unit Information | TalloTags"
          description="Colorado mule deer unit information including acreage, public land percentage, DAU population, deer density, and buck:doe ratio."
          canonicalPath="/Deer-Units"
        />
        <h1 className="text-3xl font-bold mb-3">Colorado Deer Unit Information</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Access to Deer unit information requires a Pro membership.
        </p>
        <Button
          size="lg"
          onClick={() => navigate(user ? "/subscription" : "/auth")}
        >
          Sign up for access! - 30 day free trial, cancel anytime
        </Button>
      </div>
    );
  }

  if (authLoading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

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
