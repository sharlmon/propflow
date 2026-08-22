export const featureFlags = {
  aiPropertyAssistant: false,
  marketplaceSearch: true,
  investorIntelligence: false,
  adminModeration: false,
  mapIntelligence: false,
  payments: true,
  pwaOfflineMode: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export const isFeatureEnabled = (flag: FeatureFlag) => featureFlags[flag];
