"use client";

import { AlertTriangle, Baby, Milk, Users } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useKpisDashboard } from "@/lib/hooks/use-dashboard-data";

/**
 * Los 4 KPIs principales del Dashboard (ver MOD-04-Dashboard-Alertas.md).
 * "Vacas en Ordeño" y "Gestantes Confirmadas" ya usan la definición corregida
 * (categoría real / diagnóstico positivo vigente), no la del wireframe (bugs B11 y B4).
 */
export function KpiRow() {
  const { data, isLoading } = useKpisDashboard();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total de hato activo"
        value={data?.totalHatoActivo ?? 0}
        icon={Users}
        loading={isLoading}
      />
      <KpiCard
        label="Vacas en ordeño"
        value={data?.vacasEnOrdeno ?? 0}
        icon={Milk}
        loading={isLoading}
      />
      <KpiCard
        label="Gestantes confirmadas"
        value={data?.gestantesConfirmadas ?? 0}
        icon={Baby}
        loading={isLoading}
      />
      <KpiCard
        label="Alertas activas"
        value={data?.alertasActivas ?? 0}
        icon={AlertTriangle}
        loading={isLoading}
        tone="danger"
      />
    </div>
  );
}
