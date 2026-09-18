import { describe, expect, it } from 'vitest';
import { formatearFecha, textoDiasRestantes } from '@/lib/reproductivo/fechas';

describe('formatearFecha', () => {
  it('convierte YYYY-MM-DD a DD/MM/YYYY sin corrimiento de zona horaria', () => {
    // Regresión concreta: new Date('2026-09-16') se interpreta como
    // medianoche UTC, y en Costa Rica (UTC-6) toLocaleDateString() imprimía
    // 15/09/2026 en vez de 16/09/2026.
    expect(formatearFecha('2026-09-16')).toBe('16/09/2026');
  });

  it('formatea el primer día del año sin retroceder de año', () => {
    expect(formatearFecha('2027-01-01')).toBe('01/01/2027');
  });

  it('devuelve un guion para valores ausentes', () => {
    expect(formatearFecha(undefined)).toBe('—');
    expect(formatearFecha(null)).toBe('—');
    expect(formatearFecha('')).toBe('—');
  });
});

describe('textoDiasRestantes', () => {
  it('dice "hoy" cuando faltan 0 días', () => {
    expect(textoDiasRestantes(0)).toBe('hoy');
  });

  it('dice "en N días" para un valor positivo', () => {
    expect(textoDiasRestantes(12)).toBe('en 12 días');
  });

  it('usa singular para 1 día', () => {
    expect(textoDiasRestantes(1)).toBe('en 1 día');
  });

  it('dice "vencido hace N días" para un valor negativo', () => {
    expect(textoDiasRestantes(-3)).toBe('vencido hace 3 días');
  });
});
