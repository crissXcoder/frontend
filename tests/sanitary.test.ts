import { describe, it, expect } from 'vitest';
import { calcularFechaLiberacion, formatearFecha, diasRestantesRetiro } from '../lib/api/sanitary';

describe('Sanitary date and withdrawal calculation utilities', () => {
  it('calculates projected liberation date correctly', () => {
    // 2026-09-17 + 5 days = 2026-09-22 (Cefalexina en leche)
    expect(calcularFechaLiberacion('2026-09-17', 5)).toBe('2026-09-22');
    // 2026-09-17 + 28 days = 2026-10-15 (Oxitetraciclina en carne)
    expect(calcularFechaLiberacion('2026-09-17', 28)).toBe('2026-10-15');
    // 0 days = same day
    expect(calcularFechaLiberacion('2026-09-17', 0)).toBe('2026-09-17');
  });

  it('handles month boundary crossings without timezone skew', () => {
    // 2026-01-30 + 3 days = 2026-02-02
    expect(calcularFechaLiberacion('2026-01-30', 3)).toBe('2026-02-02');
    // 2026-12-28 + 10 days = 2027-01-07
    expect(calcularFechaLiberacion('2026-12-28', 10)).toBe('2027-01-07');
  });

  it('formats dates consistently in DD/MM/YYYY format', () => {
    expect(formatearFecha('2026-09-17')).toBe('17/09/2026');
    expect(formatearFecha('2026-09-17T15:30:00.000Z')).toBe('17/09/2026');
    expect(formatearFecha('')).toBe('-');
  });

  it('calculates remaining withdrawal days accurately against a reference date', () => {
    // 5 days remaining
    expect(diasRestantesRetiro('2026-09-22', '2026-09-17')).toBe(5);
    // Already past
    expect(diasRestantesRetiro('2026-09-10', '2026-09-17')).toBe(0);
    // Same day
    expect(diasRestantesRetiro('2026-09-17', '2026-09-17')).toBe(0);
  });
});
