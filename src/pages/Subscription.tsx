import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { SUBSCRIPTION_TIERS } from '@/utils/subscriptionTiers';

export default function Subscription() {
  const { user, session, subscriptionStatus, checkSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!session) {
      navigate('/auth');
      return;
    }

    window.open('https://buy.stripe.com/7sYfZhaewf7795M0n83AY00', '_blank');
    toast({
      title: "Checkout opened",
      description: "Complete your purchase in the new tab",
    });
  };

  const handleManageSubscription = async () => {
    if (!session) return;

    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const getUserTier = () => {
    if (subscriptionStatus === null) return 'loading';
    if (!subscriptionStatus?.subscribed) return 'free';
    const productId = subscriptionStatus.product_id;
    return Object.entries(SUBSCRIPTION_TIERS).find(([_, tier]) => tier.product_id === productId)?.[0] || 'free';
  };

  const currentTier = getUserTier() as 'pro' | 'free' | 'loading';

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>Please sign in to manage your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground mt-2">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Plan */}
          <Card className={currentTier === 'free' ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{SUBSCRIPTION_TIERS.free.name}</CardTitle>
                {currentTier === 'loading' ? (
                  <Badge variant="outline">Checking...</Badge>
                ) : currentTier === 'free' && <Badge>Your Plan</Badge>}
              </div>
              <CardDescription>Basic access to antelope data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">{SUBSCRIPTION_TIERS.free.price}</div>
              <ul className="space-y-2">
                {SUBSCRIPTION_TIERS.free.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {currentTier === 'free' && (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={currentTier === 'pro' ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{SUBSCRIPTION_TIERS.pro.name}</CardTitle>
                {currentTier === 'loading' ? (
                  <Badge variant="outline">Checking...</Badge>
                ) : currentTier === 'pro' && <Badge>Your Plan</Badge>}
              </div>
              <CardDescription>Complete hunting data access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">{SUBSCRIPTION_TIERS.pro.price}</div>
              <ul className="space-y-2">
                {SUBSCRIPTION_TIERS.pro.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {currentTier === 'loading' ? (
                <Button disabled className="w-full">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Checking subscription...
                </Button>
              ) : currentTier === 'pro' ? (
                <Button 
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="w-full"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Manage Subscription'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleCheckout}
                  className="w-full"
                >
                  Subscribe Now
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Current Plan: <Badge variant={currentTier === 'pro' ? "default" : "secondary"}>
                    {SUBSCRIPTION_TIERS[currentTier].name}
                  </Badge>
                </p>
              </div>
              <Button onClick={checkSubscription} variant="outline" size="sm">
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
