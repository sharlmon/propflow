import { env } from './environment';

const enabledInDev = env.environment !== 'production';

export const featureFlags = {
  aiPropertyAssistant: true,
  marketplaceSearch: true,
  investorIntelligence: true,
  adminModeration: enabledInDev,
  mapIntelligence: enabledInDev,
  payments: true,
  pwaOfflineMode: enabledInDev,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export const isFeatureEnabled = (flag: FeatureFlag) => featureFlags[flag];
