/**
 * Datos de prueba para el Dashboard (MOD-04, Karla).
 *
 * // TODO: reemplazar cuando exista MOD-01 (Danny) — listado de animales con `categoria` real.
 * // TODO: reemplazar cuando exista MOD-02 (Ari) — endpoint/query de "animales en retiro hoy".
 * // TODO: reemplazar cuando exista MOD-03 (Cristhian) — GET /reproductivo/proximos-eventos.
 *
 * Por qué esto NO es solo "3 números inventados": los KPIs del wireframe de referencia tenían
 * dos bugs de negocio (ver Auditoria-Wireframe-Figma-Make.md en la bóveda):
 *   - B11: "Vacas en Ordeño" se definía como "hembra sin retiro", sin mirar la categoría real.
 *   - B4:  "Gestantes Confirmadas" contaba cualquier animal con un servicio registrado,
 *          aunque no tuviera diagnóstico de preñez.
 * Para no heredar esos bugs ni en el mock, los KPIs de acá se calculan filtrando un hato de
 * prueba con las mismas reglas que va a usar la consulta real — así el día que se conecten los
 * endpoints reales, la lógica de la UI no cambia, solo cambia de dónde vienen los datos.
 */

import type {
  AlertaNotificacion,
  AnimalBusqueda,
  AnimalEnRetiro,
  KpisDashboard,
  ProximoEventoReproductivo,
} from "@/lib/types/dashboard";

function hoy(): Date {
  // Nunca una fecha fija en el código (bug B8 del wireframe) — siempre "ahora" real.
  return new Date();
}

function diasEntre(fechaObjetivo: string): number {
  const msPorDia = 1000 * 60 * 60 * 24;
  const objetivo = new Date(fechaObjetivo);
  const inicioHoy = new Date(hoy().toDateString());
  return Math.round((objetivo.getTime() - inicioHoy.getTime()) / msPorDia);
}

function fechaEnDias(dias: number): string {
  const fecha = hoy();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

/** Hato de prueba — mezcla de categorías, igual que un hato real de 20-200 cabezas. */
const animalesMock = [
  { id: "a1", arete: "#104", nombre: "Canela", categoria: "Vaca en Ordeño", sexo: "Hembra" },
  { id: "a2", arete: "#087", nombre: "Estrella", categoria: "Vaca en Ordeño", sexo: "Hembra" },
  { id: "a3", arete: "#112", nombre: "Paloma", categoria: "Vaca en Ordeño", sexo: "Hembra" },
  { id: "a4", arete: "#045", nombre: "Luna", categoria: "Vaca Seca", sexo: "Hembra" },
  { id: "a5", arete: "#201", nombre: "Bonita", categoria: "Vaquilla de Reemplazo", sexo: "Hembra" },
  { id: "a6", arete: "#019", nombre: "Titán", categoria: "Semental/Reproductor", sexo: "Macho" },
  { id: "a7", arete: "#233", nombre: "Ternerita", categoria: "Ternera", sexo: "Hembra" },
] as const;

/** Retiros sanitarios activos — vendrán de Ari (MOD-02) vía "está en retiro hoy". */
const retirosMock: Record<string, { leche: number | null; carne: number | null }> = {
  a2: { leche: 6, carne: 13 }, // Estrella: tratamiento con Ivermectina, todavía en retiro
  a4: { leche: 2, carne: 9 }, // Luna: retiro por vencer en 2 días
};

/** Diagnósticos de preñez vigentes — vendrán de Cristhian (MOD-03). */
const gestantesVigentesMock = new Set(["a1", "a3"]);

/** Próximos hitos reproductivos — vendrán de GET /reproductivo/proximos-eventos. */
const proximosEventosMock: ProximoEventoReproductivo[] = [
  {
    animalId: "a5",
    arete: "#201",
    nombre: "Bonita",
    tipo: "Palpación",
    fecha: fechaEnDias(4),
    diasRestantes: 4,
  },
  {
    animalId: "a1",
    arete: "#104",
    nombre: "Canela",
    tipo: "Parto",
    fecha: fechaEnDias(11),
    diasRestantes: 11,
  },
  {
    animalId: "a3",
    arete: "#112",
    nombre: "Paloma",
    tipo: "Parto",
    fecha: fechaEnDias(27),
    diasRestantes: 27,
  },
];

export function getMockAnimalesEnRetiro(): AnimalEnRetiro[] {
  return Object.entries(retirosMock).map(([animalId, retiro]) => {
    const animal = animalesMock.find((a) => a.id === animalId)!;
    return {
      animalId,
      arete: animal.arete,
      nombre: animal.nombre,
      fechaLiberacionLeche: retiro.leche !== null ? fechaEnDias(retiro.leche) : null,
      fechaLiberacionCarne: retiro.carne !== null ? fechaEnDias(retiro.carne) : null,
      diasRestantesLeche: retiro.leche,
      diasRestantesCarne: retiro.carne,
    };
  });
}

export function getMockProximosEventosReproductivos(): ProximoEventoReproductivo[] {
  return proximosEventosMock;
}

export function getMockKpis(): KpisDashboard {
  const animalesActivos = animalesMock.length;

  // "Vacas en Ordeño" real: categoría correcta Y sin retiro de leche activo (corrige bug B11).
  const vacasEnOrdeno = animalesMock.filter(
    (a) => a.categoria === "Vaca en Ordeño" && !retirosMock[a.id]?.leche,
  ).length;

  // "Gestantes Confirmadas" real: solo con diagnóstico positivo vigente (corrige bug B4).
  const gestantesConfirmadas = gestantesVigentesMock.size;

  const alertasActivas =
    getMockAnimalesEnRetiro().length + getMockProximosEventosReproductivos().length;

  return {
    totalHatoActivo: animalesActivos,
    vacasEnOrdeno,
    gestantesConfirmadas,
    alertasActivas,
  };
}

export function getMockAlertas(): AlertaNotificacion[] {
  const alertasRetiro: AlertaNotificacion[] = getMockAnimalesEnRetiro().map((r) => ({
    id: `retiro-${r.animalId}`,
    categoria: "retiro",
    animalId: r.animalId,
    fecha: r.fechaLiberacionLeche ?? r.fechaLiberacionCarne ?? fechaEnDias(0),
    mensaje:
      r.diasRestantesLeche !== null
        ? `${r.nombre} (${r.arete}) sigue en retiro de leche — vence en ${r.diasRestantesLeche} día(s).`
        : `${r.nombre} (${r.arete}) sigue en retiro de carne — vence en ${r.diasRestantesCarne} día(s).`,
  }));

  const alertasReproductivas: AlertaNotificacion[] = getMockProximosEventosReproductivos().map(
    (e) => ({
      id: `${e.tipo.toLowerCase()}-${e.animalId}`,
      categoria: e.tipo === "Palpación" ? "palpacion" : "parto",
      animalId: e.animalId,
      fecha: e.fecha,
      mensaje: `${e.nombre} (${e.arete}): ${e.tipo.toLowerCase()} en ${e.diasRestantes} día(s).`,
    }),
  );

  return [...alertasRetiro, ...alertasReproductivas].sort(
    (a, b) => diasEntre(a.fecha) - diasEntre(b.fecha),
  );
}

export function buscarAnimalesMock(query: string): AnimalBusqueda[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return animalesMock
    .filter((a) => a.arete.toLowerCase().includes(q) || a.nombre.toLowerCase().includes(q))
    .map((a) => ({ animalId: a.id, arete: a.arete, nombre: a.nombre, categoria: a.categoria }));
}
