import { fetchApi } from './client';

export interface Medicamento {
  id: string;
  tenantId?: string;
  nombreComercial: string;
  principioActivo: string | null;
  viaAdministracion: string | null;
  diasRetiroLecheDefault: number;
  diasRetiroCarneDefault: number;
}

export interface Padecimiento {
  id: string;
  tenantId?: string;
  nombre: string;
  categoria: string | null;
  medicamentoSugeridoId: string | null;
  medicamentoSugerido?: Medicamento | null;
}

export interface TratamientoSanitario {
  id: string;
  tenantId?: string;
  animalId: string;
  farmaco: string;
  dosis: string;
  via: string | null;
  fecha: string; // YYYY-MM-DD
  diagnostico: string;
  veterinario: string | null;
  diasRetiro: number;
  diasRetiroLeche?: number;
  diasRetiroCarne?: number;
  documentoUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTratamientoDto {
  animalId: string;
  farmaco: string;
  dosis: string;
  via?: string;
  fecha: string; // YYYY-MM-DD
  diagnostico: string;
  veterinario?: string;
  diasRetiro: number;
  diasRetiroLeche?: number;
  diasRetiroCarne?: number;
  documentoUrl?: string | null;
}

/**
 * Obtiene el catálogo oficial de medicamentos veterinarios del tenant.
 */
export async function getMedicamentos(): Promise<Medicamento[]> {
  return await fetchApi('/catalogos/medicamentos');
}

/**
 * Obtiene el catálogo oficial de padecimientos/diagnósticos del tenant.
 */
export async function getPadecimientos(): Promise<Padecimiento[]> {
  return await fetchApi('/catalogos/padecimientos');
}

/**
 * Obtiene el historial de tratamientos aplicados a un animal, ordenados descendentemente por fecha.
 */
export async function getTratamientosByAnimal(animalId: string): Promise<TratamientoSanitario[]> {
  return await fetchApi(`/tratamientos/animal/${animalId}`);
}

/**
 * Registra un nuevo tratamiento sanitario veterinario.
 */
export async function createTratamiento(payload: CreateTratamientoDto): Promise<TratamientoSanitario> {
  return await fetchApi('/tratamientos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Descompone una cadena de fecha YYYY-MM-DD en componentes numéricos independientes de zona horaria.
 */
export function parseDateComponents(dateStr: string): { year: number; month: number; day: number } {
  const cleanStr = (dateStr || '').split('T')[0];
  const parts = cleanStr.split('-').map(Number);
  return {
    year: parts[0] || 0,
    month: (parts[1] || 1) - 1,
    day: parts[2] || 1,
  };
}

/**
 * Calcula la fecha proyectada de liberación sumando días calendario a la fecha base sin desfase horario.
 */
export function calcularFechaLiberacion(fechaIso: string, dias: number): string {
  if (!fechaIso || dias == null || isNaN(dias) || dias < 0) return '';
  const { year, month, day } = parseDateComponents(fechaIso);
  if (!year) return '';

  const d = new Date(Date.UTC(year, month, day + dias));
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formatea una fecha YYYY-MM-DD en formato visible DD/MM/YYYY.
 */
export function formatearFecha(dateStr: string): string {
  if (!dateStr) return '-';
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return dateStr;
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Calcula los días restantes de retiro contra la fecha actual o una fecha de referencia.
 */
export function diasRestantesRetiro(fechaLiberacionIso: string, fechaReferencia?: string): number {
  if (!fechaLiberacionIso) return 0;
  const lib = parseDateComponents(fechaLiberacionIso);
  const now = fechaReferencia ? parseDateComponents(fechaReferencia) : (() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  })();

  const libTime = Date.UTC(lib.year, lib.month, lib.day);
  const nowTime = Date.UTC(now.year, now.month, now.day);
  const diffDays = Math.ceil((libTime - nowTime) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
