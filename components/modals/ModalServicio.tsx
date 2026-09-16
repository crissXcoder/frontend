'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ModalServicioProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ModalServicio({ isOpen, onClose, onSubmit }: ModalServicioProps) {
  const [formData, setFormData] = useState({
    tipo_servicio: 'Inseminación Artificial',
    fecha: '',
    semental: '',
    inseminador: '',
    potrero: '',
    observaciones: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-navy">Registrar Celo / Servicio</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Tipo de Servicio</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700 bg-white"
                value={formData.tipo_servicio}
                onChange={e => setFormData({ ...formData, tipo_servicio: e.target.value })}
              >
                <option value="Inseminación Artificial">Inseminación Artificial</option>
                <option value="Monta Natural">Monta Natural</option>
                <option value="Transferencia de Embriones">Transferencia de Embriones</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Fecha de Servicio *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light text-slate-700"
                value={formData.fecha}
                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Semental / ID Pajilla *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                value={formData.semental}
                onChange={e => setFormData({ ...formData, semental: e.target.value })}
                placeholder="Titan #001 (Holstein)"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Inseminador / Responsable</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                value={formData.inseminador}
                onChange={e => setFormData({ ...formData, inseminador: e.target.value })}
                placeholder="Téc. Garcia"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Potrero</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                value={formData.potrero}
                onChange={e => setFormData({ ...formData, potrero: e.target.value })}
                placeholder="Potrero #4"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-navy">Observaciones</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
                value={formData.observaciones}
                onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Notas..."
              />
            </div>
          </div>

          {formData.fecha && (
            <div className="bg-[#EEF4FF] border border-[#D5E4FF] rounded-xl p-4 mt-2">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wide mb-3">Hitos Calculados Automáticamente</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-2.5 text-center border border-white/60 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Palpación (Día 40)</span>
                  <span className="block text-sm font-bold text-orange-500 mt-1">
                    {new Date(new Date(formData.fecha).getTime() + 40 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center border border-white/60 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Secado (Mes 7)</span>
                  <span className="block text-sm font-bold text-purple-500 mt-1">
                    {new Date(new Date(formData.fecha).getTime() + 210 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center border border-white/60 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Aviso Parto (-15d)</span>
                  <span className="block text-sm font-bold text-red-500 mt-1">
                    {new Date(new Date(formData.fecha).getTime() + 268 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center border border-white/60 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">FPP (Día 283)</span>
                  <span className="block text-sm font-bold text-green-500 mt-1">
                    {new Date(new Date(formData.fecha).getTime() + 283 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

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
              Registrar y Programar Alertas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
