'use client';

import React from 'react';
import { Menu } from 'lucide-react';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        {/* Espacio para Search / Acciones que en este caso estarán en cada página según requerimiento */}
        <div className="flex-1"></div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-navy">Administrador</p>
            <p className="text-xs text-slate-500">Finca San Martín</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
