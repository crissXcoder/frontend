import { fetchApi } from './client';

export interface Raza {
  id: string;
  nombre: string;
  dias_gestacion: number;
}

export interface Animal {
  id: string;
  tenantId: string;
  nombre?: string;
  arete_interno: string;
  arete_senasa?: string;
  sexo: string;
  raza_id: string;
  raza_otra?: string;
  fecha_nacimiento?: string;
  categoria: string;
  activo: boolean;
  madre_id?: string;
  padre_id?: string;
  foto_url?: string;
  raza?: Raza;
}

export const getRazas = async (): Promise<Raza[]> => {
  return fetchApi('/catalogos/razas');
};

export const getAnimales = async (filters: Record<string, string> = {}): Promise<Animal[]> => {
  const queryParams = new URLSearchParams(filters).toString();
  const url = queryParams ? `/animales?${queryParams}` : '/animales';
  return fetchApi(url);
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
