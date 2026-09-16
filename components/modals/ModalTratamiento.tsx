'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ModalTratamientoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ModalTratamiento({ isOpen, onClose, onSubmit }: ModalTratamientoProps) {
  const [formData, setFormData] = useState({
    farmaco: '',
    dosis: '',
    via: 'Intramuscular',
    fecha: '',
    diagnostico: '',
    veterinario: '',
    dias_retiro: '0',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-navy">Aplicar Tratamiento Médico</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-navy">Fármaco *</label>
            <select
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
              value={formData.farmaco}
              onChange={e => setFormData({ ...formData, farmaco: e.target.value })}
            >
              <option value="">— Seleccione medicamento —</option>
              <option value="Cefalexina 200 Intramamaria">Cefalexina 200 Intramamaria</option>
              <option value="Ivermectina 1%">Ivermectina 1%</option>
              <option value="Oxitetraciclina LA">Oxitetraciclina LA</option>
              <option value="Vitamina ADE">Vitamina ADE</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                <option value="Intramamaria">Intramamaria</option>
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
            <div className="hidden sm:block"></div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-navy">Diagnóstico *</label>
            <select
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
              value={formData.diagnostico}
              onChange={e => setFormData({ ...formData, diagnostico: e.target.value })}
            >
              <option value="">— Seleccione diagnóstico —</option>
              <option value="Mastitis Clínica">Mastitis Clínica</option>
              <option value="Parásitos Internos">Parásitos Internos</option>
              <option value="Prevención/Vitaminas">Prevención/Vitaminas</option>
              <option value="Neumonía">Neumonía</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <label className="block text-sm font-semibold text-navy">Días Retiro Leche</label>
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Aplicar Tratamiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
