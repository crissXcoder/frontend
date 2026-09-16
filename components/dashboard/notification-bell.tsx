"use client";

import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAlertas } from "@/lib/hooks/use-dashboard-data";
import type { CategoriaAlerta } from "@/lib/types/dashboard";

const categoriaLabel: Record<CategoriaAlerta, string> = {
  retiro: "Retiro sanitario",
  palpacion: "Palpación",
  parto: "Parto",
};

/**
 * Campana de notificaciones — dropdown con las alertas activas, agrupables por las
 * 3 categorías del sistema (retiro, palpación, parto). Sin duplicados: cada alerta
 * tiene un id estable derivado de categoría + animal.
 */
export function NotificationBell() {
  const { data } = useAlertas();
  const total = data?.length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Notificaciones"
        >
          <Bell className="size-4" strokeWidth={1.5} />
          {total > 0 && (
            <Badge
              variant="danger"
              className="absolute -right-1.5 -top-1.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] font-mono"
            >
              {total}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="text-slate-900">
          Alertas activas ({total})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {total === 0 ? (
          <p className="px-2 py-3 text-sm text-slate-500">Sin alertas por ahora.</p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto px-1 py-1">
            {data!.map((alerta) => (
              <li key={alerta.id} className="rounded-md px-2 py-1.5 text-sm hover:bg-blue-50">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {categoriaLabel[alerta.categoria]}
                </span>
                <span className="text-slate-900">{alerta.mensaje}</span>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
