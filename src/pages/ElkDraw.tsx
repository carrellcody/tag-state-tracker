import { ElkDrawTable } from '@/components/tables/ElkDrawTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessElk } from '@/utils/subscriptionTiers';
import { SEOHead } from '@/components/SEOHead';


export default function ElkDraw() {
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
        title="Colorado Elk Draw Odds 2026 | TalloTags"
        description="Colorado elk draw odds and preference point statistics for 2026. Analyze draw success rates by unit, season, and weapon type."
        canonicalPath="/elk"
      />
      <div className="flex items-start gap-6 mb-2">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">Elk Draw Statistics</h1>
          <p className="text-muted-foreground text-sm">Explore Colorado elk draw odds and statistics for 2026</p>
        </div>
      </div>
      <ElkDrawTable />
    </div>
  );
}
