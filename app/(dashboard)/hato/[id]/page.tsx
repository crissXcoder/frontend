'use client';

import { useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnimal, createPesaje, createTratamiento, updateTratamiento, getPesajesByAnimal, getTratamientosByAnimal, updateAnimal, getDocumentos, createDocumento, getEstadoReproductivo, createServicioReproductivo } from '@/lib/api/animales';
import { createClient } from '@/lib/supabase/client';
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
  Loader2,
  FileText,
  Camera
} from 'lucide-react';
import ModalPesaje from '@/components/modals/ModalPesaje';
import ModalServicio from '@/components/modals/ModalServicio';
import ModalTratamiento from '@/components/modals/ModalTratamiento';
import ModalEditarOrigen from '@/components/modals/ModalEditarOrigen';
import ModalDocumento from '@/components/modals/ModalDocumento';
import { ModalEditarAnimal } from '@/components/modals/ModalEditarAnimal';
import { ModalDarBaja } from '@/components/modals/ModalDarBaja';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function ExpedienteAnimal() {
  const params = useParams();
  const animalId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('resumen');
  
  // Modals state
  const [isPesajeOpen, setIsPesajeOpen] = useState(false);
  const [isServicioOpen, setIsServicioOpen] = useState(false);
  const [isTratamientoOpen, setIsTratamientoOpen] = useState(false);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<any | null>(null);
  const [isOrigenOpen, setIsOrigenOpen] = useState(false);
  const [isDocumentoOpen, setIsDocumentoOpen] = useState(false);
  const [isEditarAnimalOpen, setIsEditarAnimalOpen] = useState(false);
  const [isBajaOpen, setIsBajaOpen] = useState(false);
  
  // Documentos state
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const supabase = createClient();

  const queryClient = useQueryClient();

  const { data: animal, isLoading, isError } = useQuery({
    queryKey: ['animal', animalId],
    queryFn: () => getAnimal(animalId),
  });

  const { data: pesajes } = useQuery({
    queryKey: ['pesajes', animalId],
    queryFn: () => getPesajesByAnimal(animalId),
  });

  const { data: estadoReproductivo } = useQuery({
    queryKey: ['estadoReproductivo', animalId],
    queryFn: () => getEstadoReproductivo(animalId),
  });

  const { data: tratamientos } = useQuery({
    queryKey: ['tratamientos', animalId],
    queryFn: () => getTratamientosByAnimal(animalId),
  });

  const { data: documentosDocumentos } = useQuery({
    queryKey: ['documentos', animalId],
    queryFn: () => getDocumentos(animalId),
  });

  const pesajeMutation = useMutation({
    mutationFn: (data: any) => createPesaje({ 
      ...data, 
      pesoActualKg: data.peso_actual ? parseFloat(data.peso_actual) : null,
      lecheMananaL: data.leche_manana ? parseFloat(data.leche_manana) : null,
      lecheTardeL: data.leche_tarde ? parseFloat(data.leche_tarde) : null,
      animalId 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pesajes', animalId] });
      setIsPesajeOpen(false);
    }
  });

  const servicioMutation = useMutation({
    mutationFn: (data: any) => createServicioReproductivo(animalId, { 
      ...data,
      tipoServicio: data.tipo_servicio,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estadoReproductivo', animalId] });
      setIsServicioOpen(false);
    }
  });

  const tratamientoMutation = useMutation({
    mutationFn: (data: any) => createTratamiento({ 
      ...data,
      diasRetiro: data.dias_retiro ? parseInt(data.dias_retiro) : 0,
      animalId 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tratamientos', animalId] });
      setIsTratamientoOpen(false);
      setTratamientoSeleccionado(null);
    }
  });

  const updateTratamientoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateTratamiento(id, {
      ...data,
      diasRetiro: data.dias_retiro ? parseInt(data.dias_retiro) : 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tratamientos', animalId] });
      setIsTratamientoOpen(false);
      setTratamientoSeleccionado(null);
    }
  });

  const updateAnimalMutation = useMutation({
    mutationFn: (data: any) => updateAnimal(animalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      setIsOrigenOpen(false);
    }
  });

  const documentoMutation = useMutation({
    mutationFn: (data: { tipo: string, archivoUrl: string }) => createDocumento(animalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos', animalId] });
    }
  });

  const handleDocumentSubmit = async ({ tipo, file }: { tipo: string; file: File }) => {
    try {
      setIsUploadingDoc(true);

      // Subir archivo a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${animalId}-${tipo.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('animal_docs')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('animal_docs')
        .getPublicUrl(fileName);

      // Guardar en la base de datos
      await documentoMutation.mutateAsync({
        tipo,
        archivoUrl: publicUrl
      });
      
      setIsDocumentoOpen(false);

    } catch (error) {
      console.error('Error al subir documento:', error);
      alert('Hubo un error al subir el documento. Por favor, intente de nuevo.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!animal) return;

    const doc = new jsPDF();
    let yPos = 20;

    // Título
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(`Expediente Animal: #${animal.areteInterno} ${animal.nombre || ''}`, 14, yPos);
    yPos += 10;

    // Info General
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Raza: ${animal.raza?.nombre || 'N/A'}`, 14, yPos);
    doc.text(`Categoría: ${animal.categoria || 'N/A'}`, 80, yPos);
    doc.text(`Sexo: ${animal.sexo || 'N/A'}`, 150, yPos);
    yPos += 8;
    
    doc.text(`Peso Actual: ${animal.pesoActualKg || 0} kg`, 14, yPos);
    doc.text(`Potrero: ${animal.potrero?.nombre || 'N/A'}`, 80, yPos);
    if (animal.fechaNacimiento) {
      doc.text(`Fecha Nac.: ${new Date(animal.fechaNacimiento).toLocaleDateString()}`, 150, yPos);
    }
    yPos += 15;

    // Sección: Pesajes y Leche
    if (pesajes && pesajes.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Historial de Producción y Pesajes', 14, yPos);
      yPos += 5;
      
      const tableData = pesajes.map((p: any) => {
        const totalL = (Number(p.lecheMananaL) || 0) + (Number(p.lecheTardeL) || 0);
        return [
          new Date(p.fecha).toLocaleDateString(),
          p.pesoActualKg ? `${p.pesoActualKg} kg` : '-',
          totalL > 0 ? `${totalL.toFixed(1)} L` : '-'
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Peso (kg)', 'Leche Total (L)']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [15, 23, 42] }
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Historial de Producción y Pesajes', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Sin registros', 14, yPos);
      yPos += 15;
    }

    // Sección: Sanitario
    if (tratamientos && tratamientos.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Historial Sanitario', 14, yPos);
      yPos += 5;
      
      const tableData = tratamientos.map((t: any) => [
        t.fecha ? new Date(t.fecha).toLocaleDateString() : '-',
        t.diagnostico || '-',
        t.farmaco || '-',
        t.dosis || '-',
        t.veterinario || '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Enfermedad', 'Medicamento', 'Dosis', 'Responsable']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [15, 23, 42] }
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;
    } else {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Historial Sanitario', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Sin registros', 14, yPos);
      yPos += 15;
    }

    // Sección: Reproductivo
    if (servicios && servicios.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Historial Reproductivo', 14, yPos);
      yPos += 5;
      
      const tableData = servicios.map((s: any) => {
        return [
          s.fecha ? new Date(s.fecha).toLocaleDateString() : '-',
          s.tipoServicio || '-',
          s.semental || '-',
          s.estadoPalpacion || 'Pendiente'
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Tipo', 'Toro/Semen', 'Estado']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [15, 23, 42] }
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;
    } else {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Historial Reproductivo', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Sin registros', 14, yPos);
      yPos += 15;
    }

    // Descargar
    doc.save(`Expediente_${animal.areteInterno}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const isMacho = animal?.sexo === 'Macho';

  const tabs = [
    { id: 'resumen', label: 'Resumen General' },
    { id: 'sanitario', label: 'Historial Sanitario' },
    ...(!isMacho ? [{ id: 'reproductivo', label: 'Ciclo Reproductivo' }] : []),
    { id: 'produccion', label: isMacho ? 'Historial de Pesajes' : 'Pesajes y Leche' },
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

  // Buscamos si hay un retiro sanitario activo en los tratamientos reales
  let alertaRetiro = null;
  const tratamientoConRetiro = tratamientos?.find((t) => {
    if (!t.diasRetiro || t.diasRetiro <= 0) return false;
    const fechaAplicacion = new Date(t.fecha);
    const fechaLiberacion = new Date(fechaAplicacion.getTime() + t.diasRetiro * 24 * 60 * 60 * 1000);
    const hoy = new Date();
    // Normalizar a inicio del día
    hoy.setHours(0, 0, 0, 0);
    fechaLiberacion.setHours(0, 0, 0, 0);
    return hoy < fechaLiberacion;
  });

  if (tratamientoConRetiro) {
    const fechaAplicacion = new Date(tratamientoConRetiro.fecha);
    const fechaLiberacion = new Date(fechaAplicacion.getTime() + tratamientoConRetiro.diasRetiro * 24 * 60 * 60 * 1000);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaLiberacion.setHours(0, 0, 0, 0);
    const diasRestantes = Math.ceil((fechaLiberacion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    alertaRetiro = {
      farmaco: tratamientoConRetiro.farmaco || 'Desconocido',
      aplicado: fechaAplicacion.toLocaleDateString(),
      liberacion: fechaLiberacion.toLocaleDateString(),
      diasRestantes
    };
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
            {animal.activo && (
              <button 
                onClick={() => setIsBajaOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 bg-white transition-colors"
              >
                Dar de Baja
              </button>
            )}
            <button 
              onClick={() => setIsEditarAnimalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 bg-white transition-colors"
            >
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
                {animal.fotoUrl ? (
                  <img
                    src={animal.fotoUrl}
                    alt={`Vaca ${animal.areteInterno}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-2">
                    <Camera size={32} />
                    <span className="text-sm font-bold">Sin foto</span>
                  </div>
                )}
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
                  <p className="font-semibold">{animal.potrero?.nombre || 'Sin Potrero'}</p>
                  {animal.fechaNacimiento && (
                    <p>{new Date(animal.fechaNacimiento).toLocaleDateString()}</p>
                  )}
                  {animal.padreId && <p>Padre: <span className="font-semibold">{animal.padreId}</span></p>}
                  {animal.madreId && (
                    <p>Madre: <span className="font-semibold text-primary">{animal.madre?.areteInterno ? `#${animal.madre.areteInterno} ${animal.madre.nombre || ''}` : animal.madreId}</span></p>
                  )}
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
              {!isMacho && (
                <button 
                  onClick={() => setIsServicioOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Registrar Servicio
                </button>
              )}
              <button 
                onClick={() => setIsTratamientoOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-colors"
              >
                Aplicar Tratamiento
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
              >
                Descargar PDF
              </button>
            </div>
          </div>

          {/* Dots Timeline (Mockups comentados para no confundir al usuario con datos falsos) */}
          {/*
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
          */}
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
              
              {alertaRetiro && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4 shadow-sm mb-6">
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-red-700 tracking-wide">RETIRO SANITARIO ACTIVO</h3>
                    <p className="text-sm font-medium text-red-600">
                      Fármaco: <span className="font-bold">{alertaRetiro.farmaco}</span> · Aplicado: <span className="font-bold">{alertaRetiro.aplicado}</span> · Liberación: <span className="font-bold">{alertaRetiro.liberacion}</span> · Días restantes: <span className="font-bold">{alertaRetiro.diasRestantes}</span>
                    </p>
                    <p className="text-[13px] text-red-500/80">⚠ Leche y/o carne no comercializable hasta la fecha de liberación.</p>
                  </div>
                </div>
              )}

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
                      <div className="font-bold text-navy text-base">
                        {animal.madre ? `Matriz #${animal.madre.areteInterno} ${animal.madre.nombre || ''}` : (animal.madreId ? `Matriz (ID: ${animal.madreId})` : 'No registrada')}
                      </div>
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

              {/* Línea de Tiempo Gestación - Solo Hembras */}
              {!isMacho && (
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
                        <div className="font-bold text-slate-600 text-sm">FPP (Día {animal?.raza?.dias_gestacion || 280})</div>
                        <div className="text-xs text-slate-400 mt-0.5">15/10/2026</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              )}

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
                      <th className="p-4">{isMacho ? 'Días Retiro (Carne)' : 'Retiro Leche'}</th>
                      <th className="p-4">Fecha Liberación</th>
                      <th className="p-4 pr-6 sm:pr-8 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    {tratamientos?.map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 sm:pl-8">{new Date(t.fecha).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-navy">{t.farmaco}</td>
                        <td className="p-4">{t.diagnostico}</td>
                        <td className="p-4">{t.dosis}</td>
                        <td className="p-4">{t.via}</td>
                        <td className="p-4 text-sky-600">{t.veterinario || '-'}</td>
                        <td className="p-4 font-bold text-red-600">{t.diasRetiro}d</td>
                        <td className="p-4">
                          {(() => {
                            if (!t.diasRetiro) return '-';
                            const date = new Date(t.fecha);
                            date.setDate(date.getDate() + t.diasRetiro);
                            return date.toLocaleDateString();
                          })()}
                        </td>
                        <td className="p-4 pr-6 sm:pr-8 text-right space-x-3">
                          {t.documentoUrl && (
                            <a 
                              href={t.documentoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 transition-colors inline-block"
                              title="Ver documento"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setTratamientoSeleccionado(t);
                              setIsTratamientoOpen(true);
                            }}
                            className="text-slate-400 hover:text-blue-600 transition-colors inline-block"
                            title="Editar tratamiento"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!tratamientos || tratamientos.length === 0) && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          No hay tratamientos registrados
                        </td>
                      </tr>
                    )}
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
                    {(Array.isArray(estadoReproductivo) ? estadoReproductivo : estadoReproductivo?.servicios || [])?.map((s: any) => {
                      const fechaServicio = new Date(s.fecha);
                      const fpp = new Date(fechaServicio);
                      fpp.setDate(fpp.getDate() + 283);
                      const fechaParto = new Date(fechaServicio.getTime() + (animal.raza?.dias_gestacion || 283) * 24 * 60 * 60 * 1000);
                      const palpacion = new Date(fechaServicio);
                      palpacion.setDate(palpacion.getDate() + 40);

                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 sm:pl-8">{fechaServicio.toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{s.tipoServicio}</span>
                          </td>
                          <td className="p-4">{s.semental || '-'}</td>
                          <td className="p-4 text-sky-600">{s.inseminador || '-'}</td>
                          <td className="p-4">{s.potrero || '-'}</td>
                          <td className="p-4 font-bold text-green-600">{fpp.toLocaleDateString()}</td>
                          <td className="p-4 font-bold text-orange-500">
                            {s.fechaPalpacion ? new Date(new Date(s.fechaPalpacion).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString() : palpacion.toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className={`px-2 py-1 border rounded-lg text-[10px] font-bold uppercase tracking-wide inline-block ${
                                !s.estadoPalpacion || s.estadoPalpacion === 'Por Confirmar' ? 'bg-slate-50 border-slate-200 text-slate-500' :
                                s.estadoPalpacion === 'Gestante' ? 'bg-green-50 border-green-200 text-green-600' :
                                'bg-red-50 border-red-200 text-red-600'
                              }`}>
                              {s.estadoPalpacion || 'Por Confirmar'}
                            </div>
                          </td>
                          <td className="p-4 pr-6 sm:pr-8 text-slate-400 truncate max-w-[150px]">{s.observaciones || '-'}</td>
                        </tr>
                      );
                    })}
                    {(!(Array.isArray(estadoReproductivo) ? estadoReproductivo : estadoReproductivo?.servicios) || (Array.isArray(estadoReproductivo) ? estadoReproductivo : estadoReproductivo?.servicios).length === 0) && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          No hay servicios registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'produccion' && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!isMacho && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-navy mb-4">Curva de Lactancia (L/día)</h3>
                    <div className="h-48 w-full">
                    {pesajes && pesajes.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        {/* design-exception: Recharts requiere valores estáticos/hex para sus props */}
                        <LineChart data={[...pesajes].reverse()} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="fecha" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelFormatter={(val: any) => new Date(val).toLocaleDateString()} />
                          <Line type="monotone" dataKey={(p) => (Number(p.lecheMananaL) || 0) + (Number(p.lecheTardeL) || 0)} stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: '#0284c7', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#0284c7' }} name="Total Leche (L)" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Sin datos de lactancia</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-navy mb-4">Evolución de Peso (kg)</h3>
                  <div className="h-48 w-full">
                    {pesajes && pesajes.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        {/* design-exception: Recharts requiere valores estáticos/hex para sus props */}
                        <LineChart data={[...pesajes].reverse()} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="fecha" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'auto']} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelFormatter={(val: any) => new Date(val).toLocaleDateString()} />
                          <Line type="monotone" dataKey={(p) => Number(p.pesoActualKg) || 0} stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#10b981' }} name="Peso (kg)" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Sin datos de peso</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy">
                    {isMacho ? 'Historial de Pesajes' : 'Historial de Pesajes y Producción'}
                  </h3>
                  <button 
                    onClick={() => setIsPesajeOpen(true)}
                    className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold shadow-sm hover:bg-navy-light transition-colors"
                  >
                    + Registrar Pesaje
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {pesajes && pesajes.length > 0 && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3">Fecha</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3">Peso (kg)</span>
                        {!isMacho && (
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3 text-right">Leche Total (L)</span>
                        )}
                      </div>
                    )}
                    {pesajes?.map((p: any) => {
                      const totalLeche = (Number(p.lecheMananaL) || 0) + (Number(p.lecheTardeL) || 0);
                      return (
                        <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-sm text-slate-500 w-1/3">{new Date(p.fecha).toLocaleDateString()}</span>
                          <span className="text-sm font-bold text-navy w-1/3">{p.pesoActualKg ? `${p.pesoActualKg} kg` : '-'}</span>
                          {!isMacho && (
                            <span className="text-sm font-bold text-green-600 w-1/3 text-right">
                              {totalLeche > 0 ? `${totalLeche.toFixed(1)} L` : '-'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {(!pesajes || pesajes.length === 0) && (
                      <div className="py-8 text-center text-slate-400 text-sm">
                        No hay pesajes registrados
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy">Documentos del Animal</h3>
                <button 
                  onClick={() => setIsDocumentoOpen(true)}
                  className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold shadow-sm hover:bg-navy-light transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Documento
                </button>
              </div>
              <div className="p-6">
                {!documentosDocumentos || documentosDocumentos.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <p className="text-sm">No hay documentos registrados</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {documentosDocumentos.map((doc: any) => (
                      <div key={doc.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="w-10 h-10 rounded-lg bg-navy/5 border border-navy/10 flex items-center justify-center text-navy mb-4">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <h4 className="font-bold text-navy text-sm mb-1">{doc.tipo}</h4>
                          <p className="text-xs text-slate-400">
                            Cargado el {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <a 
                            href={doc.archivoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all"
                          >
                            <Download className="w-3 h-3" />
                            Ver / Descargar
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalEditarAnimal 
        isOpen={isEditarAnimalOpen}
        onClose={() => setIsEditarAnimalOpen(false)}
        animal={animal}
      />

      <ModalPesaje 
        isOpen={isPesajeOpen} 
        onClose={() => setIsPesajeOpen(false)} 
        onSubmit={(data) => pesajeMutation.mutate(data)} 
        animalSexo={animal?.sexo}
      />
      <ModalServicio 
        isOpen={isServicioOpen} 
        onClose={() => setIsServicioOpen(false)} 
        onSubmit={(data) => servicioMutation.mutate(data)} 
      />
      <ModalTratamiento 
        isOpen={isTratamientoOpen} 
        onClose={() => {
          setIsTratamientoOpen(false);
          setTratamientoSeleccionado(null);
        }} 
        initialData={tratamientoSeleccionado}
        animalSexo={animal?.sexo}
        onSubmit={(data) => {
          if (tratamientoSeleccionado) {
            updateTratamientoMutation.mutate({ id: tratamientoSeleccionado.id, data });
          } else {
            tratamientoMutation.mutate(data);
          }
        }} 
      />
      <ModalEditarOrigen 
        isOpen={isOrigenOpen} 
        onClose={() => setIsOrigenOpen(false)}
        animal={animal}
        onSubmit={(data) => {
          updateAnimalMutation.mutate({
            origen: data.origen,
            padreId: data.padre || null,
            madreId: data.madre || null,
            compradoA: data.compradoA || null,
            fechaCompra: data.fechaCompra || null,
            valorCompraCrc: data.valorCompraCrc || null,
            numeroGuia: data.numeroGuia || null,
          });
        }} 
      />
      <ModalDocumento
        isOpen={isDocumentoOpen}
        onClose={() => setIsDocumentoOpen(false)}
        onSubmit={handleDocumentSubmit}
        isUploading={isUploadingDoc}
      />
      
      {isEditarAnimalOpen && (
        <ModalEditarAnimal 
          isOpen={isEditarAnimalOpen} 
          onClose={() => setIsEditarAnimalOpen(false)} 
          animal={animal} 
        />
      )}
      
      {isBajaOpen && (
        <ModalDarBaja 
          isOpen={isBajaOpen} 
          onClose={() => setIsBajaOpen(false)} 
          animal={animal} 
        />
      )}

    </div>
  );
}
