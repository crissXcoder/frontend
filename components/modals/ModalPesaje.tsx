'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ModalPesajeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ModalPesaje({ isOpen, onClose, onSubmit }: ModalPesajeProps) {
  const [formData, setFormData] = useState({
    fecha: '',
    peso_actual: '',
    leche_manana: '',
    leche_tarde: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-navy">Registrar Pesaje / Leche</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-navy">Fecha</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700"
              value={formData.fecha}
              onChange={e => setFormData({ ...formData, fecha: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-navy">Peso Actual (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
              value={formData.peso_actual}
              onChange={e => setFormData({ ...formData, peso_actual: e.target.value })}
              placeholder="Ej. 485"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Leche Mañana (L)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                value={formData.leche_manana}
                onChange={e => setFormData({ ...formData, leche_manana: e.target.value })}
                placeholder="8.5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Leche Tarde (L)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                value={formData.leche_tarde}
                onChange={e => setFormData({ ...formData, leche_tarde: e.target.value })}
                placeholder="5.0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
            >
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
