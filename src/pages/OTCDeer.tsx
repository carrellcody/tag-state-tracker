import { OTCDeerTable } from '@/components/tables/OTCDeerTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessDeer } from '@/utils/subscriptionTiers';

export default function OTCDeer() {
  const { subscriptionStatus } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);

  useEffect(() => {
    if (!canAccessDeer(currentTier)) {
      navigate('/subscription');
    }
  }, [currentTier, navigate]);

  if (!canAccessDeer(currentTier)) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 pb-32 h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">OTC Deer Units</h1>
        <p className="text-muted-foreground">
          Browse Colorado's over-the-counter deer harvest statistics by unit and season.
        </p>
      </div>
      <OTCDeerTable />
    </div>
  );
}
