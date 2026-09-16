/**
 * Tipos del Dashboard + Motor de Alertas (MOD-04, responsable: Karla).
 *
 * Estas formas reflejan lo que deberían devolver los endpoints reales de los
 * demás módulos (ver 05-Modulos/MOD-04-Dashboard-Alertas.md en la bóveda):
 * - Ari (Sanitario): animales en retiro hoy, con fechas de liberación.
 * - Cristhian (Reproductivo): GET /reproductivo/proximos-eventos.
 * - Danny (Hato/Expediente): búsqueda de animales por arete/nombre + categoría.
 *
 * Mientras esos endpoints no existan, se consumen desde lib/mock/dashboard-mock.ts.
 */

export interface KpisDashboard {
  totalHatoActivo: number;
  vacasEnOrdeno: number;
  gestantesConfirmadas: number;
  alertasActivas: number;
}

/** Fila del "Semáforo de Retiro Sanitario" — animales con retiro activo hoy. */
export interface AnimalEnRetiro {
  animalId: string;
  arete: string;
  nombre: string;
  fechaLiberacionLeche: string | null;
  fechaLiberacionCarne: string | null;
  diasRestantesLeche: number | null;
  diasRestantesCarne: number | null;
}

/** Tipo de hito del calendario reproductivo. */
export type TipoEventoReproductivo = "Palpación" | "Parto";

/** Fila del feed "Calendario Reproductivo". */
export interface ProximoEventoReproductivo {
  animalId: string;
  arete: string;
  nombre: string;
  tipo: TipoEventoReproductivo;
  fecha: string;
  diasRestantes: number;
}

export type CategoriaAlerta = "retiro" | "palpacion" | "parto";

/** Ítem de la campana de notificaciones. */
export interface AlertaNotificacion {
  id: string;
  categoria: CategoriaAlerta;
  mensaje: string;
  animalId: string;
  fecha: string;
}

/** Resultado del buscador global de animales por arete/nombre. */
export interface AnimalBusqueda {
  animalId: string;
  arete: string;
  nombre: string;
  categoria: string;
}
