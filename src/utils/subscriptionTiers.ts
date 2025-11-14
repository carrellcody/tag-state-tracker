// Subscription tier definitions and access control
export const SUBSCRIPTION_TIERS = {
  elk: {
    name: 'Elk Pro',
    price_id: 'price_1STOJWGlYFqs6eXAjlpQ5ANm',
    product_id: 'prod_TQEnyUNVgFVpfW',
    price: '$10/year',
    features: ['Elk Draw Statistics', 'Elk Harvest Data', 'OTC Elk Units']
  },
  deer: {
    name: 'Deer Pro',
    price_id: 'price_1STOIIGlYFqs6eXAW1BsNzCv',
    product_id: 'prod_TQElNH8VaW9Mv1',
    price: '$10/year',
    features: ['Deer Draw Statistics', 'Deer Harvest Data']
  },
  full: {
    name: 'Full Pro',
    price_id: 'price_1STOHIGlYFqs6eXAouMJSACQ',
    product_id: 'prod_TQEkp6iEC7tmTK',
    price: '$15/year',
    features: ['All Elk Features', 'All Deer Features', 'Antelope Draw & Harvest']
  }
};

export type TierKey = 'elk' | 'deer' | 'full' | 'free';

export const getTierFromProductId = (productId: string | null): TierKey => {
  if (!productId) return 'free';
  
  if (productId === SUBSCRIPTION_TIERS.elk.product_id) return 'elk';
  if (productId === SUBSCRIPTION_TIERS.deer.product_id) return 'deer';
  if (productId === SUBSCRIPTION_TIERS.full.product_id) return 'full';
  
  return 'free';
};

export const canAccessElk = (tier: TierKey): boolean => {
  return tier === 'elk' || tier === 'full';
};

export const canAccessDeer = (tier: TierKey): boolean => {
  return tier === 'deer' || tier === 'full';
};

// Antelope is always accessible
export const canAccessAntelope = (): boolean => {
  return true;
};
