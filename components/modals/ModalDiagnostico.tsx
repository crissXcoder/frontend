'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ModalDiagnosticoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  eventoServicioId: string;
}

export default function ModalDiagnostico({ isOpen, onClose, onSubmit, eventoServicioId }: ModalDiagnosticoProps) {
  const [formData, setFormData] = useState({
    fechaEvento: new Date().toISOString().slice(0, 10),
    metodo: 'Palpación',
    resultado: 'Preñada',
    notas: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      eventoServicioId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-navy">Confirmar Preñez (Diagnóstico)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Fecha de Confirmación *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700"
                value={formData.fechaEvento}
                onChange={e => setFormData({ ...formData, fechaEvento: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Método de Diagnóstico *</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
                value={formData.metodo}
                onChange={e => setFormData({ ...formData, metodo: e.target.value })}
              >
                <option value="Palpación">Palpación</option>
                <option value="Ecografía">Ecografía</option>
                <option value="PAG">PAG</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Resultado *</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
                value={formData.resultado}
                onChange={e => setFormData({ ...formData, resultado: e.target.value })}
              >
                <option value="Preñada">Preñada (Positivo)</option>
                <option value="Vacía">Vacía (Negativo)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Observaciones</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                value={formData.notas}
                onChange={e => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Notas..."
                rows={3}
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
              className="px-5 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
            >
              Registrar Confirmación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
