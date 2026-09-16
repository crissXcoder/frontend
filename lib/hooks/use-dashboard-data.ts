"use client";

import { useQuery } from "@tanstack/react-query";
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
    queryFn: () => Promise.resolve(getMockKpis()),
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
