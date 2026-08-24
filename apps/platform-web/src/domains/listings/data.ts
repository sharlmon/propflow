import type { PropertyListing } from './types';

export const MARKET_LISTINGS: PropertyListing[] = [
  {
    id: 'ml-001',
    title: 'Solar-ready 3-bedroom apartment in Kilimani',
    slug: 'solar-ready-3-bedroom-kilimani',
    county: 'Nairobi',
    subcounty: 'Dagoretti North',
    neighborhood: 'Kilimani',
    address: 'Kindaruma Road, Kilimani',
    geo: { lat: -1.2921, lng: 36.7819 },
    priceKes: 7800000,
    bedrooms: 3,
    bathrooms: 2,
    sizeSqm: 118,
    status: 'boosted',
    verificationStatus: 'ownership_verified',
    amenities: ['Backup power', 'Borehole', 'Fiber internet', 'Lift', 'CCTV'],
    nearbyAmenities: ['Yaya Centre', 'French School', 'Nairobi Women Hospital'],
    media: {
      coverImage:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      virtualTourUrl: 'https://propflow.local/tours/kilimani-3br',
    },
    seo: {
      title: '3 Bedroom Apartment for Sale in Kilimani under KSh 8M',
      description: 'Verified Kilimani apartment near schools, hospitals, shopping, and fiber internet.',
      canonicalPath: '/properties/solar-ready-3-bedroom-kilimani',
    },
    ai: {
      summary:
        'Best-fit home for urban families prioritizing schools, resilient utilities, and commute flexibility.',
      seoDescription:
        'Explore a verified 3-bedroom Kilimani apartment with backup power, borehole water, and strong rental demand.',
      priceConfidence: 86,
      fraudRisk: 8,
    },
    pricingHistory: [
      { date: '2025-10-01', priceKes: 8200000 },
      { date: '2026-01-15', priceKes: 7950000 },
      { date: '2026-04-20', priceKes: 7800000 },
    ],
    badges: ['Verified ownership', 'Best value', 'School proximity'],
    boostedUntil: '2026-06-01',
    createdAt: '2026-04-20',
  },
  {
    id: 'ml-002',
    title: 'High-yield studio block near JKUAT',
    slug: 'high-yield-studio-block-juja',
    county: 'Kiambu',
    subcounty: 'Juja',
    neighborhood: 'JKUAT Gate B',
    address: 'Juja Farm Road',
    geo: { lat: -1.1027, lng: 37.0144 },
    priceKes: 36500000,
    bedrooms: 24,
    bathrooms: 24,
    sizeSqm: 760,
    status: 'published',
    verificationStatus: 'agent_verified',
    amenities: ['Prepaid meters', 'Water storage', 'Caretaker unit', 'CCTV'],
    nearbyAmenities: ['JKUAT', 'Thika Superhighway', 'Juja City Mall'],
    media: {
      coverImage:
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
    },
    seo: {
      title: 'Student Rental Block for Sale in Juja near JKUAT',
      description: 'Income-generating student housing asset with strong occupancy near JKUAT.',
      canonicalPath: '/properties/high-yield-studio-block-juja',
    },
    ai: {
      summary:
        'Investor-oriented asset with durable demand from JKUAT students and room for rent optimization.',
      seoDescription:
        'Review a Juja student housing block near JKUAT with prepaid utilities and high occupancy potential.',
      priceConfidence: 78,
      fraudRisk: 14,
    },
    pricingHistory: [
      { date: '2025-08-10', priceKes: 38500000 },
      { date: '2026-02-12', priceKes: 36500000 },
    ],
    badges: ['Investor pick', 'High occupancy'],
    createdAt: '2026-02-12',
  },
  {
    id: 'ml-003',
    title: 'Quarter-acre serviced plot in Naivasha',
    slug: 'quarter-acre-serviced-plot-naivasha',
    county: 'Nakuru',
    subcounty: 'Naivasha',
    neighborhood: 'Moi South Lake',
    address: 'Moi South Lake Road',
    geo: { lat: -0.7409, lng: 36.4356 },
    priceKes: 4200000,
    bedrooms: 0,
    bathrooms: 0,
    sizeSqm: 1012,
    status: 'under_review',
    verificationStatus: 'unverified',
    amenities: ['Electricity nearby', 'Murram access road', 'Lake corridor'],
    nearbyAmenities: ['Moi South Lake Road', 'Naivasha town', 'Hospitality corridor'],
    media: {
      coverImage:
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    },
    seo: {
      title: 'Serviced Plot for Sale in Naivasha',
      description: 'Quarter-acre land opportunity near Naivasha hospitality and tourism corridor.',
      canonicalPath: '/properties/quarter-acre-serviced-plot-naivasha',
    },
    ai: {
      summary: 'Land-banking opportunity with tourism corridor upside, pending ownership verification.',
      seoDescription:
        'Compare Naivasha land for sale near Moi South Lake Road with infrastructure and tourism growth signals.',
      priceConfidence: 71,
      fraudRisk: 32,
    },
    pricingHistory: [
      { date: '2026-03-08', priceKes: 4500000 },
      { date: '2026-04-30', priceKes: 4200000 },
    ],
    badges: ['Verification pending', 'Tourism corridor'],
    createdAt: '2026-03-08',
  },
];
