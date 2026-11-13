import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingCart, 
  Sprout, 
  Receipt, 
  ClipboardList,
  Leaf
} from 'lucide-react';

export default function Sidebar({ activeMenu, setActiveMenu, criticalCount }) {
  const menuLaporan = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'laporan', label: 'Laporan & Analisis', icon: TrendingUp },
  ];

  const menuInventaris = [
    { id: 'beli', label: 'Beli Pupuk', icon: ShoppingCart },
    { id: 'pemakaian', label: 'Pemakaian Pupuk', icon: Sprout },
    { id: 'riwayat-beli', label: 'Riwayat Pembelian', icon: Receipt },
    { id: 'riwayat-pakai', label: 'Riwayat Pemakaian', icon: ClipboardList },
  ];

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-white/70 backdrop-blur-xl border-r border-slate-200/80 p-5 flex flex-col justify-between select-none">
      <div>
        {/* Brand Logo PupukLog */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
              Pupuk<span className="text-emerald-600">Log</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400">Sistem Informasi Manajemen</p>
          </div>
        </div>

        {/* Grup Menu 1: Laporan & Analisis */}
        <div className="mb-6">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Laporan & Analisis
          </p>
          <div className="space-y-1">
            {menuLaporan.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grup Menu 2: Inventaris & Stok */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Inventaris & Stok
            </p>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full animate-pulse">
                {criticalCount} Kritis
              </span>
            )}
          </div>
          <div className="space-y-1">
            {menuInventaris.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Footer Sidebar */}
      <div className="pt-4 border-t border-slate-200/60 px-2 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-600">SIM Pupuk — Kelompok 3</p>
        <p>Vibe Coding with Supabase</p>
      </div>
    </aside>
  );
}
