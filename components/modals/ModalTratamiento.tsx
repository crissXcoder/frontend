'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BUCKET_DOCUMENTOS } from '@/lib/supabase/buckets';

interface ModalTratamientoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any | null;
  animalSexo?: string;
}

export default function ModalTratamiento({ isOpen, onClose, onSubmit, initialData, animalSexo }: ModalTratamientoProps) {
  const [formData, setFormData] = useState({
    farmaco: '',
    dosis: '',
    via: 'Intramuscular',
    fecha: '',
    diagnostico: '',
    veterinario: '',
    dias_retiro: '0',
    documentoUrl: '',
  });

  const [customFarmaco, setCustomFarmaco] = useState('');
  const [customDiagnostico, setCustomDiagnostico] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const OPTIONS_FARMACO = ['Cefalexina 200 Intramamaria', 'Ivermectina 1%', 'Oxitetraciclina LA', 'Vitamina ADE'];
  const OPTIONS_DIAGNOSTICO = ['Parásitos Internos', 'Prevención/Vitaminas', 'Neumonía'];
  if (animalSexo !== 'Macho') {
    OPTIONS_DIAGNOSTICO.unshift('Mastitis Clínica');
  }

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const isCustomFarmaco = initialData.farmaco && !OPTIONS_FARMACO.includes(initialData.farmaco);
        const isCustomDiagnostico = initialData.diagnostico && !OPTIONS_DIAGNOSTICO.includes(initialData.diagnostico);

        setFormData({
          farmaco: isCustomFarmaco ? 'Otro' : (initialData.farmaco || ''),
          dosis: initialData.dosis || '',
          via: initialData.via || 'Intramuscular',
          fecha: initialData.fecha ? new Date(initialData.fecha).toISOString().split('T')[0] : '',
          diagnostico: isCustomDiagnostico ? 'Otro' : (initialData.diagnostico || ''),
          veterinario: initialData.veterinario || '',
          dias_retiro: initialData.diasRetiro?.toString() || '0',
          documentoUrl: initialData.documentoUrl || '',
        });
        setCustomFarmaco(isCustomFarmaco ? initialData.farmaco : '');
        setCustomDiagnostico(isCustomDiagnostico ? initialData.diagnostico : '');
      } else {
        setFormData({
          farmaco: '',
          dosis: '',
          via: 'Intramuscular',
          fecha: new Date().toISOString().split('T')[0],
          diagnostico: '',
          veterinario: '',
          dias_retiro: '0',
          documentoUrl: '',
        });
        setCustomFarmaco('');
        setCustomDiagnostico('');
      }
      setFile(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalDocumentoUrl = formData.documentoUrl;

    if (file) {
      setIsUploading(true);
      try {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `tratamientos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_DOCUMENTOS)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_DOCUMENTOS)
          .getPublicUrl(filePath);

        finalDocumentoUrl = publicUrl;
      } catch (error) {
        console.error('Error uploading document:', error);
        alert('Error al subir el documento. Por favor intente de nuevo.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const finalFarmaco = formData.farmaco === 'Otro' ? customFarmaco : formData.farmaco;
    const finalDiagnostico = formData.diagnostico === 'Otro' ? customDiagnostico : formData.diagnostico;

    onSubmit({ 
      ...formData, 
      farmaco: finalFarmaco,
      diagnostico: finalDiagnostico,
      documentoUrl: finalDocumentoUrl 
    });
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-navy">
            {isEditing ? 'Editar Tratamiento Médico' : 'Aplicar Tratamiento Médico'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Fármaco *</label>
              <div className="space-y-2">
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
                  value={formData.farmaco}
                  onChange={e => setFormData({ ...formData, farmaco: e.target.value })}
                >
                  <option value="">— Seleccione medicamento —</option>
                  {OPTIONS_FARMACO.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="Otro">Otro</option>
                </select>
                {formData.farmaco === 'Otro' && (
                  <input
                    type="text"
                    required
                    placeholder="Especifique el fármaco"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                    value={customFarmaco}
                    onChange={e => setCustomFarmaco(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Diagnóstico *</label>
              <div className="space-y-2">
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
                  value={formData.diagnostico}
                  onChange={e => setFormData({ ...formData, diagnostico: e.target.value })}
                >
                  <option value="">— Seleccione diagnóstico —</option>
                  {OPTIONS_DIAGNOSTICO.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="Otro">Otro</option>
                </select>
                {formData.diagnostico === 'Otro' && (
                  <input
                    type="text"
                    required
                    placeholder="Especifique el diagnóstico"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                    value={customDiagnostico}
                    onChange={e => setCustomDiagnostico(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Dosis *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                value={formData.dosis}
                onChange={e => setFormData({ ...formData, dosis: e.target.value })}
                placeholder="20ml"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Vía</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
                value={formData.via}
                onChange={e => setFormData({ ...formData, via: e.target.value })}
              >
                <option value="Intramuscular">Intramuscular</option>
                <option value="Subcutánea">Subcutánea</option>
                <option value="Intravenosa">Intravenosa</option>
                <option value="Oral">Oral</option>
                {animalSexo !== 'Macho' && <option value="Intramamaria">Intramamaria</option>}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Fecha de Aplicación</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700"
                value={formData.fecha}
                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Médico Veterinario</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                value={formData.veterinario}
                onChange={e => setFormData({ ...formData, veterinario: e.target.value })}
                placeholder="Dr. Ramírez"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">
                {animalSexo === 'Macho' ? 'Días Retiro (Carne)' : 'Días Retiro Leche'}
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                value={formData.dias_retiro}
                onChange={e => setFormData({ ...formData, dias_retiro: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Sección de documento */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-semibold text-navy mb-2">Documento Adjunto (Opcional)</label>
            
            {formData.documentoUrl && !file && (
              <div className="flex items-center gap-2 mb-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <LinkIcon className="w-4 h-4" />
                <a href={formData.documentoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex-1 truncate">
                  Ver documento actual
                </a>
              </div>
            )}

            <div className="relative">
              <input
                type="file"
                className="hidden"
                id="document-upload"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="document-upload"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-3 pb-4">
                  <Upload className="w-6 h-6 mb-2 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold text-navy">Haga clic para subir</span> o arrastre y suelte
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG (Max. 5MB)</p>
                </div>
              </label>
            </div>
            {file && (
              <p className="text-sm text-green-600 mt-2 flex items-center font-medium">
                <span className="truncate">{file.name}</span> seleccionado
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isEditing ? 'Guardar Cambios' : 'Aplicar Tratamiento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
