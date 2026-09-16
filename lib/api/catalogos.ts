import { fetchApi } from './client';

export const getCatalogosRazas = async () => {
  return fetchApi('/catalogos/razas');
};
