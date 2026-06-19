import { ElkDrawTableNew } from "@/components/tables/ElkDrawTableNew";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTierFromProductId, canAccessElk } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function ElkDrawNew() {
  const { user, subscriptionStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  const hasAccess = canAccessElk(currentTier);

  if (!authLoading && !hasAccess) {
    return (
      <div className="container mx-auto pt-2 pb-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <SEOHead
          title="Colorado Elk Draw Odds 2026 | TalloTags"
          description="Colorado elk draw odds and preference point statistics for 2026 with enhanced harvest and land data."
          canonicalPath="/elk-draw"
        />
        <h1 className="text-3xl font-bold mb-3">Colorado Elk Draw Odds</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Access to Elk draw statistics requires a Pro membership.
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
        title="Colorado Elk Draw Odds 2026 | TalloTags"
        description="Colorado elk draw odds and preference point statistics for 2026 with enhanced harvest and land data."
        canonicalPath="/elk-draw"
      />
      <div className="mb-2 px-1">
        <h1 className="text-3xl font-bold mb-1">Colorado Elk Draw Odds</h1>
        <p className="text-muted-foreground text-sm">
          Hunt codes, dates, and valid units pulled from 2026 Big Game Brochure. Draw odds from 2026, and harvest stats from 2025.
        </p>
      </div>
      <ElkDrawTableNew />
    </div>
  );
}
