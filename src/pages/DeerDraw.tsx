import { DeerDrawTable } from "@/components/tables/DeerDrawTable";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getTierFromProductId, canAccessDeer } from "@/utils/subscriptionTiers";
import { SEOHead } from '@/components/SEOHead';

export default function DeerDraw() {
  const { subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  useEffect(() => {
    // Wait for auth to finish loading before checking access
    if (!loading && !canAccessDeer(currentTier)) {
      navigate("/subscription");
    }
  }, [currentTier, navigate, loading]);
  // Show nothing while loading or if no access
  if (loading || !canAccessDeer(currentTier)) {
    return null;
  }
  return (
    <div className="container mx-auto pt-2 pb-10 h-[calc(100vh-8rem)]">
      <SEOHead 
        title="Colorado Mule Deer Draw Odds 2026 | TalloTags"
        description="Colorado mule deer draw odds and preference point statistics for 2026. Analyze draw success rates by unit, season, and weapon type."
        canonicalPath="/deer"
      />
      <div className="flex items-start gap-6 mb-2">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">Deer Draw Statistics</h1>
          <p className="text-muted-foreground text-sm">
            Hunt codes, dates, and valid units pulled from 2026 Big Game Brochure. Draw odds from 2025, and harvest stats from 2024.
          </p>
        </div>
      </div>
      <DeerDrawTable />
    </div>
  );
}
