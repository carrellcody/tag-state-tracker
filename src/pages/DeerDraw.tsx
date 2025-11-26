import { DeerDrawTable } from '@/components/tables/DeerDrawTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getTierFromProductId, canAccessDeer } from '@/utils/subscriptionTiers';

export default function DeerDraw() {
  const {
    subscriptionStatus
  } = useAuth();
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
    <div className="container mx-auto py-6 pb-32 h-[calc(100vh-8rem)]">
      <div className="flex items-start gap-6 mb-3">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">Deer Draw Statistics</h1>
          <p className="text-muted-foreground text-sm">Data pulled from 2025 Big Game Brochure, 2025 draw odds and 2024 harvest statistics.</p>
        </div>
      </div>
      <DeerDrawTable />
    </div>
  );
}
