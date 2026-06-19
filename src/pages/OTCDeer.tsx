import { OTCDeerTable } from "@/components/tables/OTCDeerTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTierFromProductId, canAccessDeer } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function OTCDeer() {
  const { user, subscriptionStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  const hasAccess = canAccessDeer(currentTier);

  if (!authLoading && !hasAccess) {
    return (
      <div className="container mx-auto pt-2 pb-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <SEOHead
          title="Colorado OTC Deer Tags & Harvest Statistics | TalloTags"
          description="Colorado over-the-counter mule deer tag harvest statistics. View OTC unit success rates, hunter density, and harvest data by season."
          canonicalPath="/otc-deer-old"
        />
        <h1 className="text-3xl font-bold mb-3">OTC Deer Units</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Access to OTC Deer statistics requires a Pro membership.
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
        title="Colorado OTC Deer Tags & Harvest Statistics | TalloTags"
        description="Colorado over-the-counter mule deer tag harvest statistics. View OTC unit success rates, hunter density, and harvest data by season."
        canonicalPath="/otc-deer-old"
      />
      <div className="mb-2 px-1">
        <div>
          <h1 className="text-3xl font-bold mb-1">OTC Deer Units</h1>
          <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter deer harvest statistics by unit and season.</p>
        </div>
      </div>
      <OTCDeerTable />
    </div>
  );
}
