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
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Instantly load subscription status from DB to avoid flicker
        if (session?.user) {
          console.log('[AUTH-CHANGE] Loading subscription from DB for user:', session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_status, product_id, subscription_end')
            .eq('id', session.user.id)
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
          setTimeout(() => {
            checkSubscription();
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
    try {
      console.log('Starting sign out process...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
        throw error;
      }
      
      console.log('Sign out successful, clearing state...');
      setUser(null);
      setSession(null);
      setSubscriptionStatus(null);
      
      toast({
        title: "Signed out successfully",
      });
      
      // Force reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
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
