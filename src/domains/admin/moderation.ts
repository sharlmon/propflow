import { MARKET_LISTINGS } from '../listings/data';

export const moderationQueue = MARKET_LISTINGS.filter(
  (listing) => listing.status === 'under_review' || listing.ai.fraudRisk > 25,
).map((listing) => ({
  id: listing.id,
  title: listing.title,
  reason: listing.ai.fraudRisk > 25 ? 'Elevated fraud risk' : 'Pending publication review',
  risk: listing.ai.fraudRisk,
}));
