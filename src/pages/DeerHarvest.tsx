import { DeerHarvestTable } from '@/components/tables/DeerHarvestTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessDeer } from '@/utils/subscriptionTiers';
import { SEOHead } from '@/components/SEOHead';


export default function DeerHarvest() {
  const { subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);

  useEffect(() => {
    // Wait for auth to finish loading before checking access
    if (!loading && !canAccessDeer(currentTier)) {
      navigate('/subscription');
    }
  }, [currentTier, navigate, loading]);

  // Show nothing while loading or if no access
  if (loading || !canAccessDeer(currentTier)) {
    return null;
  }

  return (
    <div className="container mx-auto pt-2 pb-10 h-[calc(100vh-8rem)]">
      <SEOHead 
        title="Colorado Mule Deer Harvest Statistics 2024 | TalloTags"
        description="Colorado mule deer harvest data and success rates for 2024. View hunter density, harvest numbers, and success percentages by unit."
        canonicalPath="/deer-harvest"
      />
      <div className="flex items-start gap-6 mb-2">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">Deer Harvest Statistics</h1>
          <p className="text-muted-foreground text-sm">View Colorado deer harvest data by unit for 2025</p>
        </div>
      </div>
      <DeerHarvestTable />
    </div>
  );
}
