import { OTCElkTableNew } from "@/components/tables/OTCElkTableNew";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getTierFromProductId, canAccessElk } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function OTCElkNew() {
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
    <div className="container mx-auto pt-2 px-4 pb-4 h-[calc(100vh-4rem)]">
      <SEOHead
        title="Colorado OTC Elk Units (New) | TalloTags"
        description="Colorado over-the-counter elk unit data with DAU population estimates and harvest statistics."
        canonicalPath="/OTCElkNew"
      />
      <div className="mb-2 px-1">
        <h1 className="text-3xl font-bold mb-1">OTC Elk Units (New)</h1>
        <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter elk unit data by DAU population, harvest, and land statistics.</p>
      </div>
      <OTCElkTableNew />
    </div>
  );
}
