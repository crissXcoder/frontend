import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Badge de estado semántico del Dashboard — DESIGN.md §5.5 + tokens de globals.css.
 * Cada estado de negocio tiene un color fijo mapeado a los AgTech Status Colors.
 * Nunca usar hex directamente en el componente.
 *
 *   retiro     → Red   (Critical: animal en retiro de leche/carne)
 *   por-vencer → Amber (Warning: retiro a punto de vencer ≤ 2 días)
 *   palpacion  → Blue  (Info: próxima palpación)
 *   parto      → Amber (Warning: parto próximo)
 */
export type DashboardStatusVariant = "retiro" | "por-vencer" | "palpacion" | "parto";

const variantMap: Record<DashboardStatusVariant, "danger" | "warning" | "male"> = {
  retiro: "danger",
  "por-vencer": "warning",
  palpacion: "male",
  parto: "warning",
};

export function DashboardStatusBadge({
  variant,
  children,
  className,
}: {
  variant: DashboardStatusVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant={variantMap[variant]}
      className={cn("uppercase tracking-wide font-mono text-[10px]", className)}
    >
      {children}
    </Badge>
  );
}
