import { fetchApi } from './client';

export interface Raza {
  id: string;
  nombre: string;
  dias_gestacion: number; // In DB it's dias_gestacion? Wait, catalogo_raza entity. Let's check it later.
}

export interface Animal {
  id: string;
  tenantId: string;
  nombre?: string;
  areteInterno: string;
  numeroOficialDiio?: string;
  sexo: string;
  razaId: string;
  razaOtra?: string;
  fechaNacimiento?: string;
  categoria: string;
  activo: boolean;
  madreId?: string;
  padreId?: string;
  madre?: Animal;
  padre?: Animal;
  fotoUrl?: string;
  raza?: Raza;
  
  // Nuevos campos
  origen?: 'Finca' | 'Externa';
  compradoA?: string;
  fechaCompra?: string;
  valorCompraCrc?: number;
  numeroGuia?: string;
  metodoCompra?: 'Sinpe' | 'Depósito' | 'Efectivo' | 'Combinado';
  metodosCombinados?: string[];
  referenciaPago?: string;
  
  // Campos faltantes (TS Errors)
  pesoActualKg?: number;
  potreroId?: string;
  potrero?: { id: string; nombre: string; };
  tipoBaja?: string;
  motivoBaja?: string;
  pesoFinalKg?: number;
}

export const getRazas = async (): Promise<Raza[]> => {
  return await fetchApi('/catalogos/razas');
};

export const getAnimales = async (filters: Record<string, string> = {}): Promise<Animal[]> => {
  const queryParams = new URLSearchParams(filters).toString();
  const url = queryParams ? `/animales?${queryParams}` : '/animales';
  return await fetchApi(url);
};

export const getAnimal = async (id: string): Promise<Animal> => {
  return fetchApi(`/animales/${id}`);
};

export const createAnimal = async (animalData: any) => {
  return fetchApi('/animales', {
    method: 'POST',
    body: JSON.stringify(animalData),
  });
};

export const getDocumentos = async (animalId: string) => {
  return fetchApi(`/animales/${animalId}/documentos`);
};

export const createDocumento = async (animalId: string, docData: { tipo: string, archivoUrl: string }) => {
  return fetchApi(`/animales/${animalId}/documentos`, {
    method: 'POST',
    body: JSON.stringify(docData),
  });
};

export const updateAnimal = async (id: string, animalData: any) => {
  return fetchApi(`/animales/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(animalData),
  });
};

export const darDeBajaAnimal = async (id: string, data: any) => {
  return fetchApi(`/animales/${id}/baja`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const createPesaje = async (pesaje: any): Promise<any> => {
  return fetchApi('/pesajes', {
    method: 'POST',
    body: JSON.stringify(pesaje),
  });
};

export const getPesajesByAnimal = async (animalId: string): Promise<any[]> => {
  return fetchApi(`/pesajes/animal/${animalId}`);
};

// Versión tipada (sin `any`) en lib/api/reproductivo.ts, consumida por los
// hooks de la pestaña Reproductivo. Esta se deja tal cual para no romper el
// PDF de la ficha, que sigue usándola.
export const getEstadoReproductivo = async (animalId: string): Promise<any> => {
  return fetchApi(`/animales/${animalId}/estado-reproductivo`);
};

export const createServicioReproductivo = async (animalId: string, data: any): Promise<any> => {
  return fetchApi(`/animales/${animalId}/servicios`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const createTratamiento = async (tratamiento: any): Promise<any> => {
  return fetchApi('/tratamientos', {
    method: 'POST',
    body: JSON.stringify(tratamiento),
  });
};

export const getTratamientosByAnimal = async (animalId: string): Promise<any[]> => {
  return fetchApi(`/tratamientos/animal/${animalId}`);
};

export const updateTratamiento = async (id: string, data: any) => {
  return fetchApi(`/tratamientos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const createDiagnosticoReproductivo = async (animalId: string, data: any): Promise<any> => {
  return fetchApi(`/animales/${animalId}/diagnosticos`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
