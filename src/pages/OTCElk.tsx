import { OTCElkTable } from "@/components/tables/OTCElkTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTierFromProductId, canAccessElk } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function OTCElk() {
  const { user, subscriptionStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  const hasAccess = canAccessElk(currentTier);

  if (!authLoading && !hasAccess) {
    return (
      <div className="container mx-auto pt-2 pb-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <SEOHead
          title="Colorado OTC Elk Tags & Harvest Statistics | TalloTags"
          description="Colorado over-the-counter elk tag harvest statistics. View OTC unit success rates, hunter density, and harvest data by season."
          canonicalPath="/otc-elk-old"
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
        title="Colorado OTC Elk Tags & Harvest Statistics | TalloTags"
        description="Colorado over-the-counter elk tag harvest statistics. View OTC unit success rates, hunter density, and harvest data by season."
        canonicalPath="/otc-elk-old"
      />
      <div className="mb-2 px-1">
        <div>
          <h1 className="text-3xl font-bold mb-1">OTC Elk Units</h1>
          <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter elk harvest statistics by unit and season.</p>
        </div>
      </div>
      <OTCElkTable />
    </div>
  );
}
