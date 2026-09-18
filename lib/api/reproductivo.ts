import { fetchApi } from './client';
import type {
  EstadoReproductivoResponse,
  EventoHistorial,
  FacilidadParto,
  HitosReproductivos,
  MetodoDiagnostico,
  ResultadoDiagnostico,
  TipoEventoFeed,
  TipoServicio,
} from '../reproductivo/tipos';

/**
 * Capa de API del módulo Reproductivo (MOD-03).
 *
 * Sigue la convención de lib/api/animales.ts (funciones async sueltas sobre
 * fetchApi), con una diferencia deliberada: nada acá es `any`, ni de entrada
 * ni de salida. `getEstadoReproductivo` ya existía en animales.ts devolviendo
 * `Promise<any>` — se deja ahí porque el PDF de la ficha la usa, pero los
 * hooks nuevos consumen la versión tipada de este archivo.
 */

export interface ProximoEvento {
  animalId: string;
  arete: string;
  nombre: string;
  tipo: TipoEventoFeed;
  fecha: string;
  diasRestantes: number;
  urgente: boolean;
}

export interface ServicioInput {
  fechaEvento: string;
  tipoServicio: TipoServicio;
  toroOPajilla: string;
  responsable?: string;
  notas?: string;
}

export interface DiagnosticoInput {
  fechaEvento: string;
  eventoServicioId: string;
  metodo: MetodoDiagnostico;
  resultado: ResultadoDiagnostico;
  notas?: string;
}

export interface PartoInput {
  fechaEvento: string;
  eventoServicioId?: string;
  criaAnimalId?: string;
  facilidadParto?: FacilidadParto;
  observaciones?: string;
}

export interface SecadoInput {
  fechaEvento: string;
  notas?: string;
}

export const getEstadoReproductivoTipado = async (
  animalId: string,
): Promise<EstadoReproductivoResponse> => {
  return fetchApi(`/animales/${animalId}/estado-reproductivo`);
};

export const getHistorialReproductivo = async (
  animalId: string,
): Promise<EventoHistorial[]> => {
  return fetchApi(`/animales/${animalId}/eventos-reproductivos`);
};

export const getProximosEventos = async (
  diasVentana?: number,
): Promise<ProximoEvento[]> => {
  const query = diasVentana ? `?diasVentana=${diasVentana}` : '';
  return fetchApi(`/reproductivo/proximos-eventos${query}`);
};

export const registrarServicioReproductivo = async (
  animalId: string,
  data: ServicioInput,
): Promise<HitosReproductivos> => {
  return fetchApi(`/animales/${animalId}/servicios`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const registrarDiagnosticoReproductivo = async (
  animalId: string,
  data: DiagnosticoInput,
): Promise<unknown> => {
  return fetchApi(`/animales/${animalId}/diagnosticos`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const registrarPartoReproductivo = async (
  animalId: string,
  data: PartoInput,
): Promise<unknown> => {
  return fetchApi(`/animales/${animalId}/partos`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const registrarSecadoReproductivo = async (
  animalId: string,
  data: SecadoInput,
): Promise<unknown> => {
  return fetchApi(`/animales/${animalId}/secados`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
