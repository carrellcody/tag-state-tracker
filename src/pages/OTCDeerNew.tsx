import { OTCDeerTableNew } from "@/components/tables/OTCDeerTableNew";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTierFromProductId, canAccessDeer } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function OTCDeerNew() {
  const { user, subscriptionStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  const hasAccess = canAccessDeer(currentTier);

  if (!authLoading && !hasAccess) {
    return (
      <div className="container mx-auto pt-2 pb-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <SEOHead
          title="Colorado OTC Deer Units | TalloTags"
          description="Colorado over-the-counter mule deer unit data with DAU population estimates and harvest statistics."
          canonicalPath="/otc-deer"
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
        title="Colorado OTC Deer Units | TalloTags"
        description="Colorado over-the-counter mule deer unit data with DAU population estimates and harvest statistics."
        canonicalPath="/otc-deer"
      />
      <div className="mb-2 px-1">
        <div>
          <h1 className="text-3xl font-bold mb-1">OTC Deer Units</h1>
          <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter deer unit data by DAU population, harvest, and land statistics. All harvest and DAU statistics are from 2025 data</p>
        </div>
      </div>
      <OTCDeerTableNew />
    </div>
  );
}
