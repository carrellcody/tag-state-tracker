import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '@/utils/subscriptionTiers';
export default function Profile() {
  const {
    user,
    session,
    subscriptionStatus,
    checkSubscription
  } = useAuth();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [deerPoints, setDeerPoints] = useState(0);
  const [elkPoints, setElkPoints] = useState(0);
  const [antelopePoints, setAntelopePoints] = useState(0);
  const [receiveEmails, setReceiveEmails] = useState(true);
  const [promoData, setPromoData] = useState<{
    code: string | null;
    date: string | null;
  }>({
    code: null,
    date: null
  });
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      loadProfileData();
    }
  }, [user]);
  useEffect(() => {
    const fetchPromo = async () => {
      if (!user) return;
      const {
        data
      } = await supabase.from('profiles').select('promo_code_used, promo_code_applied_at').eq('id', user.id).single();
      if (data) {
        setPromoData({
          code: data.promo_code_used,
          date: data.promo_code_applied_at
        });
      }
    };
    fetchPromo();
  }, [user]);
  const loadProfileData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('deer_preference_points, elk_preference_points, antelope_preference_points, receive_emails, promo_code_used, promo_code_applied_at').eq('id', user.id).single();
      if (error) throw error;
      if (data) {
        setDeerPoints(data.deer_preference_points || 0);
        setElkPoints(data.elk_preference_points || 0);
        setAntelopePoints(data.antelope_preference_points || 0);
        setReceiveEmails(data.receive_emails ?? true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaveLoading(true);
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        deer_preference_points: deerPoints,
        elk_preference_points: elkPoints,
        antelope_preference_points: antelopePoints,
        receive_emails: receiveEmails
      }).eq('id', user.id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };
  const handleUpdateEmail = async () => {
    if (!user || email === user.email) return;
    setSaveLoading(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        email
      });
      if (error) throw error;
      toast({
        title: "Email update initiated",
        description: "Please check your new email to confirm the change"
      });
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };
  const handleManageSubscription = async () => {
    if (!session) return;
    setPortalLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
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
        variant: "destructive"
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
    return <div className="container mx-auto py-6 sm:py-8 px-2 sm:px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Sign in Required</CardTitle>
            <CardDescription className="text-sm sm:text-base">Please sign in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>;
  }
  if (loading) {
    return <div className="container mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  return <div className="container mx-auto py-6 sm:py-8 px-2 sm:px-4">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Manage your account preferences</p>
        </div>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your current plan and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan</p>
                <Badge variant={currentTier === 'pro' ? "default" : "secondary"} className="mt-1">
                  {currentTier === 'loading' ? 'Checking...' : SUBSCRIPTION_TIERS[currentTier].name}
                </Badge>
              </div>
              {subscriptionStatus?.subscribed ? (
                <Button onClick={handleManageSubscription} disabled={portalLoading} variant="outline">
                  {portalLoading ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </> : 'Manage Subscription'}
                </Button>
              ) : currentTier !== 'loading' && (
                <Button onClick={() => window.open('https://buy.stripe.com/7sYfZhaewf7795M0n83AY00', '_blank')}>
                  Subscribe Now
                </Button>
              )}
            </div>
            {subscriptionStatus?.subscription_end && <p className="text-sm text-muted-foreground">
                Renews on {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
              </p>}
          </CardContent>
        </Card>

        {/* Promo Code Section */}
        <Card>
          
          
        </Card>

        {/* Preference Points */}
        <Card>
          <CardHeader>
            <CardTitle>Preference Points</CardTitle>
            <CardDescription>Track your preference points for each species</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deer-points">Deer Preference Points</Label>
              <Input id="deer-points" type="number" min="0" value={deerPoints} onChange={e => setDeerPoints(Math.max(0, parseInt(e.target.value) || 0))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elk-points">Elk Preference Points</Label>
              <Input id="elk-points" type="number" min="0" value={elkPoints} onChange={e => setElkPoints(Math.max(0, parseInt(e.target.value) || 0))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="antelope-points">Antelope Preference Points</Label>
              <Input id="antelope-points" type="number" min="0" value={antelopePoints} onChange={e => setAntelopePoints(Math.max(0, parseInt(e.target.value) || 0))} />
            </div>
            <Button onClick={handleSaveProfile} disabled={saveLoading} className="w-full">
              {saveLoading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </> : <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Preference Points
                </>}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your email notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="receive-emails">Receive Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get updates about draw dates and new data
                </p>
              </div>
              <Switch id="receive-emails" checked={receiveEmails} onCheckedChange={setReceiveEmails} />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Email Address</CardTitle>
            <CardDescription>Update your account email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {email !== user.email && <Button onClick={handleUpdateEmail} disabled={saveLoading} variant="outline">
                {saveLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </> : 'Update Email'}
              </Button>}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSaveProfile} disabled={saveLoading} className="w-full">
          {saveLoading ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </> : <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Changes
            </>}
        </Button>
      </div>
    </div>;
}