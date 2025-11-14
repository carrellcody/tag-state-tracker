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
    <div className="container mx-auto py-8 px-4 h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">OTC Elk Units</h1>
        <p className="text-muted-foreground">
          Browse Colorado's over-the-counter elk harvest statistics by unit and season.
        </p>
      </div>
      <OTCElkTable />
    </div>
  );
}