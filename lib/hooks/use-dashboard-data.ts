"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnimales } from "@/lib/api/animales";
import {
  getMockAlertas,
  getMockAnimalesEnRetiro,
  getMockKpis,
  getMockProximosEventosReproductivos,
} from "@/lib/mock/dashboard-mock";

/**
 * Hooks de datos del Dashboard, uno por pieza de UI.
 *
 * Hoy leen del mock (lib/mock/dashboard-mock.ts). Cuando cada módulo exponga su endpoint real,
 * el único cambio necesario es la `queryFn` — el resto de la UI no se toca:
 *   - useAnimalesEnRetiro: queryFn -> GET a lo que exponga Ari (MOD-02, "animales en retiro hoy")
 *   - useProximosEventosReproductivos: queryFn -> GET /reproductivo/proximos-eventos (Cristhian)
 *   - useKpisDashboard: se recalcula solo, ya que depende de los dos anteriores + Hato (Danny)
 */

const dashboardKeys = {
  kpis: ["dashboard", "kpis"] as const,
  retiros: ["dashboard", "animales-en-retiro"] as const,
  proximosEventos: ["dashboard", "proximos-eventos-reproductivos"] as const,
  alertas: ["dashboard", "alertas"] as const,
};

export function useKpisDashboard() {
  return useQuery({
    queryKey: dashboardKeys.kpis,
    queryFn: async () => {
      const mockKpis = getMockKpis();
      try {
        const animales = await getAnimales();
        const retiros = getMockAnimalesEnRetiro();
        
        const activos = animales.filter(a => a.activo);
        const totalHatoActivo = activos.length;
        
        // B11: Vacas en Ordeño (Hembra, categoría Vaca en Ordeño, SIN retiro de leche)
        const vacasEnOrdeno = activos.filter(a => {
          if (a.categoria !== 'Vaca en Ordeño' || a.sexo !== 'Hembra') return false;
          // Verificar si tiene retiro de leche activo en los mocks
          const tieneRetiro = retiros.some(r => r.animalId === a.id && r.diasRestantesLeche !== null);
          return !tieneRetiro;
        }).length;
        
        // B4: Gestantes Confirmadas (solo con diagnóstico positivo)
        // Ya que aún no hay endpoint real reproductivo, seguimos usando el mock
        const gestantesConfirmadas = mockKpis.gestantesConfirmadas;
        
        return {
          totalHatoActivo,
          vacasEnOrdeno,
          gestantesConfirmadas,
          alertasActivas: mockKpis.alertasActivas
        };
      } catch (error) {
        console.warn("Failed to fetch real animales for KPIs, falling back to mock", error);
        return mockKpis;
      }
    },
  });
}

export function useAnimalesEnRetiro() {
  return useQuery({
    queryKey: dashboardKeys.retiros,
    queryFn: () => Promise.resolve(getMockAnimalesEnRetiro()),
  });
}

export function useProximosEventosReproductivos() {
  return useQuery({
    queryKey: dashboardKeys.proximosEventos,
    queryFn: () => Promise.resolve(getMockProximosEventosReproductivos()),
  });
}

export function useAlertas() {
  return useQuery({
    queryKey: dashboardKeys.alertas,
    queryFn: () => Promise.resolve(getMockAlertas()),
  });
}
