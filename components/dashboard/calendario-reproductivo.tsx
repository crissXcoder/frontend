"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatusBadge } from "@/components/dashboard/status-badge";
import { useProximosEventosReproductivos } from "@/lib/hooks/use-dashboard-data";

/**
 * Feed "Calendario Reproductivo" — próximas palpaciones y partos cercanos,
 * consumidos de GET /reproductivo/proximos-eventos (Cristhian) cuando exista.
 */
export function CalendarioReproductivo() {
  const { data, isLoading } = useProximosEventosReproductivos();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario reproductivo</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-md bg-slate-100" />
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay palpaciones ni partos próximos en los siguientes días.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.map((evento) => (
              <li
                key={`${evento.tipo}-${evento.animalId}`}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">
                    {evento.nombre}{" "}
                    <span className="font-mono font-normal text-slate-500">
                      ({evento.arete})
                    </span>
                  </span>
                  <span className="text-xs text-slate-500">
                    {evento.tipo} —{" "}
                    <span className="font-mono">{evento.fecha}</span>
                  </span>
                </div>
                <DashboardStatusBadge
                  variant={evento.tipo === "Palpación" ? "palpacion" : "parto"}
                >
                  {evento.diasRestantes} día(s)
                </DashboardStatusBadge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
