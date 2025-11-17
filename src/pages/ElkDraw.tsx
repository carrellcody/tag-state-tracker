import { ElkDrawTable } from '@/components/tables/ElkDrawTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessElk } from '@/utils/subscriptionTiers';


export default function ElkDraw() {
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
    <div className="container mx-auto py-6 h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Elk Draw Statistics</h1>
        <p className="text-muted-foreground">
          Explore Colorado elk draw odds and statistics for 2025
        </p>
      </div>
      <ElkDrawTable />
    </div>
  );
}
