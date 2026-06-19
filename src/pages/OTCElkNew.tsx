import { OTCElkTableNew } from "@/components/tables/OTCElkTableNew";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTierFromProductId, canAccessElk } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function OTCElkNew() {
  const { user, subscriptionStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  const hasAccess = canAccessElk(currentTier);

  if (!authLoading && !hasAccess) {
    return (
      <div className="container mx-auto pt-2 pb-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <SEOHead
          title="Colorado OTC Elk Units | TalloTags"
          description="Colorado over-the-counter elk unit data with DAU population estimates and harvest statistics."
          canonicalPath="/otc-elk"
        />
        <h1 className="text-3xl font-bold mb-3">OTC Elk Units</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Access to OTC Elk statistics requires a Pro membership.
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
    <div className="container mx-auto pt-2 px-4 pb-4 h-[calc(100vh-4rem)]">
      <SEOHead
        title="Colorado OTC Elk Units | TalloTags"
        description="Colorado over-the-counter elk unit data with DAU population estimates and harvest statistics."
        canonicalPath="/otc-elk"
      />
      <div className="mb-2 px-1">
        <h1 className="text-3xl font-bold mb-1">OTC Elk Units</h1>
        <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter elk unit data by DAU population, harvest, and land statistics. All harvest and DAU statistics are from 2025 data</p>
      </div>
      <OTCElkTableNew />
    </div>
  );
}
