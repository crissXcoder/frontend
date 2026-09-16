"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardStatusBadge } from "@/components/dashboard/status-badge";
import { useAnimalesEnRetiro } from "@/lib/hooks/use-dashboard-data";

/**
 * Tabla "Semáforo de Retiro Sanitario" — todos los animales con retiro activo hoy,
 * con cuenta regresiva de días. Se calcula al vuelo (nunca hay una tabla `alerta`
 * persistida, ver Patron-Evento-Estado-Alerta.md) — cuando pasa la fecha de liberación,
 * el animal desaparece solo de esta lista en la siguiente consulta.
 */
export function SemaforoSanitario() {
  const { data, isLoading } = useAnimalesEnRetiro();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semáforo de retiro sanitario</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-md bg-muted" />
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ningún animal en retiro sanitario hoy.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Arete</TableHead>
                <TableHead>Retiro leche</TableHead>
                <TableHead>Retiro carne</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((animal) => (
                <TableRow key={animal.animalId}>
                  <TableCell className="font-medium">{animal.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{animal.arete}</TableCell>
                  <TableCell>
                    {animal.diasRestantesLeche !== null ? (
                      <DashboardStatusBadge
                        variant={animal.diasRestantesLeche <= 2 ? "por-vencer" : "retiro"}
                      >
                        {animal.diasRestantesLeche} día(s)
                      </DashboardStatusBadge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {animal.diasRestantesCarne !== null ? (
                      <DashboardStatusBadge
                        variant={animal.diasRestantesCarne <= 2 ? "por-vencer" : "retiro"}
                      >
                        {animal.diasRestantesCarne} día(s)
                      </DashboardStatusBadge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
