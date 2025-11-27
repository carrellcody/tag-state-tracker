import { ElkHarvestTable } from '@/components/tables/ElkHarvestTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessElk } from '@/utils/subscriptionTiers';


export default function ElkHarvest() {
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
    <div className="container mx-auto pt-2 pb-4 h-[calc(100vh-8rem)]">
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
