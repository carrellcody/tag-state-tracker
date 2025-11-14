import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SUBSCRIPTION_TIERS = {
  elk: {
    name: 'Elk Pro',
    price_id: 'price_1STOJWGlYFqs6eXAjlpQ5ANm',
    product_id: 'prod_TQEnyUNVgFVpfW',
    price: '$15/year',
    features: ['Elk Draw Statistics', 'Elk Harvest Data', 'OTC Elk Units']
  },
  deer: {
    name: 'Deer Pro',
    price_id: 'price_1STOIIGlYFqs6eXAW1BsNzCv',
    product_id: 'prod_TQElNH8VaW9Mv1',
    price: '$15/year',
    features: ['Deer Draw Statistics', 'Deer Harvest Data']
  },
  full: {
    name: 'Full Pro',
    price_id: 'price_1STOHIGlYFqs6eXAouMJSACQ',
    product_id: 'prod_TQEkp6iEC7tmTK',
    price: '$25/year',
    features: ['All Elk Features', 'All Deer Features', 'Antelope Draw & Harvest']
  }
};

export default function Subscription() {
  const { user, session, subscriptionStatus, checkSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('list-active-coupons');
      if (error) throw error;
      setActiveCoupons(data?.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleCheckout = async (priceId: string) => {
    if (!session) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { price_id: priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Checkout opened",
          description: "Complete your purchase in the new tab",
        });
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    if (!subscriptionStatus?.subscribed) return null;
    const productId = subscriptionStatus.product_id;
    return Object.entries(SUBSCRIPTION_TIERS).find(([_, tier]) => tier.product_id === productId)?.[0];
  };

  const currentTier = getUserTier();

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

        <div className="grid md:grid-cols-3 gap-6">
          {/* Elk Pro */}
          <Card className={currentTier === 'elk' ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{SUBSCRIPTION_TIERS.elk.name}</CardTitle>
                {currentTier === 'elk' && <Badge>Your Plan</Badge>}
              </div>
              <CardDescription>Elk hunting data access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">{SUBSCRIPTION_TIERS.elk.price}</div>
              <ul className="space-y-2">
                {SUBSCRIPTION_TIERS.elk.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {currentTier === 'elk' ? (
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
                  onClick={() => handleCheckout(SUBSCRIPTION_TIERS.elk.price_id)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Deer Pro */}
          <Card className={currentTier === 'deer' ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{SUBSCRIPTION_TIERS.deer.name}</CardTitle>
                {currentTier === 'deer' && <Badge>Your Plan</Badge>}
              </div>
              <CardDescription>Deer hunting data access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">{SUBSCRIPTION_TIERS.deer.price}</div>
              <ul className="space-y-2">
                {SUBSCRIPTION_TIERS.deer.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {currentTier === 'deer' ? (
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
                  onClick={() => handleCheckout(SUBSCRIPTION_TIERS.deer.price_id)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Full Pro */}
          <Card className={currentTier === 'full' ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{SUBSCRIPTION_TIERS.full.name}</CardTitle>
                {currentTier === 'full' && <Badge>Your Plan</Badge>}
              </div>
              <CardDescription>Complete hunting data access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">{SUBSCRIPTION_TIERS.full.price}</div>
              <ul className="space-y-2">
                {SUBSCRIPTION_TIERS.full.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {currentTier === 'full' ? (
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
                  onClick={() => handleCheckout(SUBSCRIPTION_TIERS.full.price_id)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
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
                  Current Plan: <Badge variant={currentTier ? "default" : "secondary"}>
                    {currentTier ? SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS].name : "Free"}
                  </Badge>
                </p>
              </div>
              <Button onClick={checkSubscription} variant="outline" size="sm">
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Active Promo Codes
            </CardTitle>
            <CardDescription>Use these codes at checkout to get a discount</CardDescription>
          </CardHeader>
          <CardContent>
            {couponsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : activeCoupons.length > 0 ? (
              <div className="space-y-3">
                {activeCoupons.map((coupon) => (
                  <Alert key={coupon.id}>
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-lg">{coupon.code}</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {coupon.percent_off 
                            ? `${coupon.percent_off}% off` 
                            : `$${(coupon.amount_off / 100).toFixed(2)} off`}
                          {coupon.duration === 'forever' && ' forever'}
                          {coupon.duration === 'repeating' && ` for ${coupon.duration_in_months} months`}
                        </p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active promo codes at this time
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
