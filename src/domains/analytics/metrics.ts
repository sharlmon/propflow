import { MARKET_LISTINGS } from '../listings/data';
import { calculatePropertyIntelligenceScore } from '../listings/intelligence';

export const platformMetrics = {
  activeListings: MARKET_LISTINGS.length,
  verifiedListings: MARKET_LISTINGS.filter((listing) => listing.verificationStatus !== 'unverified').length,
  averageIntelligenceScore: Math.round(
    MARKET_LISTINGS.reduce((total, listing) => total + calculatePropertyIntelligenceScore(listing), 0) /
      MARKET_LISTINGS.length,
  ),
  monetizationReadiness: 72,
};
