import { ElkHarvestTable } from "@/components/tables/ElkHarvestTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTierFromProductId, canAccessElk } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function ElkHarvest() {
  const { user, subscriptionStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  const hasAccess = canAccessElk(currentTier);

  if (!authLoading && !hasAccess) {
    return (
      <div className="container mx-auto pt-2 pb-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <SEOHead
          title="Colorado Elk Harvest Statistics 2024 | TalloTags"
          description="Colorado elk harvest data and success rates for 2024. View hunter density, harvest numbers, and success percentages by unit."
          canonicalPath="/elk-harvest"
        />
        <h1 className="text-3xl font-bold mb-3">Elk Harvest Statistics</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Access to Elk harvest statistics requires a Pro membership.
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
    <div className="container mx-auto pt-2 pb-10 h-[calc(100vh-8rem)]">
      <SEOHead
        title="Colorado Elk Harvest Statistics 2024 | TalloTags"
        description="Colorado elk harvest data and success rates for 2024. View hunter density, harvest numbers, and success percentages by unit."
        canonicalPath="/elk-harvest"
      />
      <div className="mb-2 px-1">
        <div>
          <h1 className="text-3xl font-bold mb-1">Elk Harvest Statistics</h1>
          <p className="text-muted-foreground text-sm">View Colorado elk harvest data by unit for 2025</p>
        </div>
      </div>
      <ElkHarvestTable />
    </div>
  );
}
