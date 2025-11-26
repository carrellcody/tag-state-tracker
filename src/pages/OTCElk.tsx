import { OTCElkTable } from '@/components/tables/OTCElkTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessElk } from '@/utils/subscriptionTiers';

export default function OTCElk() {
  const { subscriptionStatus } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);

  useEffect(() => {
    if (!canAccessElk(currentTier)) {
      navigate('/subscription');
    }
  }, [currentTier, navigate]);

  if (!canAccessElk(currentTier)) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4 pb-32 h-[calc(100vh-4rem)]">
      <div className="flex items-start gap-6 mb-3">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">OTC Elk Units</h1>
          <p className="text-muted-foreground text-sm">Browse Colorado's over-the-counter elk harvest statistics by unit and season.</p>
        </div>
      </div>
      <OTCElkTable />
    </div>
  );
}