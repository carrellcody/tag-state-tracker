import { OTCElkTable } from '@/components/tables/OTCElkTable';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function OTCElk() {
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