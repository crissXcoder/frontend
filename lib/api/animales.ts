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

export const createAnimal = async (animal: Partial<Animal>): Promise<Animal> => {
  return fetchApi('/animales', {
    method: 'POST',
    body: JSON.stringify(animal),
  });
};

export const updateAnimal = async (id: string, animal: Partial<Animal>): Promise<Animal> => {
  return fetchApi(`/animales/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(animal),
  });
};

export const darDeBajaAnimal = async (id: string, bajaData: any): Promise<Animal> => {
  return fetchApi(`/animales/${id}/baja`, {
    method: 'POST',
    body: JSON.stringify(bajaData),
  });
};
