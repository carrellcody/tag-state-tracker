// Subscription tier definitions and access control
export const PRO_PRODUCT_IDS = ['prod_TQEkp6iEC7tmTK', 'prod_Tlkqena8Ul3Ezu'];

export const SUBSCRIPTION_TIERS = {
  pro: {
    name: 'Pro',
    price_id: 'price_1SoDADGlYFqs6eXAyFexbyZC',
    product_id: 'prod_TQEkp6iEC7tmTK',
    price: 'First year free!',
    features: ['Full access to Elk, Deer, and Antelope statistics']
  },
  free: {
    name: 'Free Plan',
    price_id: null,
    product_id: null,
    price: 'Free',
    features: ['Antelope statistics and educational material']
  }
};

export type TierKey = 'pro' | 'free';

export const getTierFromProductId = (productId: string | null): TierKey => {
  if (!productId) return 'free';
  
  if (PRO_PRODUCT_IDS.includes(productId)) return 'pro';
  
  return 'free';
};

export const canAccessElk = (tier: TierKey): boolean => {
  return tier === 'pro';
};

export const canAccessDeer = (tier: TierKey): boolean => {
  return tier === 'pro';
};

// Antelope is always accessible
export const canAccessAntelope = (): boolean => {
  return true;
};
