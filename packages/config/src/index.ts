import type { ProductKey } from '@propflow/contracts';

export const designTokens = {
  background: '#F6F8FC',
  surface: '#FFFFFF',
  ink: '#07101F',
  navy: '#0D1B33',
  primaryBlue: '#2563EB',
  skyBlue: '#60A5FA',
  mutedText: '#667085',
  border: '#D7E2F2',
} as const;

export const products: Record<ProductKey, { name: string; path: string; summary: string }> = {
  ecosystem: {
    name: 'PropFlow Ecosystem',
    path: '/',
    summary: 'Connected property, rental, stay and construction workflows.',
  },
  propflow: {
    name: 'PropFlow',
    path: '/propflow/dashboard',
    summary: 'Property operations for landlords and managers.',
  },
  keja: { name: 'FindYourKeja', path: '/keja', summary: 'Verified long-term rental discovery.' },
  stay: { name: 'StayBora', path: '/stay', summary: 'Short-stay discovery, booking and host accounting.' },
  jengabora: {
    name: 'JengaBora',
    path: 'http://localhost:3001',
    summary: 'Construction milestones, evidence and payment controls.',
  },
};

export const ecosystemFeatures = {
  propflow: true,
  findYourKeja: true,
  stayBoraFoundation: true,
  jengaBoraFoundation: true,
  liveDaraja: false,
  livePayouts: false,
  tenantScore: false,
} as const;
