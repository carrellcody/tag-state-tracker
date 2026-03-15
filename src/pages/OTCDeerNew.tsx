import { OTCDeerTableNew } from '@/components/tables/OTCDeerTableNew';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessDeer } from '@/utils/subscriptionTiers';
import { SEOHead } from '@/components/SEOHead';

export default function OTCDeerNew() {
  const { subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);

  useEffect(() => {
    if (!loading && !canAccessDeer(currentTier)) {
      navigate('/subscription');
    }
  }, [currentTier, navigate, loading]);

  if (loading || !canAccessDeer(currentTier)) {
    return null;
  }

  return (
    <div className="container mx-auto pt-2 px-4 pb-4 h-[calc(100vh-4rem)]">
      <SEOHead
        title="Colorado OTC Deer Units (New) | TalloTags"
        description="Colorado over-the-counter mule deer unit data with DAU population estimates and harvest statistics."
        canonicalPath="/OTCDeerNew"
      />
      <div className="mb-2 px-1">
        <div>
          <h1 className="text-3xl font-bold mb-1">OTC Deer Units (New)</h1>
          <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter deer unit data by DAU population, harvest, and land statistics.</p>
        </div>
      </div>
      <OTCDeerTableNew />
    </div>
  );
}
