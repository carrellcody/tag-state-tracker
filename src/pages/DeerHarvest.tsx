import { DeerHarvestTable } from '@/components/tables/DeerHarvestTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function DeerHarvest() {
  const { subscriptionStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!subscriptionStatus?.subscribed) {
      navigate('/subscription');
    }
  }, [subscriptionStatus, navigate]);

  if (!subscriptionStatus?.subscribed) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Deer Harvest Statistics</h1>
        <p className="text-muted-foreground">
          View Colorado deer harvest data by unit for 2025
        </p>
      </div>
      <DeerHarvestTable />
    </div>
  );
}
