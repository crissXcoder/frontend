'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRazas, createAnimal, Raza } from '@/lib/api/animales';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function NuevoAnimalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    arete_interno: '',
    nombre: '',
    sexo: 'Hembra',
    categoria: 'Ternera',
    raza_id: '',
    raza_otra: '',
    fecha_nacimiento: '',
  });

  const { data: razas = [], isLoading: loadingRazas } = useQuery({
    queryKey: ['razas'],
    queryFn: () => getRazas(),
  });

  const createMutation = useMutation({
    mutationFn: createAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      router.push('/hato');
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      activo: true,
    });
  };

  const isRazaOtra = razas.find(r => r.id === formData.raza_id)?.nombre.toLowerCase() === 'otra';

  return (
    <main className="min-h-screen bg-surface p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <Link href="/hato" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-navy">Registrar Nuevo Animal</h1>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-navy">Arete Interno *</label>
                <input 
                  required
                  type="text" 
                  name="arete_interno"
                  value={formData.arete_interno}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                  placeholder="Ej. 101"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-navy">Nombre (Opcional)</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                  placeholder="Ej. Lola"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-navy">Sexo *</label>
                <select
                  required
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light bg-white"
                >
                  <option value="Hembra">Hembra</option>
                  <option value="Macho">Macho</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-navy">Categoría *</label>
                <select
                  required
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light bg-white"
                >
                  <option value="Ternera">Ternera</option>
                  <option value="Novilla">Novilla</option>
                  <option value="Vaca en Ordeño">Vaca en Ordeño</option>
                  <option value="Vaca Seca">Vaca Seca</option>
                  <option value="Torete">Torete</option>
                  <option value="Semental/Reproductor">Semental/Reproductor</option>
                  <option value="Novillo de Engorde">Novillo de Engorde</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-navy">Raza *</label>
                <select
                  required
                  name="raza_id"
                  value={formData.raza_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light bg-white"
                >
                  <option value="">Seleccione una raza...</option>
                  {razas.map(raza => (
                    <option key={raza.id} value={raza.id}>{raza.nombre}</option>
                  ))}
                </select>
              </div>

              {isRazaOtra && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-navy">Especifique la Raza *</label>
                  <input 
                    required
                    type="text" 
                    name="raza_otra"
                    value={formData.raza_otra}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                    placeholder="Escriba la raza"
                  />
                </div>
              )}
            </div>

            {/* TODO: Supabase Storage Integration for foto_url would go here */}
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 text-2xl">
                 🐄
               </div>
               <div>
                  <h3 className="text-sm font-bold text-navy">Foto del Animal</h3>
                  <p className="text-xs text-slate-500 mb-2">La subida de fotos estará disponible cuando se conecte el Storage.</p>
                  <button type="button" disabled className="px-3 py-1.5 bg-slate-200 text-slate-500 rounded-md text-xs font-medium cursor-not-allowed">
                    Subir Foto
                  </button>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Link 
                href="/hato"
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Cancelar
              </Link>
              <button 
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center gap-2 bg-navy text-white px-6 py-2 rounded-md hover:bg-navy-light transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Save size={16} />
                {createMutation.isPending ? 'Guardando...' : 'Guardar Animal'}
              </button>
            </div>
            
          </form>
        </section>
      </div>
    </main>
  );
}
