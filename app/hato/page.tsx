'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnimales } from '@/lib/api/animales';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Plus, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function HatoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: animales = [], isLoading, error } = useQuery({
    queryKey: ['animales'],
    queryFn: () => getAnimales(),
  });

  const filteredAnimales = animales.filter(animal => 
    animal.areteInterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (animal.nombre && animal.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Top Actions (simulating top bar) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-navy">Hato Ganadero</h1>
          <Link 
            href="/hato/nuevo" 
            className="flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full hover:bg-navy-light transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus size={18} />
            Nuevo Animal
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por arete (#104), nombre o raza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light bg-white text-slate-700"
            />
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-light min-w-[160px]">
              <option value="">Todas las razas</option>
              <option value="girolando">Girolando</option>
              <option value="brahman">Brahman</option>
              <option value="nelore">Nelore</option>
              <option value="holstein">Holstein</option>
            </select>
            <select className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-light min-w-[160px]">
              <option value="">Todo estado sanitario</option>
              <option value="Apto">Apto</option>
              <option value="Retiro Leche">Retiro Leche</option>
              <option value="Retiro Carne">Retiro Carne</option>
              <option value="En Revision">En Revisión</option>
            </select>
          </div>
        </div>

        {/* Table Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 whitespace-nowrap">
              <thead className="bg-white border-b border-slate-200 uppercase text-[10px] tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Foto</th>
                  <th className="px-6 py-4">Arete #</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Raza / Híbrido</th>
                  <th className="px-6 py-4">Nacimiento / Edad</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Estado Repro</th>
                  <th className="px-6 py-4 text-center">Estado Sanitario</th>
                  <th className="px-6 py-4">Potrero</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-500 font-medium">Cargando inventario...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-danger font-medium">Error al cargar los animales</td>
                  </tr>
                ) : filteredAnimales.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-500 font-medium">No se encontraron animales.</td>
                  </tr>
                ) : (
                  filteredAnimales.map((animal) => (
                    <tr key={animal.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {animal.fotoUrl ? (
                          <img src={animal.fotoUrl} alt="Foto" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 text-xl">
                            🐄
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-navy text-base">#{animal.areteInterno}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-navy">{animal.nombre || 'Sin nombre'}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{animal.sexo || 'Hembra'}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs max-w-[150px] truncate">
                        {animal.razaOtra ? `Otra (${animal.razaOtra})` : animal.raza?.nombre || 'Desconocida'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600 text-xs">{animal.fechaNacimiento ? new Date(animal.fechaNacimiento).toLocaleDateString() : 'N/A'}</div>
                        <div className="text-blue-500 text-xs font-semibold mt-0.5">4 años</div> {/* Mocked age for UI accuracy */}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {animal.categoria || 'Vaca Adulta'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {animal.sexo === 'Hembra' ? 'Preñada' : 'N/A'} {/* Mocked for UI accuracy */}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={animal.activo ? 'Apto' : 'Retiro Carne'} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {animal.potrero || 'Potrero #1'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="px-4 py-1.5 bg-navy text-white text-xs font-semibold rounded-full hover:bg-navy-light transition-colors shadow-sm">
                            Expediente
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-navy border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
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
