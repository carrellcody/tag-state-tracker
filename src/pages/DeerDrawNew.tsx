import { DeerDrawTableNew } from "@/components/tables/DeerDrawTableNew";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getTierFromProductId, canAccessDeer } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";

export default function DeerDrawNew() {
  const { subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  useEffect(() => {
    if (!loading && !canAccessDeer(currentTier)) {
      navigate("/subscription");
    }
  }, [currentTier, navigate, loading]);
  if (loading || !canAccessDeer(currentTier)) {
    return null;
  }
  return (
    <div className="container mx-auto pt-2 pb-10 h-auto lg:h-[calc(100vh-8rem)]">
      <SEOHead
        title="Colorado Mule Deer Draw Odds 2026 (New) | TalloTags"
        description="Colorado mule deer draw odds and preference point statistics for 2026 with enhanced harvest and land data."
        canonicalPath="/deerdrawnew"
      />
      <div className="mb-2 px-1">
        <div>
          <h1 className="text-3xl font-bold mb-1">Colorado Deer Draw Odds (New)</h1>
          <p className="text-muted-foreground text-sm">
            Hunt codes, dates, and valid units pulled from 2026 Big Game Brochure. Draw odds from 2025, and harvest stats from 2024.
          </p>
        </div>
      </div>
      <DeerDrawTableNew />
    </div>
  );
}
