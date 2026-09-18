/**
 * Contrato del módulo Reproductivo (MOD-03, responsable: Cristhian).
 *
 * Espejo exacto de backend/src/reproductivo/dto/responses/*.dto.ts. Cada unión
 * de literales corresponde a un `enum` de Swagger o a un CHECK de la base, así
 * que un valor fuera de catálogo es un error de compilación acá y no un 400
 * descubierto en producción.
 *
 * Si el backend cambia el contrato, este archivo es el único lugar del frontend
 * que hay que tocar.
 */

/** Estado derivado del historial de eventos. Nunca se guarda ni se edita a mano. */
export type EstadoReproductivo = 'Vacía' | 'Servida' | 'Preñada' | 'En Secado';

/**
 * Hito del ciclo de UN animal.
 *
 * Ojo: acá el parto es `'Parto FPP'`, mientras que el feed de toda la finca lo
 * publica como `'Parto'` (ver `TipoEventoFeed`). Son dos uniones distintas a
 * propósito — no unificarlas.
 */
export type TipoHito =
  | 'Palpación'
  | 'Secado'
  | 'Aviso Parto'
  | 'Aviso Parto Urgente'
  | 'Parto FPP';

/** Tipo de hito tal como lo publica GET /reproductivo/proximos-eventos. */
export type TipoEventoFeed =
  | 'Palpación'
  | 'Secado'
  | 'Aviso Parto'
  | 'Aviso Parto Urgente'
  | 'Parto';

export type TipoEvento = 'SERVICIO' | 'DIAGNOSTICO' | 'PARTO' | 'SECADO';

/**
 * 'Celo Detectado' NO está en esta lista a propósito: es un evento informativo
 * y no genera cronograma. El DTO del backend lo dice en el mensaje de error de
 * su propio validador.
 */
export type TipoServicio = 'Inseminación Artificial' | 'Monta Natural';

export type MetodoDiagnostico = 'Palpación' | 'Ecografía' | 'PAG';
export type ResultadoDiagnostico = 'Preñada' | 'Vacía';

/** 'Aborto' cierra la preñez sin cría viable. */
export type FacilidadParto = 'Normal' | 'Distocia' | 'Cesárea' | 'Aborto';

export const TIPOS_SERVICIO: readonly TipoServicio[] = [
  'Inseminación Artificial',
  'Monta Natural',
];

export const METODOS_DIAGNOSTICO: readonly MetodoDiagnostico[] = [
  'Palpación',
  'Ecografía',
  'PAG',
];

export const RESULTADOS_DIAGNOSTICO: readonly ResultadoDiagnostico[] = [
  'Preñada',
  'Vacía',
];

export const FACILIDADES_PARTO: readonly FacilidadParto[] = [
  'Normal',
  'Distocia',
  'Cesárea',
  'Aborto',
];

// ---------------------------------------------------------------------------
// GET /animales/:id/estado-reproductivo
// ---------------------------------------------------------------------------

export interface HitoReproductivo {
  tipo: TipoHito;
  /** YYYY-MM-DD */
  fecha: string;
  /** Días desde hoy. Negativo si el hito ya venció. */
  diasRestantes: number;
  /** true solo en el aviso de FPP - 3 días. */
  urgente: boolean;
}

export interface ResumenServicioActivo {
  eventoId: string;
  fechaServicio: string;
  tipoServicio: string;
  toroOPajilla: string;
  responsable?: string | null;
  /** Fecha probable de parto. */
  fpp: string;
  /** Servicio + 40 días. */
  palpacionFecha: string;
  /** FPP - 60 días. */
  secadoFecha: string;
  /** FPP - 15 días. */
  avisoPartoFecha: string;
  /** FPP - 3 días. */
  avisoPartoUrgenteFecha: string;
  notas?: string | null;
}

export interface ResumenDiagnosticoActivo {
  eventoId: string;
  fecha: string;
  metodo: string;
  resultado: ResultadoDiagnostico;
  eventoServicioId: string;
}

export interface ResumenPartoActivo {
  eventoId: string;
  fecha: string;
  criaAnimalId?: string | null;
  facilidadParto?: string | null;
}

export interface ResumenSecadoActivo {
  eventoId: string;
  fecha: string;
}

export interface EstadoReproductivoResponse {
  animalId: string;
  areteInterno: string;
  sexo: string;
  razaNombre?: string;
  /** Días de gestación de la raza; base del cálculo de la FPP. */
  diasGestacionRaza?: number;
  estadoActual: EstadoReproductivo;
  /** Días transcurridos desde el evento que dejó al animal en este estado. */
  diasEnEstado?: number;
  servicioActivo?: ResumenServicioActivo;
  ultimoDiagnostico?: ResumenDiagnosticoActivo;
  ultimoParto?: ResumenPartoActivo;
  ultimoSecado?: ResumenSecadoActivo;
  proximosHitos?: HitoReproductivo[];
  /** Inconsistencias detectadas al derivar el estado (p. ej. evento sin detalle). */
  advertencias?: string[];
}

// ---------------------------------------------------------------------------
// GET /animales/:id/eventos-reproductivos
// ---------------------------------------------------------------------------

export interface DetalleServicio {
  tipoServicio: string;
  toroOPajilla: string;
  responsable?: string | null;
  fpp: string;
  palpacionFecha: string;
  secadoFecha: string;
  avisoPartoFecha: string;
  avisoPartoUrgenteFecha: string;
}

export interface DetalleDiagnostico {
  metodo: string;
  resultado: string;
  eventoServicioId: string;
}

export interface DetalleParto {
  eventoServicioId?: string | null;
  criaAnimalId?: string | null;
  facilidadParto?: string | null;
  observaciones?: string | null;
}

export type DetalleEvento = DetalleServicio | DetalleDiagnostico | DetalleParto;

export interface EventoHistorial {
  eventoId: string;
  tipo: TipoEvento;
  /** Cuándo ocurrió en la realidad (YYYY-MM-DD). */
  fechaEvento: string;
  /** Cuándo se escribió en el sistema. */
  fechaRegistro: string;
  usuarioId: string;
  /**
   * true si un evento posterior lo corrigió. Los revertidos vienen igual en el
   * historial: el registro es append-only y una corrección tiene que poder verse.
   */
  revertido: boolean;
  eventoCorrigeId?: string | null;
  notas?: string | null;
  /** SECADO no tiene detalle adicional, por eso puede venir nulo. */
  detalle?: DetalleEvento | null;
}

/** Estrechan `detalle` según el `tipo` del evento, que es quien manda. */
export function esDetalleServicio(
  evento: EventoHistorial,
): evento is EventoHistorial & { detalle: DetalleServicio } {
  return evento.tipo === 'SERVICIO' && evento.detalle != null;
}

export function esDetalleDiagnostico(
  evento: EventoHistorial,
): evento is EventoHistorial & { detalle: DetalleDiagnostico } {
  return evento.tipo === 'DIAGNOSTICO' && evento.detalle != null;
}

export function esDetalleParto(
  evento: EventoHistorial,
): evento is EventoHistorial & { detalle: DetalleParto } {
  return evento.tipo === 'PARTO' && evento.detalle != null;
}

// ---------------------------------------------------------------------------
// POST /animales/:id/{servicios,diagnosticos,partos,secados}
// ---------------------------------------------------------------------------

/** Lo que devuelve POST /animales/:id/servicios. */
export interface HitosReproductivos {
  fpp: string;
  palpacionFecha: string;
  secadoFecha: string;
  avisoPartoFecha: string;
  avisoPartoUrgenteFecha: string;
}
