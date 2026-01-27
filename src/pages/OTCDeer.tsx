import { OTCDeerTable } from '@/components/tables/OTCDeerTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessDeer } from '@/utils/subscriptionTiers';
import { SEOHead } from '@/components/SEOHead';

export default function OTCDeer() {
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
    <div className="container mx-auto pt-2 px-4 pb-4 h-[calc(100vh-4rem)]">
      <SEOHead 
        title="Colorado OTC Deer Tags & Harvest Statistics | TalloTags"
        description="Colorado over-the-counter mule deer tag harvest statistics. View OTC unit success rates, hunter density, and harvest data by season."
        canonicalPath="/otc-deer"
      />
      <div className="flex items-start gap-6 mb-2">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">OTC Deer Units</h1>
          <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter deer harvest statistics by unit and season.</p>
        </div>
      </div>
      <OTCDeerTable />
    </div>
  );
}
