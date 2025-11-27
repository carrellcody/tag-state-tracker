import { OTCElkTable } from '@/components/tables/OTCElkTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessElk } from '@/utils/subscriptionTiers';

export default function OTCElk() {
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
    <div className="container mx-auto pt-2 px-4 pb-4 h-[calc(100vh-4rem)]">
      <div className="flex items-start gap-6 mb-2">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">OTC Elk Units</h1>
          <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter elk harvest statistics by unit and season.</p>
        </div>
      </div>
      <OTCElkTable />
    </div>
  );
}