import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      // Always fetch fresh session to avoid stale closures
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const accessToken = currentSession?.access_token;
      
      if (!accessToken) {
        console.log('[CHECK-SUB] No access token, user not authenticated');
        setSubscriptionStatus(null);
        return;
      }

      console.log('[CHECK-SUB] Invoking check-subscription function...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) {
        console.error('[CHECK-SUB] Edge function error:', error);
        // Don't clear the status on error - keep the DB-loaded value
        toast({
          title: "Subscription check failed",
          description: "Using cached subscription status",
          variant: "default",
        });
        return;
      }
      
      console.log('[CHECK-SUB] Success, updating status:', data);
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('[CHECK-SUB] Exception:', error);
      // Don't clear the status on error - keep the DB-loaded value
      toast({
        title: "Subscription check failed",
        description: error instanceof Error ? error.message : "Using cached subscription status",
        variant: "default",
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userId = session.user.id;
          // Defer all async work to avoid deadlocks in the auth callback
          setTimeout(async () => {
            try {
              console.log('[AUTH-CHANGE] Loading subscription from DB for user:', userId);
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('subscription_status, product_id, subscription_end')
                .eq('id', userId)
                .maybeSingle();
              
              if (profileError) {
                console.error('[AUTH-CHANGE] Error loading profile:', profileError);
              } else if (profile) {
                console.log('[AUTH-CHANGE] Profile loaded from DB:', profile);
                setSubscriptionStatus({
                  subscribed: profile.subscription_status === 'active',
                  product_id: profile.product_id,
                  subscription_end: profile.subscription_end,
                });
              } else {
                console.log('[AUTH-CHANGE] No profile found in DB');
              }
              
              // Then refresh from Stripe
              await checkSubscription();
            } catch (e) {
              console.error('[AUTH-CHANGE] Deferred work failed:', e);
            }
          }, 0);
        } else {
          setSubscriptionStatus(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Instantly load subscription status from DB
        console.log('[AUTH-INIT] Loading subscription from DB for user:', session.user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status, product_id, subscription_end')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('[AUTH-INIT] Error loading profile:', profileError);
        } else if (profile) {
          console.log('[AUTH-INIT] Profile loaded from DB:', profile);
          setSubscriptionStatus({
            subscribed: profile.subscription_status === 'active',
            product_id: profile.product_id,
            subscription_end: profile.subscription_end,
          });
        } else {
          console.log('[AUTH-INIT] No profile found in DB');
        }
        
        // Then refresh from Stripe
        setTimeout(() => {
          checkSubscription();
        }, 0);
      }
      
      setLoading(false);
    });

    // Auto-refresh subscription status every 60 seconds
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    // Refresh when window regains focus
    const onFocus = () => {
      checkSubscription();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const signOut = async () => {
    console.log('Starting sign out process...');
    try {
      // Race sign out with a timeout to avoid hanging
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Sign out timed out')), 3000)
      );
      await Promise.race([
        supabase.auth.signOut(),
        timeout,
      ]);

      console.log('Sign out successful (or forced), clearing state...');
    } catch (error) {
      console.error('Supabase sign out error:', error);
      // proceed anyway
    } finally {
      setUser(null);
      setSession(null);
      setSubscriptionStatus(null);

      toast({ title: 'Signed out successfully' });
      // Force reload to clear any cached state
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, subscriptionStatus, loading, signOut, checkSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
