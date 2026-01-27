import { ElkHarvestTable } from '@/components/tables/ElkHarvestTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessElk } from '@/utils/subscriptionTiers';
import { SEOHead } from '@/components/SEOHead';


export default function ElkHarvest() {
  const { subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);

  useEffect(() => {
    // Wait for auth to finish loading before checking access
    if (!loading && !canAccessElk(currentTier)) {
      navigate('/subscription');
    }
  }, [currentTier, navigate, loading]);

  // Show nothing while loading or if no access
  if (loading || !canAccessElk(currentTier)) {
    return null;
  }

  return (
    <div className="container mx-auto pt-2 pb-10 h-[calc(100vh-8rem)]">
      <SEOHead 
        title="Colorado Elk Harvest Statistics 2024 | TalloTags"
        description="Colorado elk harvest data and success rates for 2024. View hunter density, harvest numbers, and success percentages by unit."
        canonicalPath="/elk-harvest"
      />
      <div className="flex items-start gap-6 mb-2">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">Elk Harvest Statistics</h1>
          <p className="text-muted-foreground text-sm">View Colorado elk harvest data by unit for 2025</p>
        </div>
      </div>
      <ElkHarvestTable />
    </div>
  );
}
