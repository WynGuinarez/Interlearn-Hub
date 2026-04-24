import { describe, expect, it } from 'vitest';
import { getPayrollPeriod } from './payrollPeriod';

describe('getPayrollPeriod', () => {
  it('returns first half period for early month dates', () => {
    const period = getPayrollPeriod('2026-04-10');
    expect(period.start).toBe('2026-03-26');
    expect(period.end).toBe('2026-04-10');
  });

  it('returns second half period for late month dates', () => {
    const period = getPayrollPeriod('2026-04-20');
    expect(period.start).toBe('2026-04-11');
    expect(period.end).toBe('2026-04-25');
  });
});
