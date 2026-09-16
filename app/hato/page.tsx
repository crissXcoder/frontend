'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnimales } from '@/lib/api/animales';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

export default function HatoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: animales = [], isLoading, error } = useQuery({
    queryKey: ['animales'],
    queryFn: () => getAnimales(),
  });

  const filteredAnimales = animales.filter(animal => 
    animal.arete_interno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (animal.nombre && animal.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-surface p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-xl font-bold text-navy">Hato / Expediente</h1>
          <Link 
            href="/hato/nuevo" 
            className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-md hover:bg-navy-light transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Nuevo Animal
          </Link>
        </header>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Buscar por arete o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-navy">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-semibold">Arete / Nombre</th>
                  <th className="px-6 py-3 font-semibold">Foto</th>
                  <th className="px-6 py-3 font-semibold">Categoría</th>
                  <th className="px-6 py-3 font-semibold">Raza</th>
                  <th className="px-6 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">Cargando datos...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-danger">Error al cargar los animales</td>
                  </tr>
                ) : filteredAnimales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">No se encontraron animales.</td>
                  </tr>
                ) : (
                  filteredAnimales.map((animal) => (
                    <tr key={animal.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold">{animal.arete_interno}</div>
                        {animal.nombre && <div className="text-slate-500 text-xs">{animal.nombre}</div>}
                      </td>
                      <td className="px-6 py-4">
                        {animal.foto_url ? (
                          <img src={animal.foto_url} alt="Foto" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                            🐄
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">{animal.categoria}</td>
                      <td className="px-6 py-4">
                        {animal.raza_otra ? `Otra (${animal.raza_otra})` : animal.raza?.nombre || 'Desconocida'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={animal.activo ? 'Activo' : 'Inactivo'} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
