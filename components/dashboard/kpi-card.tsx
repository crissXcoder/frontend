import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * KPI Card — ResDigital DESIGN.md tokens:
 *   Label:  text-xs font-semibold uppercase tracking-wider text-slate-500 (H3 style)
 *   Value:  text-2xl font-black (data-forward, slate-900 or red-500 for danger)
 *   Icon:   w-5 h-5 stroke-width-2, blue-600 or red-500
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  loading,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  loading?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 pb-0">
        <CardTitle>
          {/* H3 style from DESIGN.md: text-sm font-medium uppercase tracking-wider text-slate-500 */}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </span>
        </CardTitle>
        <Icon
          className={cn(
            "size-5 stroke-2",
            tone === "danger" ? "text-red-500" : "text-blue-600",
          )}
          aria-hidden
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded-md bg-slate-100" />
        ) : (
          <span
            className={cn(
              "font-mono text-2xl font-black",
              tone === "danger" && value > 0 ? "text-red-500" : "text-slate-900",
            )}
          >
            {value}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
