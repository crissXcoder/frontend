'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getEstadoReproductivoTipado,
  getHistorialReproductivo,
  registrarDiagnosticoReproductivo,
  registrarPartoReproductivo,
  registrarSecadoReproductivo,
  registrarServicioReproductivo,
  type DiagnosticoInput,
  type PartoInput,
  type SecadoInput,
  type ServicioInput,
} from '../api/reproductivo';

/**
 * Hooks TanStack Query del módulo Reproductivo.
 *
 * `estado(animalId)` reusa la MISMA clave que `hato/[id]/page.tsx:80`
 * (`['estadoReproductivo', animalId]`): de ahí sale también el PDF de
 * "Historial Reproductivo" de la ficha. Si esta clave cambiara, ese `useQuery`
 * quedaría huérfano y el PDF dejaría de refrescarse al registrar un evento.
 */
export const clavesReproductivo = {
  estado: (animalId: string) => ['estadoReproductivo', animalId] as const,
  historial: (animalId: string) => ['historialReproductivo', animalId] as const,
  feed: () => ['dashboard', 'proximos-eventos-reproductivos'] as const,
};

export function useEstadoReproductivo(animalId: string, habilitado = true) {
  return useQuery({
    queryKey: clavesReproductivo.estado(animalId),
    queryFn: () => getEstadoReproductivoTipado(animalId),
    enabled: habilitado && Boolean(animalId),
  });
}

export function useHistorialReproductivo(animalId: string, habilitado = true) {
  return useQuery({
    queryKey: clavesReproductivo.historial(animalId),
    queryFn: () => getHistorialReproductivo(animalId),
    enabled: habilitado && Boolean(animalId),
  });
}

/**
 * Invalidación compartida de las cuatro mutations: estado, historial y feed
 * de toda la finca. Los tres, no solo el estado — registrar un evento cambia
 * el calendario reproductivo completo, y sin invalidar el feed el dashboard
 * queda desactualizado hasta el próximo staleTime.
 */
function useInvalidarReproductivo(animalId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: clavesReproductivo.estado(animalId) });
    queryClient.invalidateQueries({
      queryKey: clavesReproductivo.historial(animalId),
    });
    queryClient.invalidateQueries({ queryKey: clavesReproductivo.feed() });
  };
}

export function useRegistrarServicio(animalId: string) {
  const invalidar = useInvalidarReproductivo(animalId);
  return useMutation({
    mutationFn: (data: ServicioInput) =>
      registrarServicioReproductivo(animalId, data),
    onSuccess: invalidar,
  });
}

export function useRegistrarDiagnostico(animalId: string) {
  const invalidar = useInvalidarReproductivo(animalId);
  return useMutation({
    mutationFn: (data: DiagnosticoInput) =>
      registrarDiagnosticoReproductivo(animalId, data),
    onSuccess: invalidar,
  });
}

export function useRegistrarParto(animalId: string) {
  const invalidar = useInvalidarReproductivo(animalId);
  return useMutation({
    mutationFn: (data: PartoInput) => registrarPartoReproductivo(animalId, data),
    onSuccess: invalidar,
  });
}

export function useRegistrarSecado(animalId: string) {
  const invalidar = useInvalidarReproductivo(animalId);
  return useMutation({
    mutationFn: (data: SecadoInput) => registrarSecadoReproductivo(animalId, data),
    onSuccess: invalidar,
  });
}
