'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Upload, Link as LinkIcon, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  getMedicamentos,
  getPadecimientos,
  calcularFechaLiberacion,
  formatearFecha,
  type Medicamento,
  type Padecimiento,
} from '@/lib/api/sanitary';

interface ModalTratamientoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any | null;
  animalSexo?: string;
}

export default function ModalTratamiento({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  animalSexo,
}: ModalTratamientoProps) {
  const [formData, setFormData] = useState({
    farmaco: '',
    dosis: '',
    via: 'Intramuscular',
    fecha: '',
    diagnostico: '',
    veterinario: '',
    dias_retiro_leche: '0',
    dias_retiro_carne: '0',
    documentoUrl: '',
  });

  const [customFarmaco, setCustomFarmaco] = useState('');
  const [customDiagnostico, setCustomDiagnostico] = useState('');
  const [sugerenciaActiva, setSugerenciaActiva] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Carga reactiva de catálogos desde el backend
  const { data: medicamentos = [], isLoading: loadingMedicamentos } = useQuery({
    queryKey: ['catalogos', 'medicamentos'],
    queryFn: getMedicamentos,
    staleTime: 1000 * 60 * 30, // 30 minutos
    enabled: isOpen,
  });

  const { data: padecimientos = [], isLoading: loadingPadecimientos } = useQuery({
    queryKey: ['catalogos', 'padecimientos'],
    queryFn: getPadecimientos,
    staleTime: 1000 * 60 * 30,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const isCustomFarmaco =
          initialData.farmaco &&
          !medicamentos.some(m => m.nombreComercial === initialData.farmaco);
        const isCustomDiagnostico =
          initialData.diagnostico &&
          !padecimientos.some(p => p.nombre === initialData.diagnostico);

        setFormData({
          farmaco: isCustomFarmaco ? 'Otro' : (initialData.farmaco || ''),
          dosis: initialData.dosis || '',
          via: initialData.via || 'Intramuscular',
          fecha: initialData.fecha
            ? new Date(initialData.fecha).toISOString().split('T')[0]
            : '',
          diagnostico: isCustomDiagnostico ? 'Otro' : (initialData.diagnostico || ''),
          veterinario: initialData.veterinario || '',
          dias_retiro_leche: (initialData.diasRetiroLeche ?? initialData.diasRetiro ?? 0).toString(),
          dias_retiro_carne: (initialData.diasRetiroCarne ?? initialData.diasRetiro ?? 0).toString(),
          documentoUrl: initialData.documentoUrl || '',
        });
        setCustomFarmaco(isCustomFarmaco ? initialData.farmaco : '');
        setCustomDiagnostico(isCustomDiagnostico ? initialData.diagnostico : '');
        setSugerenciaActiva(null);
      } else {
        setFormData({
          farmaco: '',
          dosis: '',
          via: 'Intramuscular',
          fecha: new Date().toISOString().split('T')[0],
          diagnostico: '',
          veterinario: '',
          dias_retiro_leche: '0',
          dias_retiro_carne: '0',
          documentoUrl: '',
        });
        setCustomFarmaco('');
        setCustomDiagnostico('');
        setSugerenciaActiva(null);
      }
      setFile(null);
    }
  }, [isOpen, initialData, medicamentos, padecimientos]);

  // Manejador de cambio de padecimiento con sugerencia de medicamento
  const handleDiagnosticoChange = (diagnosticoSeleccionado: string) => {
    setFormData(prev => ({
      ...prev,
      diagnostico: diagnosticoSeleccionado,
    }));

    if (diagnosticoSeleccionado === 'Otro' || !diagnosticoSeleccionado) {
      setSugerenciaActiva(null);
      return;
    }

    const pad = padecimientos.find(p => p.nombre === diagnosticoSeleccionado);
    if (pad?.medicamentoSugeridoId) {
      const medSugerido = medicamentos.find(m => m.id === pad.medicamentoSugeridoId);
      if (medSugerido) {
        setSugerenciaActiva(medSugerido.nombreComercial);
        setFormData(prev => ({
          ...prev,
          diagnostico: diagnosticoSeleccionado,
          farmaco: medSugerido.nombreComercial,
          via: medSugerido.viaAdministracion || prev.via,
          dias_retiro_leche: medSugerido.diasRetiroLecheDefault.toString(),
          dias_retiro_carne: medSugerido.diasRetiroCarneDefault.toString(),
        }));
        return;
      }
    }
    setSugerenciaActiva(null);
  };

  // Manejador de cambio directo de fármaco
  const handleFarmacoChange = (farmacoSeleccionado: string) => {
    setFormData(prev => ({
      ...prev,
      farmaco: farmacoSeleccionado,
    }));

    if (farmacoSeleccionado === 'Otro' || !farmacoSeleccionado) {
      return;
    }

    const med = medicamentos.find(m => m.nombreComercial === farmacoSeleccionado);
    if (med) {
      setFormData(prev => ({
        ...prev,
        farmaco: farmacoSeleccionado,
        via: med.viaAdministracion || prev.via,
        dias_retiro_leche: med.diasRetiroLecheDefault.toString(),
        dias_retiro_carne: med.diasRetiroCarneDefault.toString(),
      }));
    }
  };

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
          .from('documentos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('documentos').getPublicUrl(filePath);

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
    const diasLeche = Number(formData.dias_retiro_leche) || 0;
    const diasCarne = Number(formData.dias_retiro_carne) || 0;
    const diasMayor = Math.max(diasLeche, diasCarne);

    onSubmit({
      ...formData,
      farmaco: finalFarmaco,
      diagnostico: finalDiagnostico,
      diasRetiro: diasMayor,
      diasRetiroLeche: diasLeche,
      diasRetiroCarne: diasCarne,
      dias_retiro: diasMayor,
      documentoUrl: finalDocumentoUrl,
    });
    onClose();
  };

  const isEditing = !!initialData;
  const fechaLiberacionLeche = calcularFechaLiberacion(formData.fecha, Number(formData.dias_retiro_leche) || 0);
  const fechaLiberacionCarne = calcularFechaLiberacion(formData.fecha, Number(formData.dias_retiro_carne) || 0);
  const tieneRetiroActivo = (Number(formData.dias_retiro_leche) || 0) > 0 || (Number(formData.dias_retiro_carne) || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-surface">
          <div>
            <h2 className="text-lg font-bold text-navy">
              {isEditing ? 'Editar Tratamiento Veterinario' : 'Registrar Tratamiento Veterinario'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocolo sanitario oficial con cálculo de retiros en leche y carne
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Diagnóstico / Padecimiento */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">
                Diagnóstico / Padecimiento *
              </label>
              <div className="space-y-2">
                <select
                  required
                  disabled={loadingPadecimientos}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
                  value={formData.diagnostico}
                  onChange={e => handleDiagnosticoChange(e.target.value)}
                >
                  <option value="">
                    {loadingPadecimientos ? 'Cargando padecimientos...' : '— Seleccione diagnóstico —'}
                  </option>
                  {padecimientos.map((pad: Padecimiento) => (
                    <option key={pad.id} value={pad.nombre}>
                      {pad.nombre} {pad.categoria ? `(${pad.categoria})` : ''}
                    </option>
                  ))}
                  <option value="Otro">Otro (personalizado)</option>
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

            {/* Medicamento / Fármaco */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-navy">Fármaco *</label>
                {sugerenciaActiva && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-info bg-info-bg px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-info" /> Sugerido
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <select
                  required
                  disabled={loadingMedicamentos}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
                  value={formData.farmaco}
                  onChange={e => handleFarmacoChange(e.target.value)}
                >
                  <option value="">
                    {loadingMedicamentos ? 'Cargando medicamentos...' : '— Seleccione medicamento —'}
                  </option>
                  {medicamentos.map((med: Medicamento) => (
                    <option key={med.id} value={med.nombreComercial}>
                      {med.nombreComercial} {med.principioActivo ? `(${med.principioActivo})` : ''}
                    </option>
                  ))}
                  <option value="Otro">Otro (personalizado)</option>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dosis */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Dosis *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700"
                value={formData.dosis}
                onChange={e => setFormData({ ...formData, dosis: e.target.value })}
                placeholder="ej. 20 ml, 1 jeringa"
              />
            </div>

            {/* Vía */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Vía de Administración</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
                value={formData.via}
                onChange={e => setFormData({ ...formData, via: e.target.value })}
              >
                <option value="Intramuscular">Intramuscular</option>
                <option value="Subcutánea">Subcutánea</option>
                <option value="Intravenosa">Intravenosa</option>
                <option value="Oral">Oral</option>
                <option value="Tópica">Tópica</option>
                {animalSexo !== 'Macho' && <option value="Intramamaria">Intramamaria</option>}
              </select>
            </div>

            {/* Fecha de Aplicación */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Fecha de Aplicación *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700"
                value={formData.fecha}
                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Veterinario */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Médico Veterinario</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700"
                value={formData.veterinario}
                onChange={e => setFormData({ ...formData, veterinario: e.target.value })}
                placeholder="Dr. Carlos Murillo"
              />
            </div>

            {/* Días Retiro Leche */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">
                Retiro Leche (días) *
              </label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 font-bold"
                value={formData.dias_retiro_leche}
                onChange={e => setFormData({ ...formData, dias_retiro_leche: e.target.value })}
              />
              <span className="text-[11px] text-slate-500 block">Días según catálogo o receta</span>
            </div>

            {/* Días Retiro Carne */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">
                Retiro Carne (días) *
              </label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 font-bold"
                value={formData.dias_retiro_carne}
                onChange={e => setFormData({ ...formData, dias_retiro_carne: e.target.value })}
              />
              <span className="text-[11px] text-slate-500 block">Días según catálogo o receta</span>
            </div>
          </div>

          {/* Previsualizador en tiempo real de liberación */}
          {tieneRetiroActivo && (
            <div className="p-4 bg-danger-bg border border-danger/30 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                <span className="text-xs font-bold text-danger uppercase tracking-wider">
                  Impacto Calculado de Retiro Sanitario
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="bg-white/70 p-2.5 rounded-lg border border-danger/20">
                  <span className="text-slate-600 block">Liberación para ordeño (Leche):</span>
                  <span className="font-bold text-danger text-sm">
                    {formatearFecha(fechaLiberacionLeche)}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    ({formData.dias_retiro_leche} días post-aplicación)
                  </span>
                </div>
                <div className="bg-white/70 p-2.5 rounded-lg border border-danger/20">
                  <span className="text-slate-600 block">Liberación para consumo/venta (Carne):</span>
                  <span className="font-bold text-danger text-sm">
                    {formatearFecha(fechaLiberacionCarne)}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    ({formData.dias_retiro_carne} días post-aplicación)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sección de documento adjunto */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-sm font-semibold text-navy mb-2">
              Receta o Boleta Adjunta (Opcional)
            </label>

            {formData.documentoUrl && !file && (
              <div className="flex items-center gap-2 mb-3 p-3 bg-info-bg text-info rounded-lg text-sm">
                <LinkIcon className="w-4 h-4" />
                <a
                  href={formData.documentoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex-1 truncate font-medium"
                >
                  Ver comprobante adjunto actual
                </a>
              </div>
            )}

            <div className="relative">
              <input
                type="file"
                className="hidden"
                id="document-upload"
                onChange={e => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="document-upload"
                className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <Upload className="w-5 h-5 mb-1 text-slate-400" />
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-navy">Haga clic para subir</span> comprobante o receta
                  </p>
                  <p className="text-[11px] text-slate-400">PDF, PNG, JPG (Máx. 5MB)</p>
                </div>
              </label>
            </div>
            {file && (
              <p className="text-xs text-success mt-2 flex items-center font-medium">
                <span className="truncate">{file.name}</span> seleccionado
              </p>
            )}
          </div>

          {/* Botones de acción */}
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
              className="px-5 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-danger/90 shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center min-w-[150px]"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : isEditing ? (
                'Guardar Cambios'
              ) : (
                'Aplicar Tratamiento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
