'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAnimal } from '@/lib/api/animales';
import { 
  ChevronLeft, 
  Plus, 
  Download, 
  Activity, 
  Baby, 
  Droplet, 
  AlertTriangle,
  Pencil,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import ModalPesaje from '@/components/modals/ModalPesaje';
import ModalServicio from '@/components/modals/ModalServicio';
import ModalTratamiento from '@/components/modals/ModalTratamiento';
import ModalEditarOrigen from '@/components/modals/ModalEditarOrigen';

export default function ExpedienteAnimal() {
  const params = useParams();
  const animalId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('resumen');
  
  // Modals state
  const [isPesajeOpen, setIsPesajeOpen] = useState(false);
  const [isServicioOpen, setIsServicioOpen] = useState(false);
  const [isTratamientoOpen, setIsTratamientoOpen] = useState(false);
  const [isOrigenOpen, setIsOrigenOpen] = useState(false);

  const { data: animal, isLoading, isError } = useQuery({
    queryKey: ['animal', animalId],
    queryFn: () => getAnimal(animalId),
  });

  const tabs = [
    { id: 'resumen', label: 'Resumen General' },
    { id: 'sanitario', label: 'Historial Sanitario' },
    { id: 'reproductivo', label: 'Ciclo Reproductivo' },
    { id: 'produccion', label: 'Pesajes y Leche' },
    { id: 'documentos', label: 'Documentos' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
      </div>
    );
  }

  if (isError || !animal) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center gap-4">
        <div className="text-slate-500 font-semibold">Error al cargar el expediente del animal.</div>
        <Link href="/hato" className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold shadow-sm hover:bg-navy-light transition-colors">Volver al Hato</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/hato" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-navy transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Volver al Hato
          </Link>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 bg-white transition-colors">
              <Pencil className="w-4 h-4" />
              Editar Animal
            </button>
          </div>
        </div>

        {/* Header Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
            
            {/* Info Animal */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm relative shrink-0">
                <img
                  src={animal.fotoUrl || "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                  alt={animal.nombre}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute bottom-2 right-2 w-6 h-6 text-white rounded-full flex items-center justify-center border-2 border-white text-xs font-bold shadow-sm ${animal.sexo === 'Hembra' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                  {animal.sexo === 'Hembra' ? 'H' : 'M'}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-navy tracking-tight">
                    #{animal.areteInterno} <span className="font-semibold text-slate-700">{animal.nombre}</span>
                  </h1>
                  {animal.activo && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200">
                      ACTIVO
                    </span>
                  )}
                </div>
                
                <p className="text-slate-600 font-medium">
                  {animal.raza?.nombre || 'Raza Desconocida'} 
                </p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                  <p><span className="font-bold text-navy">{animal.pesoActualKg || 0} kg</span> <span className="text-slate-400">— Peso actual</span></p>
                  <p className="font-semibold">{animal.categoria || 'Sin Categoría'}</p>
                  <p className="font-semibold">{animal.potrero || 'Sin Potrero'}</p>
                  {animal.fechaNacimiento && (
                    <p>{new Date(animal.fechaNacimiento).toLocaleDateString()}</p>
                  )}
                  {animal.padreId && <p>Padre: <span className="font-semibold">{animal.padreId}</span></p>}
                  {animal.madreId && <p>Madre: <span className="font-semibold">{animal.madreId}</span></p>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 shrink-0">
              <button 
                onClick={() => setIsPesajeOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-navy text-white rounded-lg text-sm font-bold shadow-sm hover:bg-navy-light transition-colors"
              >
                Registrar Pesaje
              </button>
              <button 
                onClick={() => setIsServicioOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
              >
                Registrar Servicio
              </button>
              <button 
                onClick={() => setIsTratamientoOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-colors"
              >
                Aplicar Tratamiento
              </button>
              <button className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                Descargar PDF
              </button>
            </div>
          </div>

          {/* Dots Timeline */}
          <div className="bg-slate-50 border-t border-slate-200 p-3 sm:px-8 flex flex-wrap items-center gap-6 text-[13px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-slate-600">Próxima Palpación: <span className="font-bold text-orange-500">24/02/2026</span> <span className="font-bold text-slate-400">· -179 días</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-slate-600">Secado: <span className="font-bold text-purple-600">01/09/2026</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-slate-600">FPP: <span className="font-bold text-green-600">15/10/2026</span> <span className="text-slate-400">· 54 días</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-slate-600">Retiro hasta: <span className="font-bold text-red-600">24/08/2026</span> <span className="text-slate-400">· 2 días</span></span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-navy text-navy' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-2">
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              
              {/* Alerta Médica */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-red-700 tracking-wide">RETIRO SANITARIO ACTIVO</h3>
                  <p className="text-sm font-medium text-red-600">
                    Fármaco: <span className="font-bold">Cefalexina 200 Intramamaria</span> · Aplicado: <span className="font-bold">19/08/2026</span> · Liberación: <span className="font-bold">24/08/2026</span> · Días restantes: <span className="font-bold">2</span>
                  </p>
                  <p className="text-[13px] text-red-500/80">⚠ Leche no comercializable hasta la fecha de liberación.</p>
                </div>
              </div>

              {/* Pedigrí y Genealogía */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm relative">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-lg font-bold text-navy">Pedigrí y Genealogía</h3>
                    <p className="text-sm text-slate-500">Origen: <span className="font-semibold text-slate-700">{animal.origen}</span></p>
                  </div>
                  <button 
                    onClick={() => setIsOrigenOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar Origen
                  </button>
                </div>

                {/* Tree UI Mock */}
                <div className="relative max-w-4xl mx-auto flex flex-col items-center">
                  
                  {/* Central Node */}
                  <div className="bg-navy text-white rounded-xl py-3 px-6 text-center z-10 shadow-md border-2 border-white">
                    <div className="font-bold">#{animal.areteInterno} {animal.nombre}</div>
                    <div className="text-[10px] text-sky-200 mt-0.5">{animal.raza?.nombre}</div>
                  </div>

                  {/* Vertical Line */}
                  <div className="w-px h-8 bg-slate-300 my-2"></div>
                  
                  {/* Horizontal Line connecting Parents */}
                  <div className="w-[80%] h-px bg-slate-300 relative">
                    <div className="absolute top-1/2 left-0 w-px h-6 bg-slate-300"></div>
                    <div className="absolute top-1/2 right-0 w-px h-6 bg-slate-300"></div>
                  </div>

                  {/* Parents Grid */}
                  <div className="w-full flex justify-between mt-6 px-4 sm:px-10">
                    
                    {/* Padre */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 w-[45%] shadow-sm hover:border-slate-300 transition-colors">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Padre (Semental / Pajilla)</div>
                      <div className="font-bold text-navy text-base">{animal.padreId ? `Semental #${animal.padreId}` : 'No registrado'}</div>
                      <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
                      </div>
                    </div>

                    {/* Madre */}
                    <div className="bg-green-50/30 border border-green-200 rounded-xl p-4 w-[45%] shadow-sm hover:border-green-300 transition-colors">
                      <div className="text-[10px] font-bold text-green-600 uppercase tracking-wide mb-1">Madre (Vaca Matriz / Dam)</div>
                      <div className="font-bold text-navy text-base">{animal.madreId ? `Matriz #${animal.madreId}` : 'No registrada'}</div>
                      <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descendencia Registrada */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-navy">Descendencia Registrada</h3>
                  <span className="w-6 h-6 rounded bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">0</span>
                </div>
                <p className="text-sm text-slate-500 mb-8">Crías registradas en el sistema donde este animal figura como padre o madre.</p>
                
                <div className="py-10 flex flex-col items-center justify-center text-center opacity-60">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300 mb-4">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">No se registran crías ni partos para este animal.</p>
                </div>
              </div>

              {/* Línea de Tiempo Gestación */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-navy mb-8">Línea de Tiempo Gestación</h3>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
                  
                  {/* Step 1 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-400 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex justify-between items-center">
                      <div>
                        <div className="font-bold text-navy text-sm">Servicio</div>
                        <div className="text-xs text-slate-500 mt-0.5">15/01/2026</div>
                      </div>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Confirmado</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-orange-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex justify-between items-center">
                      <div>
                        <div className="font-bold text-navy text-sm">Palpación (Día 40)</div>
                        <div className="text-xs text-slate-500 mt-0.5">24/02/2026</div>
                      </div>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Confirmado</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-400 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      3
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-transparent p-4 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-600 text-sm">Secado (Mes 7)</div>
                        <div className="text-xs text-slate-400 mt-0.5">01/09/2026</div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-400 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      4
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-transparent p-4 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-600 text-sm">Aviso Parto (-15d)</div>
                        <div className="text-xs text-slate-400 mt-0.5">30/09/2026</div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-400 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      5
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-transparent p-4 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-600 text-sm">FPP (Día 280)</div>
                        <div className="text-xs text-slate-400 mt-0.5">15/10/2026</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
          
          {activeTab === 'sanitario' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-6 overflow-hidden">
              <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-lg font-bold text-navy">Historial Sanitario</h3>
                <button 
                  onClick={() => setIsTratamientoOpen(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-colors"
                >
                  + Aplicar Tratamiento
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4 pl-6 sm:pl-8">Fecha</th>
                      <th className="p-4">Fármaco</th>
                      <th className="p-4">Diagnóstico</th>
                      <th className="p-4">Dosis</th>
                      <th className="p-4">Vía</th>
                      <th className="p-4">Médico</th>
                      <th className="p-4">Retiro Leche</th>
                      <th className="p-4 pr-6 sm:pr-8">Fecha Liberación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 sm:pl-8">19/08/2026</td>
                      <td className="p-4 font-bold text-navy">Cefalexina 200 Intramamaria</td>
                      <td className="p-4">Mastitis subclínica cuarto posterior izquierdo</td>
                      <td className="p-4">20 ml</td>
                      <td className="p-4">Intramamaria</td>
                      <td className="p-4 text-sky-600">Dr. Carlos Alvarado</td>
                      <td className="p-4 font-bold text-red-600">5d</td>
                      <td className="p-4 pr-6 sm:pr-8">24/08/2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reproductivo' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-6 overflow-hidden">
              <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-lg font-bold text-navy">Ciclo Reproductivo</h3>
                <button 
                  onClick={() => setIsServicioOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
                >
                  + Registrar Servicio
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4 pl-6 sm:pl-8">Fecha</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Semental / Pajilla</th>
                      <th className="p-4">Responsable</th>
                      <th className="p-4">Potrero</th>
                      <th className="p-4">FPP</th>
                      <th className="p-4">Palpación</th>
                      <th className="p-4">Estado Palp.</th>
                      <th className="p-4 pr-6 sm:pr-8">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 sm:pl-8">15/01/2026</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Inseminación Artificial</span>
                      </td>
                      <td className="p-4">Titan (CRC-B-001)</td>
                      <td className="p-4 text-sky-600">Dr. Carlos Alvarado</td>
                      <td className="p-4">Potrero #4</td>
                      <td className="p-4 font-bold text-green-600">15/10/2026</td>
                      <td className="p-4 font-bold text-orange-500">24/02/2026</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wide">Gestante Confirmada</span>
                      </td>
                      <td className="p-4 pr-6 sm:pr-8 text-slate-400 truncate max-w-[150px]">Inseminación exit...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'produccion' && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-navy mb-4">Curva de Lactancia (L/día)</h3>
                  <div className="h-48 w-full border-b-2 border-l-2 border-slate-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">Gráfico interactivo simulado</div>
                    {/* Mock lines */}
                    <div className="absolute top-[20%] left-0 right-0 border-t border-slate-200 border-dashed"></div>
                    <div className="absolute top-[50%] left-0 right-0 border-t border-slate-200 border-dashed"></div>
                    <div className="absolute top-[80%] left-0 right-0 border-t border-slate-200 border-dashed"></div>
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-navy mb-4">Evolución de Peso (kg)</h3>
                  <div className="h-48 w-full border-b-2 border-l-2 border-slate-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">Gráfico interactivo simulado</div>
                    {/* Mock lines */}
                    <div className="absolute top-[20%] left-0 right-0 border-t border-slate-200 border-dashed"></div>
                    <div className="absolute top-[50%] left-0 right-0 border-t border-slate-200 border-dashed"></div>
                    <div className="absolute top-[80%] left-0 right-0 border-t border-slate-200 border-dashed"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy">Historial de Pesajes y Producción</h3>
                  <button 
                    onClick={() => setIsPesajeOpen(true)}
                    className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold shadow-sm hover:bg-navy-light transition-colors"
                  >
                    + Registrar Pesaje
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500 w-1/3">20/08/2026</span>
                      <span className="text-sm font-bold text-navy w-1/3">485 kg</span>
                      <span className="text-sm font-bold text-green-600 w-1/3 text-right">18.5 L</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500 w-1/3">10/08/2026</span>
                      <span className="text-sm font-bold text-navy w-1/3">480 kg</span>
                      <span className="text-sm font-bold text-green-600 w-1/3 text-right">18.5 L</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500 w-1/3">30/07/2026</span>
                      <span className="text-sm font-bold text-navy w-1/3">478 kg</span>
                      <span className="text-sm font-bold text-green-600 w-1/3 text-right">19.0 L</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              {[
                { name: "Certificado de Pedigrí", status: "No cargado" },
                { name: "Permiso Sanitario", status: "No cargado" },
                { name: "Guía de Movilización", status: "No cargado" },
                { name: "Vacuna Aftosa", status: "No cargado" },
                { name: "Prueba de Brucelosis", status: "No cargado" }
              ].map((doc, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-40">
                  <div>
                    <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <h4 className="font-bold text-navy text-sm">{doc.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{doc.status}</p>
                  </div>
                  <button className="w-full py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors mt-4">
                    Cargar Documento
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalPesaje 
        isOpen={isPesajeOpen} 
        onClose={() => setIsPesajeOpen(false)} 
        onSubmit={(data) => console.log('Pesaje guardado', data)} 
      />
      <ModalServicio 
        isOpen={isServicioOpen} 
        onClose={() => setIsServicioOpen(false)} 
        onSubmit={(data) => console.log('Servicio guardado', data)} 
      />
      <ModalTratamiento 
        isOpen={isTratamientoOpen} 
        onClose={() => setIsTratamientoOpen(false)} 
        onSubmit={(data) => console.log('Tratamiento guardado', data)} 
      />
      <ModalEditarOrigen 
        isOpen={isOrigenOpen} 
        onClose={() => setIsOrigenOpen(false)}
        animalName={`#${animal.areteInterno} — ${animal.nombre}`}
        onSubmit={(data) => console.log('Origen guardado', data)} 
      />

    </div>
  );
}
