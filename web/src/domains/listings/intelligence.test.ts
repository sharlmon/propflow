import { describe, expect, it } from 'vitest';
import { MARKET_LISTINGS } from './data';
import { calculatePropertyIntelligenceScore, calculateRentalYield } from './intelligence';

describe('listing intelligence', () => {
  it('calculates bounded property intelligence scores', () => {
    const score = calculatePropertyIntelligenceScore(MARKET_LISTINGS[0]);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('calculates gross annual rental yield', () => {
    expect(calculateRentalYield(65000, 7800000)).toBe(10);
  });
});
