"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { buscarAnimalesMock } from "@/lib/mock/dashboard-mock";

/**
 * Buscador global de animales por arete/nombre.
 * // TODO: reemplazar buscarAnimalesMock por GET /animales?buscar= cuando exista MOD-01 (Danny).
 * Es funcional de verdad (filtra en vivo), no un input decorativo — ver la regla de
 * "todo botón/input visible debe funcionar" en Definicion-de-Terminado.md.
 */
export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const resultados = buscarAnimalesMock(query);
  const abierto = query.trim().length > 0;

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar animal por arete o nombre..."
        className="pl-8"
        aria-label="Buscar animal por arete o nombre"
      />
      {abierto && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-white shadow-[var(--shadow-dropdown)]">
          {resultados.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">
              Ningún animal coincide con &quot;{query}&quot;.
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {resultados.map((animal) => (
                <li
                  key={animal.animalId}
                  className="flex items-center justify-between px-3 py-1.5 text-sm hover:bg-blue-50 cursor-pointer"
                >
                  <span className="font-medium text-slate-900">{animal.nombre}</span>
                  <span className="font-mono text-xs text-slate-500">
                    {animal.arete} · {animal.categoria}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
