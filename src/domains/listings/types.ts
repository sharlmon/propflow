export type ListingStatus = 'draft' | 'under_review' | 'published' | 'boosted' | 'sold' | 'rented';
export type VerificationStatus = 'unverified' | 'agent_verified' | 'ownership_verified' | 'kyc_verified';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PricingHistoryPoint {
  date: string;
  priceKes: number;
}

export interface PropertyListing {
  id: string;
  title: string;
  slug: string;
  county: string;
  subcounty: string;
  neighborhood: string;
  address: string;
  geo: GeoPoint;
  priceKes: number;
  bedrooms: number;
  bathrooms: number;
  sizeSqm: number;
  status: ListingStatus;
  verificationStatus: VerificationStatus;
  amenities: string[];
  nearbyAmenities: string[];
  media: {
    coverImage: string;
    virtualTourUrl?: string;
    videoUrl?: string;
    floorPlanUrl?: string;
  };
  seo: {
    title: string;
    description: string;
    canonicalPath: string;
  };
  ai: {
    summary: string;
    seoDescription: string;
    priceConfidence: number;
    fraudRisk: number;
  };
  pricingHistory: PricingHistoryPoint[];
  badges: string[];
  boostedUntil?: string;
  createdAt: string;
}

export interface ListingFilters {
  query: string;
  county: string;
  maxPriceKes?: number;
  bedrooms?: number;
  verifiedOnly: boolean;
}
