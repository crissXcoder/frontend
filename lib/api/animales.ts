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

export const createServicio = async (servicio: any): Promise<any> => {
  return fetchApi('/servicios', {
    method: 'POST',
    body: JSON.stringify(servicio),
  });
};

export const getServiciosByAnimal = async (animalId: string): Promise<any[]> => {
  return fetchApi(`/servicios/animal/${animalId}`);
};

export const updateServicio = async (id: string, data: any) => {
  return fetchApi(`/servicios/${id}`, {
    method: 'PATCH',
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
