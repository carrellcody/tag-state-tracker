import { DeerHarvestTable } from '@/components/tables/DeerHarvestTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessDeer } from '@/utils/subscriptionTiers';


export default function DeerHarvest() {
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
    <div className="container mx-auto pt-2 pb-4 h-[calc(100vh-8rem)]">
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
