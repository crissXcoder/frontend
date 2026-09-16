"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Provider raíz de TanStack Query. Stack-Tecnico-Oficial.md exige TanStack Query para todo
 * fetching de datos del servidor (nunca fetch + useEffect manual) — este es el punto único
 * donde se crea el QueryClient para toda la app.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
