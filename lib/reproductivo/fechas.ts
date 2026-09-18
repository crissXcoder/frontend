/**
 * Fechas reproductivas.
 *
 * El backend siempre devuelve `YYYY-MM-DD` (columnas `date`, sin hora). Pasar
 * ese string por `new Date(...)` lo interpreta como medianoche UTC, y en Costa
 * Rica (UTC-6) `toLocaleDateString()` imprime el día anterior. Es el mismo
 * corrimiento que se corrigió en el backend (`ReproductiveCalculationService`),
 * y hoy sigue vivo en `hato/[id]/page.tsx`. Estas funciones nunca pasan por
 * `Date` para formatear: el string ya es la fecha local de la finca.
 */

const ZONA_COSTA_RICA = 'America/Costa_Rica';

/** 'YYYY-MM-DD' → '16/09/2026'. */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return '—';
  const [, anio, mes, dia] = match;
  return `${dia}/${mes}/${anio}`;
}

/** 12 → 'en 12 días' · 0 → 'hoy' · -3 → 'vencido hace 3 días'. */
export function textoDiasRestantes(dias: number): string {
  if (dias === 0) return 'hoy';
  if (dias > 0) return `en ${dias} día${dias === 1 ? '' : 's'}`;
  const vencido = Math.abs(dias);
  return `vencido hace ${vencido} día${vencido === 1 ? '' : 's'}`;
}

/**
 * 'YYYY-MM-DD' de hoy en America/Costa_Rica.
 *
 * `Intl.DateTimeFormat('en-CA', …)` ya devuelve ese formato directamente —
 * misma técnica que `hoyLocal()` en el backend.
 */
export function hoyLocal(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_COSTA_RICA }).format(
    new Date(),
  );
}
