import type { PropertyListing } from './types';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const calculateRentalYield = (monthlyRentKes: number, purchasePriceKes: number) => {
  if (!purchasePriceKes) return 0;
  return Number((((monthlyRentKes * 12) / purchasePriceKes) * 100).toFixed(1));
};

export const calculatePropertyIntelligenceScore = (listing: PropertyListing) => {
  const verification = {
    unverified: 10,
    agent_verified: 24,
    ownership_verified: 32,
    kyc_verified: 35,
  }[listing.verificationStatus];

  const demand = listing.nearbyAmenities.length * 6 + listing.amenities.length * 3;
  const aiConfidence = listing.ai.priceConfidence * 0.25;
  const fraudPenalty = listing.ai.fraudRisk * 0.35;
  const boost = listing.status === 'boosted' ? 5 : 0;

  return clamp(verification + demand + aiConfidence + boost - fraudPenalty);
};

export const getRecommendedListings = (listings: PropertyListing[]) => ({
  similarHomes: listings.filter((listing) => listing.bedrooms >= 2 && listing.priceKes < 10000000),
  trendingProperties: [...listings].sort((a, b) => b.ai.priceConfidence - a.ai.priceConfidence),
  bestValueProperties: [...listings].sort(
    (a, b) => calculatePropertyIntelligenceScore(b) - calculatePropertyIntelligenceScore(a),
  ),
});
